import multer from "multer";

export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "Awesometube";
  //   res.locals.loggedIn = Boolean(req.session.loggedIn);
  //   res.locals.loggedInUser = req.session.user || {};
  // console.log(res.locals);
  next();
};

export const avatarUpload = multer({
  dest: "uploads/avatars",
});
