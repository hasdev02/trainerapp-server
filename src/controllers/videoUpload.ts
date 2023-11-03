import path from "path";
import multer from "multer";
import { Request, Response } from "express";
import fs from "fs";
import { randomUUID } from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { Upload } from "tus-js-client";
import got from "got";
import prisma from "../database.js";
import { fileURLToPath } from "url";

if (!process.env.cloudflareAccountId || !process.env.cloudflareStreamToken) {
	console.error("Cloudflare credentials not found on .env file. Exiting process");
	process.exit(0);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storageEngine = multer.diskStorage({
	destination: (req, file, cb) => {
		switch (file.fieldname) {
			case "video":
				cb(null, path.join(__dirname, "../../tempFiles"));
				break;
			case "thumbnail":
				cb(null, path.join(__dirname, "../../tempFiles"));
				break;
		}
	},
	filename: async (req, file, cb) => {
		cb(null, `${randomUUID()}.${file.originalname.split(".").pop()}`);
	},
});

export const uploadMulterMiddleware = multer({
	storage: storageEngine,
}).fields([
	{ name: "video", maxCount: 1 },
	{ name: "thumbnail", maxCount: 1 },
]);

export const videoUpload = async (req: Request, res: Response) => {
	const { title, description } = req.body;

	//@ts-ignore
	const videoFiles: Express.Multer.File[] = req.files["video"];

	if (!title || !videoFiles) {
		res.status(400).json({ message: "missing title or video" });
		return;
	}

	const [videoFile] = videoFiles;

	const { path: videoPath } = videoFile;

	let thumbnailPath = "";
	//@ts-ignore
	const thumbnailFile: Express.Multer.File[] = req.files["thumbnail"];
	if (thumbnailFile) {
		thumbnailPath = thumbnailFile[0].path;
	}

	const cfAccId = process.env.cloudflareAccountId;
	const cfToken = process.env.cloudflareStreamToken;

	const file = fs.createReadStream(videoPath);
	const { size } = fs.statSync(videoPath);

	const cloudflareId = await new Promise((resolve, reject) => {
		new Upload(file, {
			endpoint: `https://api.cloudflare.com/client/v4/accounts/${cfAccId}/stream`,
			headers: {
				Authorization: `Bearer ${cfToken}`,
			},
			chunkSize: 50 * 1024 * 1024, //50MB.
			metadata: {
				filename: videoFile.filename,
				filetype: "video/mp4",
			},
			uploadSize: size,
			onError(error) {
				reject(error);
				fs.unlink(videoPath, (e) => e && console.error(e));
			},
			onProgress(bytesUploaded, bytesTotal) {
				// UTIL FOR DEBUGGING UPLOAD PROGRESS
				// const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
				// console.log(bytesUploaded, bytesTotal, percentage + "%");
			},
			onSuccess() {
				console.log("Upload finished");
				fs.unlink(videoPath, (e) => e && console.error(e));
			},
			onAfterResponse(req, res) {
				resolve(res.getHeader("stream-media-id"));
			},
		}).start();
	}).catch(console.error);

	got.post(`https://api.cloudflare.com/client/v4/accounts/${cfAccId}/stream/${cloudflareId}`, {
		headers: {
			Authorization: `Bearer ${cfToken}`,
		},
		json: {
			requireSignedURLs: true,
		},
	})
		.then(async (_response) => {
			let imageURL: string | undefined = undefined;
			if (thumbnailPath) {
				const { secure_url: url } = await cloudinary.uploader.upload(thumbnailPath);
				imageURL = url;
				fs.unlink(thumbnailPath, (e) => e && console.error(e));
			}

			prisma.video
				.create({
					data: {
						title,
						description,
						cloudflareId: cloudflareId as string,
						imageURL,
						duration: 0,
					},
					select: {
						id: true,
						title: true,
						description: true,
						imageURL: true,
					},
				})
				.then((video) => {
					res.status(200).json({ message: "OK", video });
				});
		})
		.catch(console.error);
};
