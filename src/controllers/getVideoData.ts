import { Response } from "express";
import { RequestLogged } from "models/Request";
import prisma from "../database.js";
import jwt from "jsonwebtoken";

//DOCS https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/

//If Cloudflare credentials not found - exit process
if (!process.env.cloudflareStreamPem || !process.env.cloudflareStreamKeyID) {
	console.error("Cloudflare pem and keyID not found on .env file. Exiting process");
	process.exit(0);
}
const pem64 = process.env.pcloudflareStreamPemem!;
const kid = process.env.cloudflareStreamKeyID!;

const generateSignedToken = (videoId: string, expireSeconds: number) => {
	const pemKey = Buffer.from(pem64, "base64").toString();

	const data = {
		sub: videoId,
		kid,
		exp: Math.floor(Date.now() / 1000) + expireSeconds,
	};

	return jwt.sign(data, pemKey, { header: { kid, alg: "RS256" } });
};

export const getVideoData = async (req: RequestLogged, res: Response) => {
	const videoId = Number(req.params.videoId);

	if (!videoId || isNaN(videoId)) return res.status(400).json({ message: "no videoId" });

	prisma.video
		.findUnique({
			where: { id: Number(videoId) },
			include: {
				categories: {
					select: {
						category: true,
					},
				},
			},
		})
		.then((video) => {
			if (!video) return res.status(204).json({});

			video.cloudflareId = generateSignedToken(video.cloudflareId, 3600);
			res.status(200).json({ message: "OK", video });
		})
		.catch(console.error);
};

export const getAllVideos = async (req: RequestLogged, res: Response) => {
	prisma.video
		.findMany({
			where: {
				readyToStream: true,
			},
			select: {
				id: true,
				title: true,
				imageURL: true,
				duration: true,
				createdAt: true,
				categories: { select: { category: { select: { name: true } } } },
			},
		})
		.then((videos) => {
			res.status(200).json({ message: "OK", videos });
		})
		.catch(console.error);
};

const cfAccId = process.env.cloudflareAccountId;
const cfToken = process.env.cloudflareStreamToken;

export const getWatchId = (req: RequestLogged, res: Response) => {
	const id = Number(req.params.id);
	if (!id || isNaN(Number(id))) {
		res.status(400).json({ message: "invalid id" });
		return;
	}

	prisma.video.findUnique({ where: { id }, select: { cloudflareId: true } }).then((data) => {
		if (data) {
			res.status(200).json({ message: "OK", id: generateSignedToken(data.cloudflareId, 3600) });
		} else {
			res.sendStatus(404).json({ message: "not found" });
		}
	});
};
