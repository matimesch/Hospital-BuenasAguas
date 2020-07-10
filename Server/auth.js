const mongodb = require("mongodb");
const uri = "mongodb+srv://m3sch:admin@moviesdb-irhan.mongodb.net/hospitaldb?retryWrites=true&w=majority";
const bcrypt = require('bcrypt');
const saltRounds = 5;

// función login

const login = (email, password, cbResult) => {
    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {

        if (err) {
            cbResult({
                msg: "No se pudo conectar a la base de datos"
            });

        } else {
            const hospitaldb = client.db("hospitaldb");
            const usersCollection = hospitaldb.collection("persons");



            usersCollection.findOne({ email: email }, (err, foundUser) => {

                if (err || !foundUser) {

                    return cbResult({
                        msg: "Email o contraseña inválida"
                    });

                }

                bcrypt.compare(password, foundUser.password, function (err, same) {
                    if (err || !same) {
                        return cbResult({
                            msg: "Email o contraseña inválida"
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
                            turnos: foundUser.turnos
                        }
                    });


                })
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

            usersCollection.findOne({ email: email }, (err, result) => {
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

            console.log(err)
            cbResult(false);

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
                    turnos: []
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

const changePassword = (email, newPassword, cbResult) => {

    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {

        if (err) {

            cbResult(false);

        } else {

            const hospitaldb = client.db("hospitaldb");
            const usersCollection = hospitaldb.collection("persons");

            const findQuery = { email: email };

            const updateQuery = {
                $set: {
                    password: newPassword
                }
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

    });

}

///////

const getMedico = (email, cbResult) => {
    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
            cbResult({
                success: false
            });
        }
        else {
            const hospitaldb = client.db("hospitaldb");
            const usersCollection = hospitaldb.collection("medicos");

            usersCollection.findOne({ email: email }, (err, result) => {
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

///////

const registerMedicos = (name, surname, email, especialidad, horarios, password, cbResult) => {
    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {

        if (err) {

            console.log(err)
            cbResult(false);

        } else {

            const hospitaldb = client.db("hospitaldb");
            const usersCollection = hospitaldb.collection("medicos");

            let disponibilidad_turnos = []
            for (let horario of horarios) {
                disponibilidad_turnos.push({
                    fecha: horario.slice(0, 10),
                    hora: horario.slice(11)
                })
            }

            bcrypt.hash(password, saltRounds, function (err, hash) {
                const newUser = {
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    surname: surname.charAt(0).toUpperCase() + surname.slice(1),
                    email: email,
                    especialidad: especialidad,
                    disponibilidad_turnos: disponibilidad_turnos,
                    password: hash,
                    approval: false
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

    });
}


const loginMedicos = (email, password, cbResult) => {
    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {

        if (err) {
            cbResult({
                msg: "No se pudo conectar a la base de datos"
            });

        } else {
            const hospitaldb = client.db("hospitaldb");
            const usersCollection = hospitaldb.collection("medicos");



            usersCollection.findOne({ email: email }, (err, foundMedico) => {

                if (err || !foundMedico) {

                    return cbResult({
                        msg: "Email o contraseña inválida"
                    });

                }
                if (!foundMedico.approval) {
                    console.log("necesitas ser aprobadoetc")
                    return cbResult({
                        msg: "Necesitas ser aprobado como un médico oficial por el admin, por favor espera"
                    });
                }

                bcrypt.compare(password, foundMedico.password, function (err, same) {
                    if (err || !same) {
                        return cbResult({
                            msg: "Email o contraseña inválida"
                        });
                    }

                    return cbResult({
                        medico: {
                            name: foundMedico.name,
                            surname: foundMedico.surname,
                            email: foundMedico.email,
                            especialidad: foundMedico.especialidad,
                            disponibilidad_turnos: foundMedico.disponibilidad_turnos
                        }
                    });


                })
                client.close();
            });


        }

    });
}


module.exports = {
    register,
    login,
    getUser,
    changePassword,
    registerMedicos,
    getMedico,
    loginMedicos
}
