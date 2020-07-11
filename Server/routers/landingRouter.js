const express = require("express");

const landingRouter = express.Router()

landingRouter.get("/", (req, res) => {
    res.render("landing/index", { layout: "landing" });
});

landingRouter.get("/about", (req, res) => {
    res.render("landing/about", { layout: "landing" });
});

landingRouter.get("/locations", (req, res) => {
    res.render("landing/locations", { layout: "landing" });
});

landingRouter.get("/login", (req, res) => {
    if (req.session.loggedUser) {
        res.redirect("/home");
    } else {
        res.render("landing/login", { layout: "landing", message: req.session.message });
    }
});

landingRouter.get("/signup", (req, res) => {
    res.render("landing/signup", { layout: "landing", message: req.session.message });
  });


module.exports = landingRouter;