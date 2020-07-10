const HTTP_PORT = 4000;

const express = require("express");
const path = require("path");
const expHbs = require("express-handlebars");
const bodyParser = require("body-parser");
const expSession = require("express-session");
const moment = require("moment");


const app = express();

const auth = require("./auth");
const functions = require("./functions");
const { stringify } = require("querystring");
const e = require("express");
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
app.use(bodyParser.json());

// Configuración obj session

app.use(expSession({
  secret: "asdkjfaskdlfjsaldfa",
  resave: false,
  saveUninitialized: false
}));

//-----------------------------------------------------------

app.use('/', (req, res, next) => {
  console.log("body", req.body);
  next();
});

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

// Página principal

app.get("/portal", (req, res) => {
  if (req.session.loggedUser) {
    res.redirect("/home");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  if (req.session.loggedUser) {
    res.redirect("/home");
  }else{
    res.render("portal", { layout: "main", message: req.session.message });
  }
  
});

app.get("/pending", (req, res) => {
  if (req.session.loggedUser) {
    functions.getMedicos(medicosList => {
      console.log(medicosList)
      res.render("pending", { layout: "main2", user: req.session.loggedUser, medicosList: medicosList });
    })

  } else {
    res.redirect("/login");
  }
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
      user: req.session.loggedUser,
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
    res.render("turnos", { layout: "main2", user: req.session.loggedUser });
  } else {
    res.redirect("/login");
  }
});

app.get("/medicosFAV", (req, res) => {
  if (req.session.loggedUser) {
    res.render("medicos", { layout: "main2", user: req.session.loggedUser });
  } else {
    res.redirect("/login");
  }
});

app.get("/medicamentosFAV", (req, res) => {
  if (req.session.loggedUser) {
    res.render("medicamentos", { layout: "main2", user: req.session.loggedUser });
  } else {
    res.redirect("/login");
  }
});

app.get("/mismedicamentos", (req, res) => {
  if (req.session.loggedUser) {
    res.render("mismedicamentos", { layout: "main2", user: req.session.loggedUser });
  } else {
    res.redirect("/login");
  }
});

app.get("/mismedicos", (req, res) => {
  if (req.session.loggedUser) {
    res.render("mismedicos", { layout: "main2", user: req.session.loggedUser });
  } else {
    res.redirect("/login");
  }
});

app.get("/misturnos", (req, res) => {
  if (req.session.loggedUser) {
    res.render("misturnos", { layout: "main2", user: req.session.loggedUser });
  } else {
    res.redirect("/login");
  }
});

// POSTS

