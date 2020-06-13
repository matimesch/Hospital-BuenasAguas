const mongodb = require("mongodb");
const uri = "mongodb+srv://m3sch:admin@moviesdb-irhan.mongodb.net/hospitaldb?retryWrites=true&w=majority";

const getMedicos = (surname, cbResult) => {
    mongodb.MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
            cbResult({
                success: false
            });
        }
        else {
            const hospitaldb = client.db("hospitaldb");
            const usersCollection = hospitaldb.collection("medicos");

            usersCollection.findOne({ surname: surname}, (err, result) => {
                if (err) {
                    cbResult({
                        success: false
                    });
                }
                else {
                    cbResult({
                        success: true,
                        surname: result
                    });
                }
                client.close();
            });
        }

    });
}


app.get("/person", (req, res) => {

    const peopleList = getMedicos();

    let resultados = peopleList;


    if (req.query.name) {
        resultados = resultados.filter(function (medico) {
            let nombreDataBase = medico.name.toUpperCase();
            let nombreRecibido = req.query.name.toUpperCase();
            return nombreDataBase.includes(nombreRecibido)
        })
    };

    if (req.query.especialidad) {
        resultados = resultados.filter(function (person) {
            let especialidadDB = person.especialidad;
            let especialidadRecibida = req.query.especialidad;
            return especialidadDB == especialidadRecibida;
        })
    };

    res.json(resultados);

});