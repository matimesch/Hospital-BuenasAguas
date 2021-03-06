const mongodb = require("mongodb");
const uri =
  "mongodb+srv://m3sch:admin@moviesdb-irhan.mongodb.net/hospitaldb?retryWrites=true&w=majority";

// -- medicamentos -- //

const getMedicamentos = (cbResult) => {
  mongodb.MongoClient.connect(
    uri,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        cbResult(false);
      } else {
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("medicamentos");

        usersCollection.find().toArray(function (err, cursor) {
          if (err) {
            console.log(err);
          } else {
            cbResult(cursor);
          }
          client.close();
        });
      }
    }
  );
};

const saveMedicamento = (medicamentoObj, email, cbResult) => {
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

        const newMedicamento = {
          $addToSet: {
            medicamentos: medicamentoObj,
          },
        };

        // Insertamos el user en la DB

        usersCollection.updateOne(findQuery, newMedicamento, (err, result) => {
          if (err) {
            console.log(err);
            cbResult(false);
          } else {
            cbResult({
              agregado: result.modifiedCount > 0 ? true : false,
              medicamentoObj: medicamentoObj,
            });
          }

          client.close();
        });
      }
    }
  );
};

const removeMedicamento = (medicamentoFilter, email, cbResult) => {
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

        const DeleteMedicamento = {
          $pull: { medicamentos: { medicamento: medicamentoFilter } },
        };

        // Eliminamos el user en la DB

        usersCollection.updateOne(
          findQuery,
          DeleteMedicamento,
          (err, result) => {
            if (err) {
              console.log(err);
              cbResult(false);
            } else {
              console.log(
                result.result.nModified,
                result.modifiedCount,
                result.matchedCount
              );
              cbResult({
                medicamentoObj: medicamentoFilter,
              });
            }

            client.close();
          }
        );
      }
    }
  );
};

// -- medicos -- //

const getMedicos = (cbResult) => {
  mongodb.MongoClient.connect(
    uri,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        cbResult(false);
      } else {
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("medicos");

        usersCollection.find().toArray(function (err, cursor) {
          // cursor.toArray(cbResult);
          if (err) {
            console.log(err);
          } else {
            cbResult(cursor);
          }
          client.close();
        });
      }
    }
  );
};

const saveMedico = (medicoObj, email, cbResult) => {
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

        const newMedico = {
          $addToSet: {
            medicos: medicoObj,
          },
        };

        // Insertamos el user en la DB

        usersCollection.updateOne(findQuery, newMedico, (err, result) => {
          if (err) {
            console.log(err);
            cbResult(false);
          } else {
            cbResult({
              agregado: result.modifiedCount > 0 ? true : false,
              medicoObj: medicoObj,
            });
          }

          client.close();
        });
      }
    }
  );
};

const removeMedico = (id, email, cbResult) => {
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

        const deleteMedico = {
          $pull: { medicos: { _id: id } },
        };

        // Eliminamos el user en la DB

        usersCollection.updateOne(findQuery, deleteMedico, (err, result) => {
          if (err) {
            console.log(err);
            cbResult(false);
          } else {
            console.log(
              result.result.nModified,
              result.modifiedCount,
              result.matchedCount
            );
            cbResult({
              medicoObj: id.toString(),
            });
          }

          client.close();
        });
      }
    }
  );
};

// -- turnos -- //

const saveTurno = (turnoObj, email, cbResult) => {
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

        const newturno = {
          $addToSet: {
            turnos: turnoObj,
          },
        };

        usersCollection.updateOne(findQuery, newturno, (err, result) => {
          if (err) {
            console.log(err);
            cbResult(false);
          } else {
            cbResult({
              agregado: result.modifiedCount > 0 ? true : false,
              turnoObj: turnoObj,
            });
          }

          client.close();
        });
      }
    }
  );
};

const saveReservado = (name, fecha, hora, cbResult) => {
  mongodb.MongoClient.connect(
    uri,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        cbResult(false);
      } else {
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("medicos");

        const findQuery = {
          name: name,
          disponibilidad_turnos: {
            $elemMatch: { fecha: fecha, hora: hora },
          },
        };

        const newReserva = {
          $set: { "disponibilidad_turnos.$.reservado": "true" },
        };

        // Insertamos el user en la DB

        usersCollection.updateOne(findQuery, newReserva, (err, result) => {
          if (err) {
            console.log(err);
            cbResult(false);
          } else {
            cbResult(console.log(result));
          }

          client.close();
        });
      }
    }
  );
};

const removeTurno = (email, medico, fecha, hora, cbResult) => {
  mongodb.MongoClient.connect(
    uri,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        cbResult(false);
      } else {
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("persons");

        const findQuery = {
          email: email,
        };

        const deleteMedico = {
          $pull: {
            turnos: {
              name: medico,
              fecha: fecha,
              hora: hora,
            },
          },
        };

        usersCollection.updateOne(findQuery, deleteMedico, (err, result) => {
          if (err) {
            console.log(err);
            cbResult(false);
          } else {
            console.log(
              result.result.nModified,
              result.modifiedCount,
              result.matchedCount
            );
            cbResult(true);
          }

          client.close();
        });
      }
    }
  );
};

const removeReservado = (name, fecha, hora, cbResult) => {
  mongodb.MongoClient.connect(
    uri,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        cbResult(false);
      } else {
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("medicos");

        const findQuery = {
          name: name,
          disponibilidad_turnos: {
            $elemMatch: { fecha: fecha, hora: hora },
          },
        };

        const newReserva = {
          $set: { "disponibilidad_turnos.$.reservado": "" },
        };

        // Insertamos el user en la DB

        usersCollection.updateOne(findQuery, newReserva, (err, result) => {
          if (err) {
            console.log(err);
            cbResult(false);
          } else {
            cbResult(console.log(result));
          }

          client.close();
        });
      }
    }
  );
};

// Admin - aprobar médico //

const aprobarMedico = (email, cbResult) => {
  mongodb.MongoClient.connect(
    uri,
    { useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        cbResult(false);
      } else {
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("medicos");

        const findQuery = {
          email: email,
        };

        const Aprobado = { $set: { approval: true } };

        // Insertamos el user en la DB

        usersCollection.updateOne(findQuery, Aprobado, (err, result) => {
          if (err) {
            console.log(err);
            cbResult(false);
          } else {
            cbResult(console.log(result));
          }

          client.close();
        });
      }
    }
  );
};

module.exports = {
  saveMedicamento,
  getMedicamentos,
  removeMedicamento,
  getMedicos,
  saveMedico,
  removeMedico,
  saveTurno,
  saveReservado,
  removeTurno,
  aprobarMedico,
  removeReservado,
};
