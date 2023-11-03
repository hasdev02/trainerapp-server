import { Request, Response } from "express";
import { changeNameValidation, changePasswordValidation } from "../libs/joi.js";
import Scrypt from "../libs/scrypt.js";
import prisma from "../database.js";
import { Session } from "@prisma/client";

export const changePassword = (req: Request, res: Response) => {
	const { currentPassword, newPassword } = req.body;
	const { error } = changePasswordValidation({ currentPassword, newPassword });

	if (error) return res.status(400).json({ message: "Invalid form" });

	prisma.user.findUnique({ where: { id: req.sessionData.id } }).then((user) => {
		if (!user) return res.status(404).json({ message: "user not found" });
		Scrypt.verify(currentPassword, user.password).then((correctPassword) => {
			if (!correctPassword) return res.status(401).json({ message: "wrong password" });

			Scrypt.hash(newPassword, 16).then((newPasswordHash) => {
				prisma.user
					.update({
						where: { id: req.sessionData.id },
						data: {
							password: newPasswordHash,
						},
					})
					.then(() => {
						res.status(200).json({ message: "OK" });
					})
					.catch(console.error);
			});
		});
	});
};

export const changeFullName = (req: Request, res: Response) => {
	const { name } = req.body;
	const { error } = changeNameValidation({ name });

	if (error) return res.status(400).json({ message: "Invalid form" });

	prisma.user.findUnique({ where: { id: req.sessionData.id } }).then((user) => {
		if (!user) return res.status(404).json({ message: "user not found" });

		prisma.user
			.update({
				where: { id: req.sessionData.id },
				data: {
					fullName: name,
				},
				select: {
					fullName: true,
				},
			})
			.then((user) => {
				res.status(200).json({ message: "OK", fullName: user.fullName });
			})
			.catch(console.error);
	});
};

export const getTraining = (req: Request, res: Response) => {
	prisma.user.findUnique({ where: { id: req.sessionData.id }, select: { train: true } }).then((user) => {
		if (!user) return res.status(404).json({ message: "user not found" });

		res.status(200).json({
			message: "OK",
			train: user.train,
		});
	});
};

export const getDiet = (req: Request, res: Response) => {
	prisma.user.findUnique({ where: { id: req.sessionData.id }, select: { dietPdf: true } }).then((user) => {
		if (!user) return res.status(404).json({ message: "user not found" });

		res.status(200).json({
			message: "OK",
			size: user.dietPdf ? user.dietPdf.length : 0,
		});
	});
};

export const getDietPdf = (req: Request, res: Response) => {
	prisma.user.findUnique({ where: { id: req.sessionData.id }, select: { dietPdf: true } }).then((user) => {
		if (!user) return res.status(404).json({ message: "user not found" });

		if (user.dietPdf) {
			res.status(200);
			res.setHeader("Content-Type", "application/pdf");
			res.setHeader("Content-Length", user.dietPdf.length);
			res.write(user.dietPdf, "binary");
			res.end();
		} else {
			res.status(404).json({ message: "no diet pdf found" });
		}
	});
};

export const getSessions = (req: Request, res: Response) => {
	prisma.user.findUnique({ where: { id: req.sessionData.id }, select: { sessions: true } }).then((user) => {
		if (!user) return res.status(404).json({ message: "user not found" });

		if (user.sessions) {
			const sessions = user.sessions
				.filter((session) => session.token != req.cookies["refreshToken"])
				.map((session) => {
					const noTokenSession: Omit<Omit<Session, "token"> & { token?: string }, "userId"> & { userId?: number } = session;
					delete noTokenSession.token;
					delete noTokenSession.userId;
					return noTokenSession;
				});
			res.status(200).json(sessions);
		} else {
			res.status(404).json({ message: "no sessions found" });
		}
	});
};
