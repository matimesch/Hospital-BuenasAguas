const HTTP_PORT = 4000;

const express = require("express");
const path = require("path");
const expHbs = require("express-handlebars");
const bodyParser = require("body-parser");
const expSession = require("express-session");

const app = express();

const auth = require("./auth");
// const turnos = require("./turnos");


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

// BodyParser

app.use(bodyParser.urlencoded({ extended: true }));

// Configuración obj session

app.use(expSession({
  secret: "asdkjfaskdlfjsaldfa",
  resave: false,
  saveUninitialized: false
}));

//-----------------------------------------------------------

// GETS fuera de session

app.get("/", (req, res) => {
  res.render("index", { layout: "main" });
});

app.get("/about", (req, res) => {
  res.render("about", { layout: "main" });
});

app.get("/locations", (req, res) => {
  res.render("locations", { layout: "main" });
});

// Landing page

app.get("/portal", (req, res) => {
  if (req.session.loggedUser) {
    res.redirect("/home");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("portal", { layout: "main", message: req.session.message });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.get("/signup", (req, res) => {
  res.render("signup", { layout: "main", message: req.session.message });
});

app.get("/changepassword", (req, res) => {

  if (req.session.loggedUser) {
    res.render("changepassword", {
      layout: "main2",
      message: req.session.message
    });
  } else {
    res.redirect("/login");
  }

});


app.get("/home", (req, res) => {
  if (req.session.loggedUser) {
    res.render("home", { layout: "main2", user: req.session.loggedUser });
  } else {
    res.redirect("/login");
  }
});

app.get("/turnos", (req, res) => {
  if (req.session.loggedUser) {
    res.render("turnos", { layout: "main2" });
  } else {
    res.redirect("/login");
  }
});

app.get("/medicos", (req, res) => {
  if (req.session.loggedUser) {
    res.render("medicos", { layout: "main2" });
  } else {
    res.redirect("/login");
  }
});

app.get("/medicamentos", (req, res) => {
  if (req.session.loggedUser) {
    res.render("medicamentos", { layout: "main2" });
  } else {
    res.redirect("/login");
  }
});

app.get("/mismedicamentos", (req, res) => {
  if (req.session.loggedUser) {
    res.render("mismedicamentos", { layout: "main2", medicamentos : req.session.loggedUser.medicamentos});
  } else {
    res.redirect("/login");
  }
});


// POSTS

app.post("/login", (req, res) => {

  auth.login(req.body.email, req.body.password, result => {
    if (result.user) {

      req.session.loggedUser = result.user;

      console.log(req.session.loggedUser)
      console.log(req.session)
      console.log(result.user.name)

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

//register

app.post("/register", (req, res) => {
  console.log(req.body)
  // Valido datos de registro
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

    // Si el usuario cumple
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

//Changepassword

app.post("/changepassword", (req, res) => {

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


//medicamento

app.get("/medicines", (req, res) => {

  // getMedicamento(function (medicamentoList) {
  const medicamentoList = getMedicamento();
  let resultados = medicamentoList;


  if (req.query.medicamento) {
    resultados = resultados.filter(function (medicamento) {
      let nombreDataBase = medicamento.toUpperCase();
      let nombreRecibido = req.query.medicamento.toUpperCase();
      return nombreDataBase.includes(nombreRecibido);


    })
  };

  res.json(resultados.slice(0, 5));

  // });


});


app.post("/remedio", (req, res) => {
  if (req.session.loggedUser) {

    auth.saveMedicamento(req.query.remedio,req.session.loggedUser.email, result => {
      if (result.medicamentos) {
        console.log(result.medicamentos)
        console.log("medicamento guardado en favoritos")
        req.session.loggedUser.medicamentos = result.medicamentos

        console.log(req.session.loggedUser)


        req.session.messageRem = {
          class: "success",
          text: "Medicamento guardado en favoritos"
        }

      } else {
        console.log("error")
        req.session.messageRem = {
          class: "failure",
          text: "No se pudo guardar el medicamento."
        }

      }
    });


  } else {

    res.redirect("/login");

  }


});


function getMedicamento() {
  const medicamentos = ["ibupirac", "amoxidal", "penoral", "roaocutan", "paracetamol", "globulitos"];
  return medicamentos
}

//turnos

// app.post("/turnos", (req, res) => {
//   turnos.getTurno(req.body.medico, req.body.especialidad, req.body.dateTime, result => {
//     if (result.turno) {
//       res.render("turnos", {
//         layout: "main2",
//         message: {
//           class: "failure",
//           text: "Turno ya ocupado"
//         }
//       })
//       return
//     } else{
//       turnos.register{
//       }
//     }
//   });
// });




app.listen(HTTP_PORT, () => {
  console.log(`servidor iniciado en http://localhost:${HTTP_PORT}`)
})