app.post("/login", (req, res) => {
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

//register

app.post("/register", (req, res) => {
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


//medicamentos

app.get("/medicines", (req, res) => {


  functions.getMedicamentos(medicamentoList => {
    if (req.query.filtro) {
      medicamentoList = medicamentoList.filter(function (item) {
        let nombreDataBase = item.medicamento.toUpperCase();
        let nombreRecibido = req.query.filtro.toUpperCase();
        return nombreDataBase.includes(nombreRecibido);
      })
    };

    res.json(medicamentoList.slice(0, 5));
  });




});

app.post("/medicamentoFav", (req, res) => {
  if (req.session.loggedUser) {

    functions.saveMedicamento(req.body, req.session.loggedUser.email, medicamentoAgregado => {
      if (medicamentoAgregado) {

        if (medicamentoAgregado.agregado) {
          req.session.loggedUser.medicamentos.push(medicamentoAgregado.medicamentoObj)
        }


        res.sendStatus(200);

      } else {
        res.sendStatus(500);
        console.log("error")

      }
    });


  }
});

app.get("/medicamentoAutocomplete", (req, res) => {


  functions.getMedicamentos(medicamentoList => {
    if (req.query.filtro) {
      medicamentoList = medicamentoList.filter(function (item) {
        let nombreDataBase = item.medicamento.toUpperCase();
        let nombreRecibido = req.query.filtro.toUpperCase();
        return nombreDataBase.includes(nombreRecibido);
      })
    };

    res.json(medicamentoList);
  });




});

app.post("/removeMedicamento", (req, res) => {
  if (req.session.loggedUser) {
    console.log("body", req.body);

    functions.removeMedicamento(req.body.medicamento, req.session.loggedUser.email, medicamentoBorrado => {
      if (medicamentoBorrado) {
        console.log("hola")
        console.log("med borrado", medicamentoBorrado)

        console.log("session", req.session.loggedUser)

        req.session.loggedUser.medicamentos = req.session.loggedUser.medicamentos.filter(item => {
          console.log("medicamento en session", item.medicamento)
          console.log("reqbody", req.body.medicamento)
          return item.medicamento != req.body.medicamento
        });


        res.status(200).send("va bien");

      } else {
        res.sendStatus(500);
        console.log("error")

      }
    });


  }
});


//medicos

app.get("/medicosAjax", (req, res) => {


  functions.getMedicos(medicosList => {
    if (req.query.filterByName) {
      medicosList = medicosList.filter(function (item) {
        let nombreDataBase = item.name.toUpperCase();
        let nombreRecibido = req.query.filterByName.toUpperCase();
        return nombreDataBase.includes(nombreRecibido);
      })
    };
    if (req.query.filterByEspecialidad) {
      medicosList = medicosList.filter(function (item2) {
        let especialidadDB = item2.especialidad.toUpperCase();
        let especialidadRecibida = req.query.filterByEspecialidad.toUpperCase();
        return especialidadDB.includes(especialidadRecibida);
      })
    };

    res.json(medicosList.slice(0, 5));
  });




});


app.post("/medicoFav", (req, res) => {
  if (req.session.loggedUser) {

    functions.saveMedico(req.body, req.session.loggedUser.email, medicoAgregado => {
      if (medicoAgregado) {

        if (medicoAgregado.agregado) {
          req.session.loggedUser.medicos.push(medicoAgregado.medicoObj)
        }


        res.sendStatus(200);

      } else {
        res.sendStatus(500);
        console.log("error")

      }
    });


  }
});

app.get("/medicosAutocomplete", (req, res) => {


  functions.getMedicos(medicosList => {
    if (req.query.filterByName) {
      medicosList = medicosList.filter(function (item) {
        let nombreDataBase = item.name.toUpperCase();
        let nombreRecibido = req.query.filterByName.toUpperCase();
        return nombreDataBase.includes(nombreRecibido);
      })
    };

    res.json(medicosList)
  });

});

app.post("/removeMedico", (req, res) => {
  if (req.session.loggedUser) {
    console.log("body", req.body);

    functions.removeMedico(req.body.id, req.session.loggedUser.email, medicoBorrado => {
      if (medicoBorrado) {
        console.log("hola")
        console.log("med borrado", medicoBorrado)

        console.log("session", req.session.loggedUser)

        req.session.loggedUser.medicos = req.session.loggedUser.medicos.filter(item => {
          console.log("medicamento en session", item._id)
          console.log("reqbody", req.body.id)
          return item._id != req.body.id
        });


        res.status(200).send("va bien");

      } else {
        res.sendStatus(500);
        console.log("error")

      }
    });


  }
});

////////////////////// TURNOS

app.post("/sacarTurnoParte1", (req, res) => {
  console.log("body", req.body)
  console.log("name", req.body.name);
  console.log("session", req.session.loggedUser);
  // console.log("esp", req.body.especialidad);

  if (req.session.loggedUser) {
    functions.getMedicos(medicosList => {
      if (req.body.name) {
        medicosList = medicosList.filter(function (item) {
          let nombreDataBase = item.name.toUpperCase();
          let nombreRecibido = req.body.name.toUpperCase();
          return nombreDataBase.includes(nombreRecibido);
        })

        if (req.session.loggedUser) {
          const reservaMSG = {
            class: "red-text accent-3",
            text: "El médico no tiene turnos disponibles"
          };



          res.render("reserva", { layout: "main2", user: req.session.loggedUser, medicosList: medicosList, reservaMSG });
        } else {
          res.redirect("/login");
        }
      } else {
        const turnoNoEmptyMSG = {
          class: "red-text accent-3",
          text: "Introduce el nombre de un médico por favor"
        }
        res.render("turnos", { layout: "main2", user: req.session.loggedUser, turnoNoEmptyMSG });
      }

    });

  }

})


app.post("/sacarTurnoParte2", (req, res) => {
  if (req.session.loggedUser) {

    functions.saveTurno(req.body, req.session.loggedUser.email, turnoAgregado => {
      console.log("test", req.body);

      if (turnoAgregado) {
        if (turnoAgregado.agregado) {
          req.session.loggedUser.turnos.push(turnoAgregado.turnoObj)
          functions.saveReservado(req.body.name, req.body.fecha, req.body.hora, result => {
            if (result) {
              console.log("hola!")
            }
          })
        }

        const turnoMessage = {
          class: "green-text accent-3",
          text: "Turno agregado satisfactoriamente"
        };

        res.render("turnos", { layout: "main2", user: req.session.loggedUser, turnoMessage });

      } else {
        const turnoMessage = {
          class: "red-text accent-3",
          text: "El turno ya está ocupado"
        };

        res.render("turnos", { layout: "main2", user: req.session.loggedUser, turnoMessage });

      }
    });


  }
});


/////////////////// Medicos SIDE

//Register

app.get("/registerMedicos", (req, res) => {
  res.render("signupmedicos", { layout: "main3" });
});

app.get("/medicos", (req, res) => {
  if (req.session.loggedMedico) {
    res.redirect("/homemedicos");
  }else{
    res.render("loginmedicos", { layout: "main3", message: req.session.message });
  }
});

app.get("/logoutmedicos", (req, res) => {
  req.session.destroy();
  res.redirect("/medicos");
});

app.get("/homemedicos", (req, res) => {
  if (req.session.loggedMedico) {
    res.render("homemedicos", { layout: "main3", user: req.session.loggedMedico });
  } else {
    res.redirect("/medicos");
  }
});

app.post("/registerMedicos", (req, res) => {
  console.log(req.body)
  auth.getMedico(req.body.email, result => {
    if (!result.success) {
      console.log("error al conectar a la base de datos");
      res.redirect("/medicos");
      return
    }
    if (result.email) {
      console.log("email ya en uso");
      res.redirect("/medicos");
      return
    }
    if (!req.body.password || req.body.password !== req.body.confirmPassword) {
      req.session.message = {
        class: "failure",
        text: "Las contraseñas deben ser iguales"
      }
      res.redirect("/medicos");
      return;
    }

    auth.registerMedicos(req.body.name, req.body.surname, req.body.email, req.body.especialidad, req.body.horarios, req.body.password, result => {
      if (result) {

        console.log("registración completa");
        res.redirect("/medicos");

      }
    })
  })
})

app.post("/loginMedicos", (req, res) => {

  auth.loginMedicos(req.body.email, req.body.password, result => {
    if (result.medico) {
      req.session.loggedMedico = result.medico;
      console.log("soy epico")
      res.redirect("/homemedicos");

    } else {
      req.session.message = {
        class: "failure",
        text: result.msg
      };

      res.redirect("/medicos");
    }
  })
});

app.post("/aprobarMedico", (req, res) => {

  functions.aprobarMedico(req.body.email, result => {
    if (result) {
      console.log("hola!");
      res.redirect("/pending");
    }
  })

})




app.listen(HTTP_PORT, () => {
  console.log(`servidor iniciado en http://localhost:${HTTP_PORT}`)
})