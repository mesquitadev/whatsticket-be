// @ts-nocheck
import express from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";

import * as AnnouncementController from "../controllers/AnnouncementController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const routes = express.Router();

// @ts-ignore
routes.get("/announcements/list", isAuth, AnnouncementController.findList);
// @ts-ignore
routes.get("/announcements", isAuth, AnnouncementController.index);
// @ts-ignore
routes.get("/announcements/:id", isAuth, AnnouncementController.show);
// @ts-ignore
routes.post("/announcements", isAuth, isSuper, AnnouncementController.store);
// @ts-ignore
routes.put("/announcements/:id", isAuth, isSuper, AnnouncementController.update);
// @ts-ignore
routes.delete("/announcements/:id", isAuth, isSuper, AnnouncementController.remove);
// @ts-ignore
routes.post(
  "/announcements/:id/media-upload",
  isAuth, isSuper,
  // @ts-ignore
  upload.array("file"),
  // @ts-ignore
  AnnouncementController.mediaUpload
);
// @ts-ignore
routes.delete(
  "/announcements/:id/media-upload",
  isAuth, isSuper,
  // @ts-ignore
  AnnouncementController.deleteMedia
);

export default routes;
