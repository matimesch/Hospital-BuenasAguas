const express = require("express");

const pacientesRouter = express.Router();

const functions = require("../functions");

// ADMIN //

pacientesRouter.get("/pending", (req, res) => {
  if (req.session.loggedUser) {
    if (req.session.loggedUser.profile == "admin") {
      functions.getMedicos((medicosList) => {
        console.log(medicosList);
        res.render("pending", {
          layout: "main2Admin",
          user: req.session.loggedUser,
          medicosList: medicosList,
        });
      });
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
});

pacientesRouter.post("/aprobarMedico", (req, res) => {
  functions.aprobarMedico(req.body.email, (result) => {
    if (result) {
      console.log("hola!");
      res.redirect("/pending");
    }
  });
});

// Home //

pacientesRouter.get("/home", (req, res) => {
  if (req.session.loggedUser) {
    res.render("paciente/home", {
      layout: "main2",
      user: req.session.loggedUser,
    });
  } else {
    res.redirect("/login");
  }
});

// --- Turnos --- //

pacientesRouter.get("/turnos", (req, res) => {
  if (req.session.loggedUser) {
    res.render("paciente/turnos/turnos", {
      layout: "main2",
      user: req.session.loggedUser,
    });
  } else {
    res.redirect("/login");
  }
});

pacientesRouter.post("/sacarTurnoParte1", (req, res) => {
  console.log("body", req.body);
  console.log("name", req.body.name);
  console.log("session", req.session.loggedUser);
  // console.log("esp", req.body.especialidad);

  if (req.session.loggedUser) {
    functions.getMedicos((medicosList) => {
      if (req.body.name) {
        medicosList = medicosList.filter(function (item) {
          let nombreDataBase = item.name.toUpperCase();
          let nombreRecibido = req.body.name.toUpperCase();
          return nombreDataBase.includes(nombreRecibido);
        });

        if (req.session.loggedUser) {
          const reservaMSG = {
            class: "red-text accent-3",
            text: "El médico no tiene turnos disponibles",
          };

          res.render("paciente/turnos/reserva", {
            layout: "main2",
            user: req.session.loggedUser,
            medicosList: medicosList,
            reservaMSG,
          });
        } else {
          res.redirect("/login");
        }
      } else {
        const turnoNoEmptyMSG = {
          class: "red-text accent-3",
          text: "Introduce el nombre de un médico por favor",
        };
        res.render("paciente/turnos/turnos", {
          layout: "main2",
          user: req.session.loggedUser,
          turnoNoEmptyMSG,
        });
      }
    });
  }
});

pacientesRouter.post("/sacarTurnoParte2", (req, res) => {
  if (req.session.loggedUser) {
    functions.saveTurno(
      req.body,
      req.session.loggedUser.email,
      (turnoAgregado) => {
        console.log("test", req.body);

        if (turnoAgregado) {
          if (turnoAgregado.agregado) {
            req.session.loggedUser.turnos.push(turnoAgregado.turnoObj);
            functions.saveReservado(
              req.body.name,
              req.body.fecha,
              req.body.hora,
              (result) => {
                if (result) {
                  console.log("hola!");
                }
              }
            );
          }

          const turnoMessage = {
            class: "green-text accent-3",
            text: "Turno agregado satisfactoriamente",
          };

          res.render("paciente/turnos/turnos", {
            layout: "main2",
            user: req.session.loggedUser,
            turnoMessage,
          });
        } else {
          const turnoMessage = {
            class: "red-text accent-3",
            text: "El turno ya está ocupado",
          };

          res.render("paciente/turnos/turnos", {
            layout: "main2",
            user: req.session.loggedUser,
            turnoMessage,
          });
        }
      }
    );
  }
});

pacientesRouter.get("/misturnos", (req, res) => {
  if (req.session.loggedUser) {
    res.render("paciente/turnos/misturnos", {
      layout: "main2",
      user: req.session.loggedUser,
    });
  } else {
    res.redirect("/login");
  }
});

pacientesRouter.post("/removeTurno", (req, res) => {
  if (req.session.loggedUser) {
    let split = req.body.string.split(",");
    console.log(split);
    let turnoObj = {
      medico: split[0],
      fecha: split[1],
      hora: split[2],
    };
    console.log("turnoObj", turnoObj);

    functions.removeTurno(
      req.session.loggedUser.email,
      turnoObj.medico,
      turnoObj.fecha,
      turnoObj.hora,
      (turnoBorrado) => {
        if (turnoBorrado) {
          console.log("hola");
          console.log("med borrado", turnoBorrado);

          console.log("session", req.session.loggedUser.turnos);

          req.session.loggedUser.turnos = req.session.loggedUser.turnos.filter(
            (item) => {
              return (
                item.name != turnoObj.medico &&
                item.fecha != turnoObj.fecha &&
                item.hora != turnoObj.hora
              );
            }
          );

          functions.removeReservado(
            turnoObj.medico,
            turnoObj.fecha,
            turnoObj.hora,
            (result) => {
              if (result) {
                console.log("borra3!");
              }
            }
          );

          console.log("session2", req.session.loggedUser.turnos);

          res.status(200).send("va bien");
        } else {
          res.sendStatus(500);
          console.log("error");
        }
      }
    );
  }
});

// --- Medicos --- //

pacientesRouter.get("/medicosFAV", (req, res) => {
  if (req.session.loggedUser) {
    res.render("paciente/medicos/medicos", {
      layout: "main2",
      user: req.session.loggedUser,
    });
  } else {
    res.redirect("/login");
  }
});

pacientesRouter.get("/medicosAutocomplete", (req, res) => {
  functions.getMedicos((medicosList) => {
    if (req.query.filterByName) {
      medicosList = medicosList.filter(function (item) {
        let nombreDataBase = item.name.toUpperCase();
        let nombreRecibido = req.query.filterByName.toUpperCase();
        return nombreDataBase.includes(nombreRecibido);
      });
    }

    res.json(medicosList);
  });
});

pacientesRouter.get("/medicosAjax", (req, res) => {
  functions.getMedicos((medicosList) => {
    if (req.query.filterByName) {
      medicosList = medicosList.filter(function (item) {
        let nombreDataBase = item.name.toUpperCase();
        let nombreRecibido = req.query.filterByName.toUpperCase();
        return nombreDataBase.includes(nombreRecibido);
      });
    }
    if (req.query.filterByEspecialidad) {
      medicosList = medicosList.filter(function (item2) {
        let especialidadDB = item2.especialidad.toUpperCase();
        let especialidadRecibida = req.query.filterByEspecialidad.toUpperCase();
        return especialidadDB.includes(especialidadRecibida);
      });
    }

    res.json(medicosList.slice(0, 5));
  });
});

pacientesRouter.post("/saveMedicoFav", (req, res) => {
  if (req.session.loggedUser) {
    functions.saveMedico(
      req.body,
      req.session.loggedUser.email,
      (medicoAgregado) => {
        if (medicoAgregado) {
          if (medicoAgregado.agregado) {
            req.session.loggedUser.medicos.push(medicoAgregado.medicoObj);
          }

          res.sendStatus(200);
        } else {
          res.sendStatus(500);
          console.log("error");
        }
      }
    );
  }
});

pacientesRouter.post("/removeMedico", (req, res) => {
  if (req.session.loggedUser) {
    console.log("body", req.body);

    functions.removeMedico(
      req.body.id,
      req.session.loggedUser.email,
      (medicoBorrado) => {
        if (medicoBorrado) {
          console.log("hola");
          console.log("med borrado", medicoBorrado);

          console.log("session", req.session.loggedUser);

          req.session.loggedUser.medicos = req.session.loggedUser.medicos.filter(
            (item) => {
              console.log("medicamento en session", item._id);
              console.log("reqbody", req.body.id);
              return item._id != req.body.id;
            }
          );

          res.status(200).send("va bien");
        } else {
          res.sendStatus(500);
          console.log("error");
        }
      }
    );
  }
});

pacientesRouter.get("/mismedicos", (req, res) => {
  if (req.session.loggedUser) {
    res.render("paciente/medicos/mismedicos", {
      layout: "main2",
      user: req.session.loggedUser,
    });
  } else {
    res.redirect("/login");
  }
});

// --- Medicamentos --- //

pacientesRouter.get("/medicamentosFAV", (req, res) => {
  if (req.session.loggedUser) {
    res.render("paciente/medicamentos/medicamentos", {
      layout: "main2",
      user: req.session.loggedUser,
    });
  } else {
    res.redirect("/login");
  }
});

pacientesRouter.get("/medicamentoAutocomplete", (req, res) => {
  functions.getMedicamentos((medicamentoList) => {
    if (req.query.filtro) {
      medicamentoList = medicamentoList.filter(function (item) {
        let nombreDataBase = item.medicamento.toUpperCase();
        let nombreRecibido = req.query.filtro.toUpperCase();
        return nombreDataBase.includes(nombreRecibido);
      });
    }

    res.json(medicamentoList);
  });
});

pacientesRouter.get("/medicamentosAjax", (req, res) => {
  functions.getMedicamentos((medicamentoList) => {
    if (req.query.filtro) {
      medicamentoList = medicamentoList.filter(function (item) {
        let nombreDataBase = item.medicamento.toUpperCase();
        let nombreRecibido = req.query.filtro.toUpperCase();
        return nombreDataBase.includes(nombreRecibido);
      });
    }

    res.json(medicamentoList.slice(0, 5));
  });
});

pacientesRouter.post("/saveMedicamentoFav", (req, res) => {
  if (req.session.loggedUser) {
    functions.saveMedicamento(
      req.body,
      req.session.loggedUser.email,
      (medicamentoAgregado) => {
        if (medicamentoAgregado) {
          if (medicamentoAgregado.agregado) {
            req.session.loggedUser.medicamentos.push(
              medicamentoAgregado.medicamentoObj
            );
          }

          res.sendStatus(200);
        } else {
          res.sendStatus(500);
          console.log("error");
        }
      }
    );
  }
});

pacientesRouter.post("/removeMedicamento", (req, res) => {
  if (req.session.loggedUser) {
    console.log("body", req.body);

    functions.removeMedicamento(
      req.body.medicamento,
      req.session.loggedUser.email,
      (medicamentoBorrado) => {
        if (medicamentoBorrado) {
          console.log("hola");
          console.log("med borrado", medicamentoBorrado);

          console.log("session", req.session.loggedUser);

          req.session.loggedUser.medicamentos = req.session.loggedUser.medicamentos.filter(
            (item) => {
              console.log("medicamento en session", item.medicamento);
              console.log("reqbody", req.body.medicamento);
              return item.medicamento != req.body.medicamento;
            }
          );

          res.status(200).send("va bien");
        } else {
          res.sendStatus(500);
          console.log("error");
        }
      }
    );
  }
});

pacientesRouter.get("/mismedicamentos", (req, res) => {
  if (req.session.loggedUser) {
    res.render("paciente/medicamentos", {
      layout: "main2",
      user: req.session.loggedUser,
    });
  } else {
    res.redirect("/login");
  }
});

module.exports = pacientesRouter;
