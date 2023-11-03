import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import http from "http";
dotenv.config();

cloudinary.config({
	cloud_name: process.env.cloudinary_cloud_name,
	api_key: process.env.cloudinary_api_key,
	api_secret: process.env.cloudinary_api_secret,
});

import app from "./app.js";
import "./database.js";

http.createServer(app).listen(app.get("port"), () => {
	console.log("API listening on port", app.get("port"));
});
