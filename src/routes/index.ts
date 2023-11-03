import { Router } from "express";
import { login, register, logout, ensureAdmin, ensureSubscription, refreshAccessToken } from "../controllers/auth.js";
import { videoUpload, uploadMulterMiddleware } from "../controllers/videoUpload.js";
import { getAllVideos, getVideoData } from "../controllers/getVideoData.js";
import { setVideoCategory, getCategories, deleteVideoCategory } from "../controllers/categories.js";
import { onStreamHook } from "../controllers/cloudflareHook.js";
import { getClient, getClients, setClientSubscription } from "../controllers/clients.js";
import { changePassword, changeFullName, getTraining, getDiet, getDietPdf, getSessions } from "../controllers/user.js";
import { editDescription, editTitle } from "../admin/video.js";
import { copyClientTrain, resetClientTrain, updateTraining } from "../admin/training.js";
import { updateDiet, uploadDietFile, uploadDietMiddleware } from "../admin/diet.js";

const router = Router();

//auth
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/token", refreshAccessToken);

//user
router.post("/user/password", changePassword);
router.post("/user/name", changeFullName);
router.get("/user/sessions", getSessions);

//video -- ensure user have standard subcription
router.get("/video/:videoId", ensureSubscription, getVideoData);
router.get("/videos", ensureSubscription, getAllVideos);

//train
router.get("/train", ensureSubscription, getTraining);
router.get("/diet", ensureSubscription, getDiet);
router.get("/diet-file", ensureSubscription, getDietPdf);

//Cloudflare stream web hook
router.post("/streamhook", onStreamHook);

//categories
router.get("/categories", ensureSubscription, getCategories);

//admin -- ensure admin on all endpoints
router.post("/video/upload", ensureAdmin, uploadMulterMiddleware, videoUpload);
router.post("/video/:videoId/category", ensureAdmin, setVideoCategory);
router.delete("/video/:videoId/category", ensureAdmin, deleteVideoCategory);
router.post("/video/:videoId/description", ensureAdmin, editDescription);
router.post("/video/:videoId/title", ensureAdmin, editTitle);

router.get("/client/:id", ensureAdmin, getClient);
router.get("/clients", ensureAdmin, getClients);
router.post("/client/:id/subscription", ensureAdmin, setClientSubscription);
router.post("/client/:id/training", ensureAdmin, updateTraining);
router.post("/client/:id/diet", ensureAdmin, updateDiet);
router.post("/client/:id/diet-file", ensureAdmin, uploadDietMiddleware, uploadDietFile);
router.post("/client/:id/copy-client-train", ensureAdmin, copyClientTrain);
router.post("/client/:id/reset-train", ensureAdmin, resetClientTrain);

export default router;
