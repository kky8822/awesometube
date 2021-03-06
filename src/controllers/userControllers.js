import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "cross-fetch";
import { resetWatchers } from "nodemon/lib/monitor/watch";

export const getJoin = (req, res) => {
  res.render("users/join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
  const {
    file,
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
      avatarUrl: file ? file.path : "",
      username,
      email,
      password,
    });
    return res.redirect("/users/login");
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

export const getLogout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user, user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;

    const userData = await (
      await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailData = await (
      await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );

    if (!emailObj) {
      return res.redirect("/login");
    }

    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = User.create({
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        avatarUrl: userData.avatar_url,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const getEditProfile = (req, res) => {
  return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};

export const postEditProfile = async (req, res) => {
  const {
    body: { username, email },
    session: {
      user: { _id, avatarUrl, username: oldUsername, email: oldEmail },
    },
    file,
  } = req;

  const isMe = username === oldUsername || email === oldEmail;
  const exist = await User.exists({ $or: [{ username }, { email }] });

  if (!isMe & exist) {
    return res.status(400).redirect("users/edit-profile", {
      pageTitle: "Edit Profile",
      errorMessage: "username/email is already taken.",
    });
  }

  try {
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        username,
        email,
        avatarUrl: file ? "/" + file.path : avatarUrl,
      },
      { new: true }
    );
    req.session.user = updateUser;
    return res.redirect("/");
  } catch {
    return res.status(400).redirect("users/edit-profile", {
      pageTitle: "Edit Profile",
      errorMessage: "Unknown error is occur.",
    });
  }
};

export const getChangePassword = (req, res) => {
  if (res.locals.loggedInUser.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { password, newPassword, newPassword_c },
  } = req;
  const user = await User.findById(_id);

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }

  if (newPassword !== newPassword_c) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not mathch confirmation.",
    });
  }

  user.password = newPassword;
  await user.save();
  return res.redirect("/users/logout");
};
