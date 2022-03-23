import express from "express";
import { getHome } from "../controllers/videoControllers";
import { getJoin, postJoin } from "../controllers/userControllers";
import { avatarUpload } from "../middlewears";

const rootRouter = express.Router();

rootRouter.route("/").get(getHome);
rootRouter
  .route("/join")
  .get(getJoin)
  .post(avatarUpload.single("avatar"), postJoin);

export default rootRouter;
