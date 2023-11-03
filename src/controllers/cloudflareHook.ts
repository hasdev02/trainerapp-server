import { Request, Response } from "express";
import { createHmac } from "crypto";
import prisma from "../database.js";

if (!process.env.streamHookSecret) {
	console.error("Cloudflare streamHookSecret not found on .env file. Exiting process");
	process.exit(0);
}

const streamHookSecret = process.env.streamHookSecret;

const verifySignature = (webhookSignature: string, requestBody: string): boolean => {
	const [timeStr, sigStr] = webhookSignature.split(",");

	const time = timeStr.split("=")[1];
	const sig1 = sigStr.split("=")[1];

	const hash = createHmac("sha256", streamHookSecret).update(time + "." + requestBody);

	return sig1 == hash.digest("hex");
};

export const onStreamHook = (req: Request, res: Response) => {
	if (!verifySignature(req.headers["webhook-signature"] as string, JSON.stringify(req.body))) return;

	const { duration, uid: cloudflareId } = req.body;

	prisma.video
		.update({
			where: { cloudflareId },
			data: {
				readyToStream: true,
				duration: Math.round(duration),
			},
		})
		.then();
};
