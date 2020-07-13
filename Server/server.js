const HTTP_PORT = 4000;

const express = require("express");
const path = require("path");
const expHbs = require("express-handlebars");
const bodyParser = require("body-parser");
const expSession = require("express-session");

const app = express();

const auth = require("./auth");
const functions = require("./functions");
const { stringify } = require("querystring");

// Config Handlebars //

app.set("view engine", "handlebars");

app.engine(
  "handlebars",
  expHbs({
    layoutsDir: path.join(__dirname, "views/layouts"),
  })
);

app.set("views", path.join(__dirname, "views"));

// Static path //

app.use(express.static(path.join(__dirname, "public")));

// BodyParser //

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Config obj session //

app.use(
  expSession({
    secret: "asdkjfaskdlfjsaldfa",
    resave: false,
    saveUninitialized: false,
  })
);

// console.log req.body //

app.use("/", (req, res, next) => {
  console.log("body", req.body);
  next();
});

// Routers //

const landingRouter = require("./routers/landingRouter");
app.use(landingRouter);

const authRouter = require("./routers/authRouter");
app.use(authRouter);

const pacientesRouter = require("./routers/pacientesRouter");
app.use(pacientesRouter);

const medicosRouter = require("./routers/medicosRouter");
app.use(medicosRouter);

// start the server //

app.listen(HTTP_PORT, () => {
  console.log(`servidor iniciado en http://localhost:${HTTP_PORT}`);
});
