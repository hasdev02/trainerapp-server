import { NextFunction, Response, Request as ExpressRequest } from "express";
import prisma from "../database.js";
import { loginValidation, registerValidation } from "../libs/joi.js";
import scrypt from "../libs/scrypt.js";
import { Request } from "express-jwt";
import jwt from "jsonwebtoken";
import { Role, Subscription, User } from "@prisma/client";
import crypto from "crypto";

interface SessionData {
	id: number;
	role: Role;
	subscription: Subscription;
	fullName: string;
	email: string;
}

declare global {
	namespace Express {
		export interface Request {
			sessionData: SessionData;
		}
	}
}

const noVerifyPaths = ["/auth/login", "/auth/register", "/auth/token"];
export const verifyToken = (req: ExpressRequest, res: Response, next: NextFunction) => {
	if (noVerifyPaths.includes(req.path)) return next();
	const tokenStr = req.headers.authorization;
	if (!tokenStr) return res.status(498).json({});

	const token = tokenStr.substring(7, tokenStr.length);

	jwt.verify(token, process.env.jwtSecret as string, (err, decoded) => {
		if (err) return res.status(498).json({});

		req.sessionData = decoded as SessionData;
		next();
	});
};

const generateAccessToken = (user: User) => {
	let subscription: Subscription = user.subscription;

	if (user.subscriptionEnd.getTime() < Date.now()) {
		subscription = "INACTIVE";
	}

	return jwt.sign(
		{
			id: user.id,
			role: user.role,
			subscription: subscription,
			fullName: user.fullName,
			email: user.email,
		},
		process.env.jwtSecret as string,
		{ expiresIn: "2m" },
	);
};

export const refreshAccessToken = async (req: ExpressRequest, res: Response, next: NextFunction) => {
	const refreshToken = req.cookies["refreshToken"];

	if (!refreshToken) return res.status(400).json({});

	prisma.session
		.findFirst({
			where: {
				token: refreshToken,
			},
			select: {
				user: true,
			},
		})
		.then((result) => {
			if (result) {
				prisma.session.findFirst({ where: { token: refreshToken } }).then((result) => {
					if (!result) return;

					prisma.session
						.update({
							where: { id: result.id },
							data: {
								lastUse: new Date(),
							},
						})
						.then();
				});

				const { user } = result;

				const accessToken = generateAccessToken(user);

				return res.status(200).json({ accessToken });
			}

			return res.status(400).json({});
		});
};

export const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
	if (req.sessionData.role != "ADMIN") {
		res.status(400).json({ message: "Access denied" });
		return;
	}

	next();
};

export const ensureSubscription = (req: Request, res: Response, next: NextFunction) => {
	if (req.sessionData.subscription == "INACTIVE") {
		res.status(400).json({ message: "Access denied" });
		return;
	}

	next();
};

export const register = async (req: Request, res: Response) => {
	const { error } = registerValidation(req.body);
	if (error) {
		return res.status(400).json({ message: error.message });
	}

	const { fullName, email, password } = req.body;

	prisma.user.findUnique({ where: { email } }).then((emailExists) => {
		if (emailExists) return res.status(302).json({ message: "email exists" });

		scrypt.hash(password, 16).then((hash) => {
			const defaultDayDiet = { breakfast: "", lunch: "", meal: "", snack: "", dinner: "" };
			prisma.user
				.create({
					data: {
						fullName,
						email,
						password: hash,
						train: {
							monday: [],
							tuesday: [],
							wednesday: [],
							thursday: [],
							friday: [],
							saturday: [],
							sunday: [],
						},
						diet: {
							create: {
								monday: defaultDayDiet,
								tuesday: defaultDayDiet,
								wednesday: defaultDayDiet,
								thursday: defaultDayDiet,
								friday: defaultDayDiet,
								saturday: defaultDayDiet,
								sunday: defaultDayDiet,
							},
						},
					},
				})
				.then(() => {
					res.status(200).json({ message: "Sucess" });
				});
		});
	});
};

export const login = (req: Request, res: Response) => {
	const { error } = loginValidation(req.body);
	if (error) {
		console.log(error.message);

		return res.status(400).json({ message: error.message });
	}

	const { email, password, os, browser, deviceVendor, deviceModel, deviceType } = req.body;

	prisma.user
		.findUnique({
			where: { email },
		})
		.then((user) => {
			if (!user) return res.status(404).json({ message: "not found" });

			scrypt.verify(password, user.password).then((correctPassword) => {
				if (!correctPassword) return res.status(401).json({ message: "wrong password" });

				const refreshToken = crypto.randomUUID();

				prisma.session
					.create({
						data: {
							token: refreshToken,
							os,
							browser,
							deviceVendor,
							deviceModel,
							deviceType,
							userId: user.id,
						},
					})
					.then(() => {
						res.cookie("refreshToken", refreshToken, {
							secure: process.env.MODE == "production",
							httpOnly: true,
							domain: process.env.MODE == "production" ? ".domain.here" : undefined,
							expires: new Date(Date.now() + 31560000000), //1 year
						});

						const token = generateAccessToken(user);

						res.status(200).json({ message: "OK", token });
					});
			});
		});
};

export const logout = (req: Request, res: Response) => {
	const refreshToken = req.cookies["refreshToken"];

	if (refreshToken) {
		prisma.session
			.deleteMany({
				where: {
					token: refreshToken,
				},
			})
			.then();

		res.clearCookie("refreshToken");
	}

	res.status(200).json({});
};
