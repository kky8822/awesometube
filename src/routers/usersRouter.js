import express from "express";
import {
  getLogin,
  postLogin,
  getLogout,
  startGithubLogin,
  finishGithubLogin,
  getEditProfile,
  postEditProfile,
  getChangePassword,
  postChangePassword,
} from "../controllers/userControllers";
import {
  avatarUpload,
  protectorMiddleware,
  publicOnlyMiddleware,
} from "../middlewears";

const userRouter = express.Router();

userRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.route("/logout").all(protectorMiddleware).get(getLogout);
userRouter
  .route("/edit-profile")
  .all(protectorMiddleware)
  .get(getEditProfile)
  .post(avatarUpload.single("avatar"), postEditProfile);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);

export default userRouter;
