const express = require("express");

const auth = require("../auth");

const authRouter = express.Router()

// --- Login --- //

authRouter.post("/login", (req, res) => {
  auth.login(req.body.email, req.body.password, result => {
    if (result.user) {
      req.session.loggedUser = result.user;
      console.log("asd", req.session.loggedUser)
      if (req.session.loggedUser.profile == "admin") {
        res.redirect("/pending");
        // res.render("reserva", { layout: "main2", user: req.session.loggedUser, medicosList: medicosList, reservaMSG });
        return
      }
      res.redirect("/home");
    } else {
      req.session.message = {
        class: "failure",
        text: result.msg
      };

      res.redirect("/login");
    }
  })
});

// --- Register --- //

authRouter.post("/register", (req, res) => {
  // Valido datos de registro -->

  auth.getUser(req.body.email, result => {
    if (!result.success) {
      req.session.message = {
        class: "failure",
        text: "No se pudo conectar a la base de datos."
      }

      res.redirect("/signup");
      return;
    };

    if (result.email) {
      req.session.message = {
        class: "failure",
        text: "Email en uso."
      }

      res.redirect("/signup");

      return;
    }

    if (!req.body.password || req.body.password !== req.body.confirmPassword) {
      req.session.message = {
        class: "failure",
        text: "Las contraseñas deben ser iguales"
      }

      res.redirect("/signup");
      return;
    }

    // Si el usuario cumple -->

    auth.register(req.body.name, req.body.surname, req.body.email, req.body.password, result => {
      if (result) {

        req.session.message = {
          class: "success",
          text: "Te has registrado con éxito"
        };
        res.redirect("/login");

      } else {

        req.session.message = {
          class: "failure",
          text: "Error al registrar, intente más tarde."
        };
        res.redirect("/signup");

      }
    });
  });
});

// Change Password //

authRouter.get("/changepassword", (req, res) => {

  if (req.session.loggedUser) {
    res.render("paciente/changepassword", {
      layout: "main2",
      user: req.session.loggedUser,
      message: req.session.message
    });
  } else {
    res.redirect("/login");
  }
});

authRouter.post("/changepassword", (req, res) => {

  if (req.session.loggedUser) {

    if (!req.body.password || req.body.password !== req.body.confirmPassword) {

      req.session.message = {
        class: "failure",
        text: "Passwords must be equal"
      }

      res.redirect("/changepassword");
      return;
    }

    auth.changePassword(req.session.loggedUser.email, req.body.password, result => {
      if (result) {

        req.session.message = {
          class: "success",
          text: "Contraseña cambiadas con éxito"
        }
        res.redirect("/login");

      } else {
        req.session.message = {
          class: "failure",
          text: "No se pudo guardar la nueva contraseña."
        }

        res.redirect("/changepassword");
      }
    });


  } else {

    res.redirect("/login");

  }

});

// Logout //

authRouter.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = authRouter;