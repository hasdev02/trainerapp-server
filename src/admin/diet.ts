import { Request, Response } from "express";
import prisma from "../database.js";
import multer from "multer";
import { randomUUID } from "crypto";
import { readFile, unlink } from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const updateDiet = (req: Request, res: Response) => {
	const { day, diet } = req.body;
	const userId = Number(req.params.id);

	if (!userId || isNaN(userId)) return res.status(400).json({ message: "No userid" });

	if (!day || !diet) return res.status(400).json({ message: "invalid request" });

	let dietUpdateData: any = {};
	dietUpdateData[day] = diet;

	prisma.user.findUnique({ where: { id: userId } }).then((user) => {
		if (!user) return res.status(404).json({ message: "user not found" });
		prisma.user
			.update({
				where: { id: userId },
				data: {
					diet: {
						update: dietUpdateData,
					},
				},
				select: {
					diet: true,
				},
			})
			.then((result) => {
				res.status(200).json({ message: "OK", diet: result.diet });
			});
	});
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, "../../tempFiles"));
	},
	filename: (req, file, cb) => {
		cb(null, `${randomUUID()}.${file.originalname.split(".").pop()}`);
	},
});

export const uploadDietMiddleware = multer({
	storage: storage,
}).single("pdf");

export const uploadDietFile = (req: Request, res: Response) => {
	const userId = Number(req.params.id);
	if (!userId || isNaN(userId)) return res.status(400).json({ message: "No userid" });

	const pdfFile = req.file?.path;
	if (!pdfFile) return res.status(400).json({ message: "no file" });

	readFile(pdfFile, (error, pdfBuffer) => {
		if (error) return res.status(500).json({ message: "internal error" });

		prisma.user.findUnique({ where: { id: userId } }).then((user) => {
			if (!user) return res.status(204).json({ message: "user not found" });
			prisma.user
				.update({
					where: { id: userId },
					data: {
						dietPdf: pdfBuffer,
					},
				})
				.then((result) => {
					unlink(pdfFile, (e) => e && console.error(e));
					res.status(200).json({ message: "OK" });
				})
				.catch(() => unlink(pdfFile, (e) => e && console.error(e)));
		});
	});
};
