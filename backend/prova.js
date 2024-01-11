const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql2")
const cred = require('./credentials.js').DBcredentials;



//middleware
app.use(express.json());
// app.use(cors({ credentials: true, origin: 'http://localhost:4000' }));

app.get('/test', async (req, res) => {
    try {

        const connection = mysql.createConnection(cred)

        connection.connect(function (err) {
            if (err) throw (err);
            console.log("Connected!");

            connection.query(`SELECT 1`, function (err, results, fields) {
                if (err) {
                    console.log(err.message);
                }
                if (results) res.json(results)
                else req.json('empty')
            });
        });


    } catch (e) {
        console.log(e)
        res.status(400).json(e);
    }
});

app.listen(8001, () => {
    console.log(`app sulla porta ${8001}`);
})