import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
  res.render("users/join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
  const {
    file: { path: avatarUrl },
    body: { username, email, password, password_c },
  } = req;

  if (password != password_c) {
    return res.status(400).render("users/join", {
      pageTitle: "Join",
      errorMessage: "Confirm your password",
    });
  }

  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("users/join", {
      pageTitle: "Join",
      errorMessage: "This username/email is already taken.",
    });
  }

  try {
    await User.create({
      avatarUrl,
      username,
      email,
      password,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("users/join", {
      pageTitle: "Join",
      errorMessage: "Unexpercted errors are occured.",
    });
  }
};

export const getLogin = (req, res) => {
  res.render("users/login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    res.status(400).render("users/login", {
      pageTitle: "Login",
      errorMessage: "You do not have account",
    });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    res.status(400).render("users/login", {
      pageTitle: "Login",
      errorMessage: "Not correct password",
    });
  }

  req.session.loggedIn = true;
  req.session.user = user;

  res.redirect("/");
};
