import express from "express";
import { getHome } from "../controllers/videoControllers";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from "../controllers/userControllers";
import { avatarUpload } from "../middlewears";

const rootRouter = express.Router();

rootRouter.route("/").get(getHome);
rootRouter
  .route("/join")
  .get(getJoin)
  .post(avatarUpload.single("avatar"), postJoin);
rootRouter.route("/login").get(getLogin).post(postLogin);

export default rootRouter;
