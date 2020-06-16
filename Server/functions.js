const mongodb = require("mongodb");
const uri = "mongodb+srv://m3sch:admin@moviesdb-irhan.mongodb.net/hospitaldb?retryWrites=true&w=majority";

const getMedicamentos = (cbResult) => {
    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
            cbResult(false);
        }
        else {
            const hospitaldb = client.db("hospitaldb");
            const usersCollection = hospitaldb.collection("medicamentos");

            console.log("llegue a get")

            usersCollection.find().toArray(function (err, cursor) {
                // cursor.toArray(cbResult);
                if (err) {
                    console.log(err);
                } else {
                    cbResult(cursor);

                }
                client.close();

            });

            // usersCollection.find({}).toArray,(err,result) =>{
            //         console.log("result",result)
            //         cbResult(true);
            //     };

        }

    });
}

const saveMedicamento = (medicamentoObj, email, cbResult) => {
    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {

        if (err) {

            cbResult(false);

        } else {

            const hospitaldb = client.db("hospitaldb");
            const usersCollection = hospitaldb.collection("persons");

            const findQuery = { email: email };

            const newMedicamento = {
                $addToSet: {
                    medicamentos: medicamentoObj
                }
            };

            // Insertamos el user en la DB


            usersCollection.updateOne(findQuery, newMedicamento, (err, result) => {

                if (err) {
                    console.log(err)
                    cbResult(false);
                } else {
                    cbResult(medicamentoObj);
                }

                client.close();
            });

        }

    });
}

////////////////

// const removeMedicamento = (medicamentoObj, email, cbResult) => {
//     mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {

//         if (err) {

//             cbResult(false);

//         } else {

//             const hospitaldb = client.db("hospitaldb");
//             const usersCollection = hospitaldb.collection("persons");

//             const findQuery = { email: email };

//             const newMedicamento = {
//                 $$pull: {
//                     medicamentos: medicamentoObj
//                 }
//             };

//             // Insertamos el user en la DB


//             usersCollection.updateOne(findQuery, newMedicamento, (err, result) => {

//                 if (err) {
//                     console.log(err)
//                     cbResult(false);
//                 } else {
//                     cbResult(medicamentoObj);
//                 }

//                 client.close();
//             });

//         }

//     });
// }


module.exports = {
    saveMedicamento,
    getMedicamentos,
    // removeMedicamento

}