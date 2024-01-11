const express = require("express");
const app = express();
const cors = require("cors");
const {createConnection} = require("mysql2");
const cred = require('./credentials.js').DBcredentials;



//middleware
app.use(express.json());
// app.use(cors({ credentials: true, origin: 'http://localhost:4000' }));


class Connection {
    #_conn

    constructor() {
        this.#_conn = null
    }
    async getConnection(){
        if(this.#_conn === null && this.#_conn === undefined){
            this.#_conn = await createConnection({
                host: cred.host,
                database: cred.database,
                user: cred.user,
                password: cred.password,
            })
            await this.#_conn.connect()
        }
        return this.#_conn;
    }
}

const connect = new Connection();

app.get('/test', async (req, res) => {
    try {
        let conn = await connect.getConnection();
        let query = 'SHOW GRANTS';

        console.log(query);
        console.log(conn);

        const [results] = await conn.query(query);

        return results;
    } catch (e) {
        console.log(e)
        res.status(400).json(e);
    }
});


app.listen(8001, () => {
    console.log(`app sulla porta ${8001}`);
})