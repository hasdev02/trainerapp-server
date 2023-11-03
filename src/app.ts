import express from "express";
import apiRouter from "./routes/index.js";
import cors from "cors";
import { verifyToken } from "./controllers/auth.js";
import cookieParser from "cookie-parser";

const app = express();

//Settings
app.set("port", process.env.PORT);

app.use(
	cors({
		origin: ["http://localhost:3000", "http://localhost:3001"],
		credentials: true,
		exposedHeaders: "Set-Cookie",
	}),
);

app.use(cookieParser());

//Allow traffic from nginx reverse proxy
app.set("trust proxy", "loopback");

// Middlewares
app.use(express.json());

//Dev settings
if (process.env.MODE !== "production") {
	const morgan = await import("morgan");
	app.use(morgan.default("dev"));
}

// Load routes
app.use("/", verifyToken, apiRouter);

export default app;
