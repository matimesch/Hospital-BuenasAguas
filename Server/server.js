const HTTP_PORT = 4000;

const express = require("express");
const path = require("path");
const expHbs = require("express-handlebars");
const bodyParser = require("body-parser");

const app = express();

const auth = require("./auth");
// const turnos = require("./turnos");

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
  res.render("home", { layout: "main2" });
});

app.get("/turnos", (req, res) => {
  res.render("turnos", { layout: "main2" });
});

app.get("/medicos", (req, res) => {
  res.render("medicos", { layout: "main2" });
});

app.get("/medicamentos", (req, res) => {
  res.render("medicamentos", { layout: "main2" });
});

// POSTS

app.post("/login", (req, res) => {
  console.log(req.body)

  auth.login(req.body.email, req.body.password, result => {
    if (result.valid) {
      res.render("home", { layout: "main2" });
    } else {
      res.render("portal", {
        layout: "main", message: {
          class: "failure",
          text: result.msg
        }
      });
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
          text: "Las contraseñas deben ser iguales"
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
            text: "Te has registrado con éxito."
          }
        });

      } else {

        // Si no se pudo registrar renderizo signup con mensaje de error
        res.render("signup", {
          layout: "main",
          message: {
            class: "failure",
            text: "Error al registrar"
          }
        });

      }
    });
  });
});

//medicamento

app.get("/medicines", (req, res) => {

  // getMedicamento(function (medicamentoList) {
    const medicamentoList = getMedicamento();
      let resultados = medicamentoList;


      if (req.query.medicamento) {
          resultados = resultados.filter(function (medicamento) {
              let nombreDataBase = medicamento.toUpperCase();
              let  nombreRecibido = req.query.medicamento.toUpperCase();
              console.log(req.query);
                  return nombreDataBase.includes(nombreRecibido);


          })
      };

      res.json(resultados.slice(0,5));

  // });


});

function getMedicamento() {
  const medicamentos =["ibupirac", "amoxidal", "penoral", "roaocutan", "paracetamol", "globulitos"];  
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