import prisma from "../database.js";
import { Request, Response } from "express";

export const getCategories = (req: Request, res: Response) => {
	prisma.category.findMany({ select: { id: true, name: true } }).then((categories) => {
		res.status(200).json({ categories });
	});
};

export const setVideoCategory = (req: Request, res: Response) => {
	const id = Number(req.params.videoId);

	const categoryName = req.body.categoryName.toLowerCase();

	if (!id || isNaN(Number(id))) return res.status(400).json({ message: "invalid id" });

	if (!categoryName) return res.status(400).json({ message: "missing categoryName" });

	prisma.category.findUnique({ where: { name: categoryName } }).then((result) => {
		const category = result ? { connect: { id: result.id } } : { create: { name: categoryName } };

		prisma.video
			.update({
				where: { id },
				data: {
					categories: {
						create: [
							{
								category,
							},
						],
					},
				},
				select: {
					categories: {
						select: {
							category: true,
						},
					},
				},
			})
			.then((result) => {
				res.status(200).json({ message: "ok", categories: result.categories });
			});
	});
};

export const deleteVideoCategory = (req: Request, res: Response) => {
	const id = Number(req.params.videoId);

	const { categoryId } = req.body;

	if (!id || isNaN(Number(id))) return res.status(400).json({ message: "invalid video id" });
	if (!categoryId || isNaN(Number(categoryId))) return res.status(400).json({ message: "invalid category id" });

	prisma.video.findUnique({ where: { id }, select: { categories: { include: { category: true, video: true } } } }).then((video) => {
		if (!video) return res.status(400).json({ message: "video not found" });

		prisma.categoriesOnVideos
			.delete({
				where: {
					videoId_categoryId: {
						categoryId,
						videoId: id,
					},
				},
			})
			.then(() => {
				res.status(200).json({ message: "ok" });
			});
	});
};
