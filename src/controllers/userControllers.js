export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};

export const postJoin = (req, res) => {
  const {
    file: { path: avatarUrl },
    body: { username, email, password, password_c },
  } = req;

  console.log(avatarUrl, username, email, password, password_c);

  res.redirect("/");
};
