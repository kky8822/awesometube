export const getHome = (req, res) => {
  res.render("home", { pageTitle: "Home" });
};
