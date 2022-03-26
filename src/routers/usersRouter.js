import express from "express";
import {
  getLogin,
  postLogin,
  getLogout,
  startGithubLogin,
  finishGithubLogin,
} from "../controllers/userControllers";

const userRouter = express.Router();

userRouter.route("/login").get(getLogin).post(postLogin);
userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/finish", finishGithubLogin);
userRouter.route("/logout").get(getLogout);

export default userRouter;
