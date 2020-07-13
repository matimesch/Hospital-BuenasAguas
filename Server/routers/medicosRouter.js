const express = require("express");

const medicosRouter = express.Router();

const functions = require("../functions");
const auth = require("../auth");

// --- landing page medicos --- //

medicosRouter.get("/medicos", (req, res) => {
  if (req.session.loggedMedico) {
    res.redirect("/homemedicos");
  } else {
    res.render("medico/loginmedicos", {
      layout: "main3",
      message: req.session.message,
    });
  }
});

// --- Register medicos --- //

medicosRouter.get("/registerMedicos", (req, res) => {
  res.render("medico/signupmedicos", { layout: "main3" });
});

medicosRouter.post("/registerMedicos", (req, res) => {
  console.log(req.body);
  auth.getMedico(req.body.email, (result) => {
    if (!result.success) {
      req.session.medicoRegisterMsg = {
        class: "failure",
        text: "No se pudo conectar a la base de datos.",
      };
      res.redirect("medicos");
      return;
    }
    if (result.email) {
      req.session.medicoRegisterMsg = {
        class: "failure",
        text: "Email en uso.",
      };

      res.redirect("medicos");
      return;
    }
    if (!req.body.password || req.body.password !== req.body.confirmPassword) {
      req.session.medicoRegisterMsg = {
        class: "failure",
        text: "Las contraseñas deben ser iguales",
      };
      res.redirect("/medicos");
      return;
    }

    auth.registerMedicos(
      req.body.name,
      req.body.surname,
      req.body.email,
      req.body.especialidad,
      req.body.horarios,
      req.body.password,
      (result) => {
        if (result) {
          console.log("registración completa");
          res.redirect("medicos");
        }
      }
    );
  });
});

// --- Logout --- //

medicosRouter.get("/logoutmedicos", (req, res) => {
  req.session.destroy();
  res.redirect("/medicos");
});

// --- Home --- //

medicosRouter.get("/homemedicos", (req, res) => {
  if (req.session.loggedMedico) {
    res.render("medico/homemedicos", {
      layout: "main3",
      user: req.session.loggedMedico,
    });
  } else {
    res.redirect("/medicos");
  }
});

// --- Login --- //

medicosRouter.post("/loginMedicos", (req, res) => {
  auth.loginMedicos(req.body.email, req.body.password, (result) => {
    if (result.medico) {
      req.session.loggedMedico = result.medico;
      console.log("soy epico");
      res.redirect("/homemedicos");
    } else {
      req.session.message = {
        class: "failure",
        text: result.msg,
      };

      res.redirect("/medicos");
    }
  });
});

module.exports = medicosRouter;
