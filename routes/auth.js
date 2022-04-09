const router = require("express").Router();
const bcrypt = require("bcryptjs");
const UserModel = require("../models/User");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("login", {
      isAuthenticated: req.session.isAuthenticated,
      error: "Please enter your email and password",
    });
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.render("login", {
      isAuthenticated: req.session.isAuthenticated,
      error: "User not found",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.render("login", {
      isAuthenticated: req.session.isAuthenticated,
      error: "Password is incorrect",
    });
  }

  req.session.isAuthenticated = true;
  return res.redirect("/dashboard");
});

router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.render("register", {
      isAuthenticated: req.session.isAuthenticated,
      error: "Please enter your username, email and password",
    });
  }

  const user = await UserModel.findOne({ email });
  if (user) {
    return res.render("register", {
      isAuthenticated: req.session.isAuthenticated,
      error: "User already exists",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = new UserModel({
    username,
    email,
    password: hashPassword,
  });

  await newUser.save();
  return res.redirect("/login");
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    return res.redirect("/");
  });
});

module.exports = router;
