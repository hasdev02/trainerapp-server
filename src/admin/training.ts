import { Request, Response } from "express";
import prisma from "../database.js";

interface Exercise {
	name: string;
	videoId: number;
}

interface TrainSet {
	index: number;
	exercises: Exercise[];
	series: string;
	amount: string;
}

interface Training {
	monday: TrainSet[];
	tuesday: TrainSet[];
	wednesday: TrainSet[];
	thursday: TrainSet[];
	friday: TrainSet[];
	saturday: TrainSet[];
	sunday: TrainSet[];
}

export const updateTraining = (req: Request, res: Response) => {
	const userId = Number(req.params.id);
	const { train } = req.body;

	if (!userId || isNaN(userId)) return res.status(400).json({ message: "No userid" });

	prisma.user.findUnique({ where: { id: userId } }).then((user) => {
		if (!user) return res.status(404).json({ message: "user not found" });
		prisma.user
			.update({
				where: { id: userId },
				data: {
					train,
				},
				select: {
					train: true,
				},
			})
			.then((result) => {
				res.status(200).json({ message: "OK", train: result.train });
			});
	});
};

export const copyClientTrain = (req: Request, res: Response) => {
	const userId = Number(req.params.id);
	const { fromClient } = req.body;

	if (!userId || isNaN(userId)) return res.status(400).json({ message: "No userid" });
	if (!fromClient || isNaN(fromClient)) return res.status(400).json({ message: "No fromClient" });

	prisma.user.findUnique({ where: { id: userId } }).then((user) => {
		if (!user) return res.status(404).json({ message: "user not found" });

		prisma.user.findUnique({ where: { id: fromClient }, select: { train: true } }).then((fromClient) => {
			if (!fromClient) return res.status(404).json({ message: "fromClient not found" });

			prisma.user
				.update({
					where: { id: userId },
					data: {
						train: fromClient.train!,
					},
				})
				.then(() => {
					res.status(200).json({ message: "OK" });
				})
				.catch((e) => {
					console.error(e);
					res.status(500).json({ message: "error on copyClientTrain" });
				});
		});
	});
};

export const resetClientTrain = (req: Request, res: Response) => {
	const userId = Number(req.params.id);

	if (!userId || isNaN(userId)) return res.status(400).json({ message: "No userid" });

	prisma.user.findUnique({ where: { id: userId } }).then((user) => {
		if (!user) return res.status(404).json({ message: "user not found" });
		prisma.user
			.update({
				where: { id: userId },
				data: {
					train: {
						monday: [],
						tuesday: [],
						wednesday: [],
						thursday: [],
						friday: [],
						saturday: [],
						sunday: [],
					},
				},
				select: {
					train: true,
				},
			})
			.then((result) => {
				res.status(200).json({ message: "OK", train: result.train });
			});
	});
};
