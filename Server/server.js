const HTTP_PORT = 4000;

const express = require("express");
const path = require("path");
const expHbs = require("express-handlebars");
const bodyParser = require("body-parser");

const app = express();

const auth = require("./auth");

// const hospitalDB = require("./hospitalDB.js");


// ----------------------------------------------------------
// Configuración de Handlebars
app.set("view engine", "handlebars");

app.engine("handlebars", expHbs({
  defaultLayout: "index",
  layoutsDir: path.join(__dirname, "views/layouts")
}));

app.set("views", path.join(__dirname, "views"));
// ----------------------------------------------------------

// Ruta base de recursos estáticos
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));

//-----------------------------------------------------------

// GETS

app.get("/", (req, res) => {
  res.render("index", { layout: "main" });
});

app.get("/about", (req, res) => {
  res.render("about", { layout: "main" });
});

app.get("/locations", (req, res) => {
  res.render("locations", { layout: "main" });
});

app.get("/portal", (req, res) => {
  res.render("portal", { layout: "main" });
});

app.get("/signup", (req, res) => {
  res.render("signup", { layout: "main" });
});

app.get("/miportal", (req, res) => {
  res.render("home", { layout: "main", message: req.session.message});
});


// POSTS

app.post("/login", (req, res) => {

  auth.login(req.body.username, req.body.password, result => {
    if (result.valid) {
      res.render("index");
    } else {
      res.render("portal", { layout: "main", message: result.msg });
    };
  })
});

//register

app.post("/register", (req, res) => {

  // 1. Validar datos de registro
  auth.getUser(req.body.email, result => {

    // Si no se pudo consultar a la DB renderizo signup con mensaje de error
    if (!result.success) {

      // Agrego el mensaje en el objeto de sesión antes de redireccionar
      // (para que cuando llegue el request a /signup podamos tener acceso
      // a ese dato)
      req.session.message = {
        class: "failure",
        text: "Sorry, can't register now, retry later."
      }

      res.redirect("/signup");

      // Return para que no siga ejecutando el resto de la función
      return;
    };

    // Si el usuario ya existe renderizo signup con mensaje de error
    if (result.email) {

      req.session.message = {
        class: "failure",
        text: "Sorry, email already in use."
      }

      res.redirect("/signup");

      return;
    }

    // Si el password está mal ingresado renderizo signup con mensaje de error
    if (!req.body.password || req.body.password !== req.body.confirmPassword) {

      req.session.message = {
        class: "failure",
        text: "Passwords must be equal"
      }

      res.redirect("/signup");
      return;
    }

    // Procesamos alta de usuarix
    auth.register(req.body.name, req.body.surname. req.body.email, req.body.password, result => {

      if (result) {

        req.session.message = {
          class: "success",
          text: "Successfully registered, please sign in."
        };
        res.redirect("/login");

      } else {

        // Si no se pudo registrar renderizo signup con mensaje de error
        req.session.message = {
          class: "success",
          text: "Sorry, could't register user, please try again later."
        };
        res.redirect("/signup");

      }
    });
  });
});


app.listen(HTTP_PORT, () => {
  console.log(`servidor iniciado en http://localhost:${HTTP_PORT}`)
})
