import { Request, Response } from "express";
import { setClientSubscriptionValidation } from "../libs/joi.js";
import prisma from "../database.js";

export const getClients = (req: Request, res: Response) => {
	prisma.user
		.findMany({
			select: {
				subscription: true,
				fullName: true,
				id: true,
				email: true,
			},
		})
		.then((clients) => {
			res.status(200).json({ message: "OK", clients });
		})
		.catch(console.error);
};

export const getClient = (req: Request, res: Response) => {
	const clientId = Number(req.params.id);
	if (!clientId) return res.status(400).json({ message: "No clientId" });

	prisma.user
		.findUnique({
			where: { id: clientId },
			select: {
				id: true,
				email: true,
				subscription: true,
				subscriptionEnd: true,
				fullName: true,
				train: true,
				diet: {
					select: {
						monday: true,
						tuesday: true,
						wednesday: true,
						thursday: true,
						friday: true,
						saturday: true,
						sunday: true,
					},
				},
			},
		})
		.then((client) => {
			if (!client) return res.status(404).json({ message: "Not found" });
			res.status(200).json({ message: "OK", client });
		})
		.catch(console.error);
};

export const setClientSubscription = async (req: Request, res: Response) => {
	const userId = Number(req.params.id);

	if (!userId) return res.status(400).json({ message: "No userid" });

	const { error } = setClientSubscriptionValidation(req.body);

	if (error) {
		return res.status(400).json({ message: error.message });
	}

	const { subscription, subscriptionEnd } = req.body;

	prisma.user
		.findUnique({ where: { id: userId } })
		.then((result) => {
			if (!result) return res.status(400).json({ message: `No user found with ID ${userId}` });
			prisma.user
				.update({
					where: { id: userId },
					data: {
						subscription,
						subscriptionEnd: new Date(subscriptionEnd),
					},
					select: {
						subscription: true,
					},
				})
				.then((result) => {
					return res.status(200).json({ message: "OK", subscription: result.subscription });
				})
				.catch(console.error);
		})
		.catch(console.error);
};
