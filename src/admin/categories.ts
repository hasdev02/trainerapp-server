import { Request, Response } from "express";
import prisma from "../database.js";

export const addCategory = (req: Request, res: Response) => {
	const { name } = req.body;

	if (!name) return res.status(400).json({ message: "no name" });

	prisma.category.create({
		data: {
			name,
		},
	});
};
