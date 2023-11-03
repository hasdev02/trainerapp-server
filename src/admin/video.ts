import { Request, Response } from "express";
import prisma from "../database.js";

export const editDescription = (req: Request, res: Response) => {
	const { description } = req.body;
	const { videoId } = req.params;

	if (!description) return res.status(400).json({ message: "no description" });

	prisma.video.findUnique({ where: { id: Number(videoId) } }).then((video) => {
		if (!video) return res.status(404).json({ message: "not found" });

		prisma.video
			.update({
				where: { id: Number(videoId) },
				data: {
					description,
				},
				select: {
					description: true,
				},
			})
			.then((video) => {
				return res.status(200).json({ message: "OK", description: video.description });
			});
	});
};

export const editTitle = (req: Request, res: Response) => {
	const { title } = req.body;
	const { videoId } = req.params;

	if (!title) return res.status(400).json({ message: "no title" });

	prisma.video.findUnique({ where: { id: Number(videoId) } }).then((video) => {
		if (!video) return res.status(404).json({ message: "not found" });

		prisma.video
			.update({
				where: { id: Number(videoId) },
				data: {
					title,
				},
				select: {
					title: true,
				},
			})
			.then((video) => {
				return res.status(200).json({ message: "OK", title: video.title });
			});
	});
};
