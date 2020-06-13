const mongodb = require("mongodb");
const uri = "mongodb+srv://m3sch:admin@moviesdb-irhan.mongodb.net/hospitaldb?retryWrites=true&w=majority";

const getTurno = (medico, especialidad, dateTime, cbResult) => {
    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
            cbResult({
                success: false
            });
        }
        else {
            const hospitaldb = client.db("hospitaldb");
            const usersCollection = hospitaldb.collection("turnos");
            let turno = { medico: medico, especialidad: especialidad, dateTime: dateTime };

            usersCollection.findOne(turno, (err, result) => {
                if (err) {
                    cbResult({
                        success: false
                    });
                }
                else {
                    cbResult({
                        success: true,
                        turno: result
                    });
                }
                client.close();
            });
        }

    });
}

// const registerTurno = (user,medico, especialidad, dateTime, cbResult) => {
//     mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {

//         if (err) {

//             // Si hay error de conexión, retornamos el false
//             // (no cerramos conexión porque no se logró abrir)
//             console.log(err)
//             cbResult(false);

//         } else {

//             const hospitaldb = client.db("hospitaldb");
//             const usersCollection = hospitaldb.collection("persons");

//             const newUser = {
//                 name: name,
//                 surname: surname,
//                 email: email,
//                 password: password
//             };

//             // Insertamos el user en la DB
//             usersCollection.insertOne(newUser, (err, result) => {
//                 console.log(result)
//                 if (err) {
//                     cbResult(false);
//                 } else {
//                     cbResult(true);
//                 }

//                 client.close();
//             });

//         }

//     });
// }



module.exports = {
    getTurno
}