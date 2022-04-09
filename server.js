const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

const mongoURI = "mongodb://localhost:27017/sessions";

// routes
const authRoutes = require("./routes/auth");

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to db successfully..."));

const sessionStore = new MongoDBSession({
  uri: mongoURI,
  collection: "app-sessions",
});

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "this key will sign the cookie",
    resave: true,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {secure: false }
  })
);

const isAuth = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  }
  return res.redirect("/login");
};

const isVisitor = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    return next();
  }
  return res.redirect("/dashboard");
};

app.get("/", (req, res) => {
  res.render("index", { isAuthenticated: req.session.isAuthenticated });
});

app.get("/login", isVisitor, (req, res) => {
  res.render("login", { isAuthenticated: req.session.isAuthenticated });
});

app.get("/register", isVisitor, (req, res) => {
  res.render("register", { isAuthenticated: req.session.isAuthenticated });
});

app.get("/dashboard", isAuth, (req, res) => {
  res.render("dashboard", { isAuthenticated: req.session.isAuthenticated });
});

app.use("/auth", authRoutes);

app.listen(5000, console.log("Serer running http://localhost:5000"));
