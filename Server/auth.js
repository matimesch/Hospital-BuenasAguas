const mongodb = require("mongodb");
const uri = "mongodb+srv://m3sch:admin@moviesdb-irhan.mongodb.net/hospitaldb?retryWrites=true&w=majority";



// función login

const login = (email, password, cbResult) => {
    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {

        if (err) {
            cbResult({
                valid: false,
                msg: "Sorry, site is under maintenance now, retry later."
            });

        } else {
            const hospitaldb = client.db("hospitaldb");
            const usersCollection = hospitaldb.collection("persons");

            usersCollection.findOne({ email: email, password: password }, (err, foundUser) => {

                if (err) {

                    cbResult({
                        valid: false,
                        msg: "Sorry, the site is under maintenance now, retry later."
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



module.exports = {
    register,
    login,
    getUser,
}
