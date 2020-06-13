const mongodb = require("mongodb");
const uri = "mongodb+srv://m3sch:admin@moviesdb-irhan.mongodb.net/hospitaldb?retryWrites=true&w=majority";



// función login

const login = (email, password, cbResult) => {
    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {

        if (err) {
            cbResult({
                valid: false,
                msg: "No se pudo conectar a la base de datos"
            });

        } else {
            const hospitaldb = client.db("hospitaldb");
            const usersCollection = hospitaldb.collection("persons");

            usersCollection.findOne({ email: email, password: password }, (err, foundUser) => {

                if (err) {

                    cbResult({
                        valid: false,
                        msg: "Usuario no registrado, registrate por favor."
                    });

                } else {

                    if (!foundUser) {
                        console.log(foundUser)
                        cbResult({
                            valid: false,
                            msg: "Mail o contraseña inválidos"
                        });
                    } else {
                        console.log(foundUser)
                        cbResult({
                            valid: true
                        });
                    }

                }

                client.close();
            });

        }

    });
}




//funcion que consulta a las peronas de la db



// getUser

const getUser = (email, cbResult) => {
    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
            cbResult({
                success: false
            });
        }
        else {
            const hospitaldb = client.db("hospitaldb");
            const usersCollection = hospitaldb.collection("persons");

            usersCollection.findOne({ email: email}, (err, result) => {
                if (err) {
                    cbResult({
                        success: false
                    });
                }
                else {
                    cbResult({
                        success: true,
                        email: result
                    });
                }
                client.close();
            });
        }

    });
}

//




// REGISTER

const register = (name, surname, email, password, cbResult) => {
    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {

        if (err) {

            // Si hay error de conexión, retornamos el false
            // (no cerramos conexión porque no se logró abrir)
            console.log(err)
            cbResult(false);

        } else {

            const hospitaldb = client.db("hospitaldb");
            const usersCollection = hospitaldb.collection("persons");

            const newUser = {
                name: name,
                surname: surname,
                email: email,
                password: password
            };

            // Insertamos el user en la DB
            usersCollection.insertOne(newUser, (err, result) => {
                console.log(result)
                if (err) {
                    cbResult(false);
                } else {
                    cbResult(true);
                }

                client.close();
            });

        }

    });
}

//getById

// const getByid = (filterId, cbResult) => {
//     mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
//       if (err) {
//         // retornar array vacío
//         cbResult(undefined);
//         client.close();
//       } else {
//         const hospitaldb = client.db("hospitaldb");
//         const usersCollection = hospitaldb.collection("persons");
  
//         personsCollection.find().toArray(({_id : new mongodb.ObjectID(filterID) }, (err, person) => {
  
//           // retornar array con datos
//           if (err) {
//             cbResult(undefined);
//           } else {
//             cbResult({
//                 oid = person._id.toString(),
//                 name: person.name,
//                 surname : person.surname,
//                 email : person.email,
//                 password : person.password,
//                 profile : "user"
//             });
//           }
  
//           client.close();
//         })) ;
  
//       }
//     });
//   }

const changePassword = (username, newPassword, cbResult) => {

    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
  
      if (err) {
  
        // Si hay error de conexión, retornamos el false
        // (no cerramos conexión porque no se logró abrir)
        cbResult(false);
  
      } else {
  
        const hospitaldb = client.db("hospitaldb");
        const usersCollection = hospitaldb.collection("persons");
  
        const findQuery = { user: username };
  
        const updateQuery = {
          $set: {
            password: newPassword
          }
        };
  
        // Actualizo la clave en la DB
        usersCollection.updateOne(findQuery, updateQuery, (err, result) => {
  
          if (err) {
            console.log(err);
            cbResult(false);
          } else {
            cbResult(true);
          }
  
          client.close();
        });
  
      }
  
    });
  
  }



module.exports = {
    register,
    login,
    getUser,
    changePassword
}
