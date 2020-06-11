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

app.get("/home", (req, res) => {
  res.render("home", { layout: "main"});
});


// POSTS

app.post("/login", (req, res) => {
  console.log(req.body)

  auth.login(req.body.email, req.body.password, result => {
    if (result.valid) {
        res.render("home", {layout: "main2"});
    } else {
      res.render("portal", { layout: "main", message: {
        class: "failure",
        text: result.msg} });
    };
  })
});

//register

app.post("/register", (req, res) => {
 console.log(req.body)
  // Valido datos de registro
  auth.getUser(req.body.email, result => {
    // Si no se pudo consultar a la DB renderizo signup con mensaje de error
    if (!result.success) {
      res.render("signup", {
        layout: "main",
        message: {
          class: "failure",
          text: "No se pudo conectar a la base de datos"
        }
      });
      return
    };

    // Si el mail ya existe renderizo signup con mensaje de error
    if (result.email) {
      res.render("signup", {
        layout: "main",
        message: {
          class: "failure",
          text: "Email en uso"
        }
      });
      return;
    }

    // Si el password no existe o está mal ingresado renderizo signup con mensaje de error
    if (!req.body.password || req.body.password !== req.body.confirmPassword) {
      res.render("signup", {
        layout: "main",
        message: {
          class: "failure",
          text: "Passwords must be equal"
        }
      });
      return;
    }

    // Procesamos el alta del usuario
    auth.register(req.body.name, req.body.surname, req.body.email, req.body.password, result => {
      if (result) {

        // Si se pudo registrar renderizo portal con mensaje de éxito
        res.render("portal", {
          layout: "main", message: {
            class: "success",
            text: "User registered, please sign in."
          }
        });

      } else {

        // Si no se pudo registrar renderizo signup con mensaje de error
        res.render("signup", {
          layout: "main",
          message: {
            class: "failure",
            text: "Sorry, could't register user, please try again later."
          }
        });

      }
    });
  });
});


app.listen(HTTP_PORT, () => {
  console.log(`servidor iniciado en http://localhost:${HTTP_PORT}`)
})