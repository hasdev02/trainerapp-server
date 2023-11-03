import { Request } from "express";

declare module "express-session" {
	interface SessionData {
		userId: number | undefined;
	}
}

export interface RequestLogged extends Request {
	userId: number;
}
