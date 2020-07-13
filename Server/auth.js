const mongodb = require("mongodb");
const uri =
  "mongodb+srv://m3sch:admin@moviesdb-irhan.mongodb.net/hospitaldb?retryWrites=true&w=majority";
const bcrypt = require("bcrypt");
const saltRounds = 5;

// login //

const login = (email, password, cbResult) => {
  mongodb.MongoClient.connect(
    uri,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        cbResult({
          loginMsg: "No se pudo conectar a la base de datos",
        });
      } else {
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("persons");

        usersCollection.findOne({ email: email }, (err, foundUser) => {
          if (err || !foundUser) {
            return cbResult({
              loginMsg: "Email o contraseña inválida",
            });
          }

          bcrypt.compare(password, foundUser.password, function (err, same) {
            if (err || !same) {
              return cbResult({
                loginMsg: "Email o contraseña inválida",
              });
            }

            return cbResult({
              user: {
                name: foundUser.name,
                surname: foundUser.surname,
                email: foundUser.email,
                profile: foundUser.profile,
                medicamentos: foundUser.medicamentos,
                medicos: foundUser.medicos,
                turnos: foundUser.turnos,
              },
            });
          });
          client.close();
        });
      }
    }
  );
};

// find user by email

const getUser = (email, cbResult) => {
  mongodb.MongoClient.connect(
    uri,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        cbResult({
          success: false,
        });
      } else {
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("persons");

        usersCollection.findOne({ email: email }, (err, result) => {
          if (err) {
            cbResult({
              success: false,
            });
          } else {
            cbResult({
              success: true,
              email: result,
            });
          }
          client.close();
        });
      }
    }
  );
};

// register //

const register = (name, surname, email, password, cbResult) => {
  mongodb.MongoClient.connect(
    uri,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        cbResult({
          registerMsg: "No se pudo conectar a la base de datos",
        });
      } else {
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("persons");

        bcrypt.hash(password, saltRounds, function (err, hash) {
          const newUser = {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            surname: surname.charAt(0).toUpperCase() + surname.slice(1),
            email: email,
            password: hash,
            profile: "user",
            medicamentos: [],
            medicos: [],
            turnos: [],
          };

          usersCollection.insertOne(newUser, (err, result) => {
            if (err) {
              cbResult(false);
            } else {
              cbResult(true);
            }

            client.close();
          });
        });
      }
    }
  );
};

// changepassword //

const changePassword = (email, newPassword, cbResult) => {
  mongodb.MongoClient.connect(
    uri,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        cbResult(false);
      } else {
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("persons");

        const findQuery = { email: email };

        const updateQuery = {
          $set: {
            password: newPassword,
          },
        };

        // Actualizo la clave en la DB
        usersCollection.updateOne(findQuery, updateQuery, (err, result) => {
          if (err) {
            cbResult(false);
          } else {
            cbResult(true);
          }

          client.close();
        });
      }
    }
  );
};

// find medico by ID //

const getMedico = (email, cbResult) => {
  mongodb.MongoClient.connect(
    uri,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        cbResult({
          success: false,
        });
      } else {
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("medicos");

        usersCollection.findOne({ email: email }, (err, result) => {
          if (err) {
            cbResult({
              success: false,
            });
          } else {
            cbResult({
              success: true,
              email: result,
            });
          }
          client.close();
        });
      }
    }
  );
};

// register medicos //

const registerMedicos = (
  name,
  surname,
  email,
  especialidad,
  horarios,
  password,
  cbResult
) => {
  mongodb.MongoClient.connect(
    uri,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        console.log(err);
        cbResult(false);
      } else {
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("medicos");

        let disponibilidad_turnos = [];
        for (let horario of horarios) {
          disponibilidad_turnos.push({
            fecha: horario.slice(0, 10),
            hora: horario.slice(11),
          });
        }

        bcrypt.hash(password, saltRounds, function (err, hash) {
          const newUser = {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            surname: surname.charAt(0).toUpperCase() + surname.slice(1),
            email: email,
            especialidad: especialidad,
            disponibilidad_turnos: disponibilidad_turnos,
            password: hash,
            approval: false,
          };

          // Insertamos el user en la DB
          usersCollection.insertOne(newUser, (err, result) => {
            if (err) {
              cbResult(false);
            } else {
              cbResult(true);
            }

            client.close();
          });
        });
      }
    }
  );
};

// login medicos //

const loginMedicos = (email, password, cbResult) => {
  mongodb.MongoClient.connect(
    uri,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        cbResult({
          msg: "No se pudo conectar a la base de datos",
        });
      } else {
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("medicos");

        usersCollection.findOne({ email: email }, (err, foundMedico) => {
          if (err || !foundMedico) {
            return cbResult({
              msg: "Email o contraseña inválida",
            });
          }
          if (!foundMedico.approval) {
            console.log("necesitas ser aprobadoetc");
            return cbResult({
              msg:
                "Necesitas ser aprobado como un médico oficial por el admin, por favor espera",
            });
          }

          bcrypt.compare(password, foundMedico.password, function (err, same) {
            if (err || !same) {
              return cbResult({
                msg: "Email o contraseña inválida",
              });
            }

            return cbResult({
              medico: {
                name: foundMedico.name,
                surname: foundMedico.surname,
                email: foundMedico.email,
                especialidad: foundMedico.especialidad,
                disponibilidad_turnos: foundMedico.disponibilidad_turnos,
              },
            });
          });
          client.close();
        });
      }
    }
  );
};

module.exports = {
  register,
  login,
  getUser,
  changePassword,
  registerMedicos,
  getMedico,
  loginMedicos,
};
