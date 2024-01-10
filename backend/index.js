const express = require("express");
const app = express();
const cors = require("cors");
const {createConnection} = require("mysql2");

const PORT = 10000;
const CREATE_QUERIES = [
    `CREATE TABLE SerieTV(Id MEDIUMINT UNSIGNED not NULL AUTO_INCREMENT,Titolo VARCHAR(30) not NULL,NStagioni SMALLINT not NULL,PRIMARY KEY (Id))`,
    `CREATE TABLE ProdCinema(Id MEDIUMINT UNSIGNED not NULL AUTO_INCREMENT, Rating SMALLINT, Durata MEDIUMINT not NULL, 
        Budget INT not NULL, Anno YEAR(4), Titolo VARCHAR(30) not NULL, Cara ENUM('G','PG','PG-13','R','NC-17'), 
        Scadenza DATE not NULL, Tipo ENUM('serie_tv','film') not NULL, Stagione SMALLINT,  Serietv MEDIUMINT UNSIGNED,
        PRIMARY KEY (Id), FOREIGN KEY (Serietv) REFERENCES SerieTV(Id), CHECK(Rating >= 0 AND Rating <= 10))`,
    `CREATE TABLE Personale(Codice CHAR(16) not NULL, Nome VARCHAR(20) not NULL, DataNasc DATE, Nazionalità VARCHAR(30), Compito VARCHAR(20), PRIMARY KEY(Codice))`,
    `CREATE TABLE Account(Mail VARCHAR(40) not NULL, Password VARCHAR(100) not NULL, Abbonamento ENUM('mensile', 'semestrale', 'annuale', 'annuale PRO') not NULL,
        DataCreaz DATE not NULL, PRIMARY KEY (Mail), CHECK(Mail REGEXP "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"))`,
    `CREATE TABLE Utente(Nome VARCHAR(20) not NULL, Account VARCHAR(40) not NULL, Età SMALLINT, Posizione VARCHAR(100), Ling VARCHAR(30),Dispositivo VARCHAR(20)
        TempoUtilizzo MEDIUM INT UNSIGNED, PRIMARY KEY(Nome, Account), FOREIGN KEY (Account) REFERENCES Account(Mail))`,
    `CREATE TABLE Ambientazione( ProdCin MEDIUMINT UNSIGNED not NULL, Location VARCHAR(30), FOREIGN KEY (ProdCin) REFERENCES ProdCinema(Id))`,
    `CREATE TABLE Categoria(ProdCin MEDIUMINT UNSIGNED not NULL, Genere VARCHAR(30), FOREIGN KEY (ProdCin) REFERENCES ProdCinema(Id))`,
    `CREATE TABLE Creazione(ProdCin MEDIUMINT UNSIGNED not NULL, Personale CHAR(16) not NULL, FOREIGN KEY (ProdCin) REFERENCES ProdCinema(Id), FOREIGN KEY (Personale) REFERENCES Personale(Codice))`,
    `CREATE TABLE Parte( ProdCinema MEDIUMINT UNSIGNED not NULL, Attore CHAR(16) not NULL, Ruolo VARCHAR(20) not NULL, PRIMARY KEY (ProdCinema , Attore, Ruolo), 
        FOREIGN KEY (ProdCinema) REFERENCES ProdCinema(Id), FOREIGN KEY (Attore) REFERENCES Personale(Codice))`
    `CREATE TABLE Recensione(,Utente VARCHAR(20) not NULL, Account VARCHAR(40) not NULL, ProdCinema MEDIUMINT UNSIGNED not NULL, Gradimento SMALLINT not NULL,
        PRIMARY KEY (Utente, Account, ProdCinema), FOREIGN KEY (Utente) REFERENCES Utente(Nome), FOREIGN KEY (Account) REFERENCES Account(Mail), FOREIGN KEY (ProdCinema) REFERENCES ProdCinema(Id)
        CHECK(Grandimento <= 10 AND Grandimento >= 0))`,
    `CREATE TABLE Visione(Utente VARCHAR(20) not NULL, Account VARCHAR(40) not NULL, ProdCinema MEDIUMINT UNSIGNED not NULL, Watchtime INT UNSIGNED not NULL, Data DATE not NULL,
        PRIMARY KEY (Utente, Account, ProdCinema ), FOREIGN KEY (Utente) REFERENCES Utente(Nome), FOREIGN KEY (Account) REFERENCES Account(Mail), FOREIGN KEY (ProdCinema ) REFERENCES ProdCinema(Id))`,
    `CREATE TABLE InVisione(Utente VARCHAR(20) not NULL, Account VARCHAR(40) not NULL, ProdCinema MEDIUMINT UNSIGNED not NULL, Tempo INT UNSIGNED not NULL, PRIMARY KEY (Utente, Account, ProdCinema ),
        FOREIGN KEY (Utente) REFERENCES Utente(Nome), FOREIGN KEY (account) REFERENCES Account(Mail), FOREIGN KEY (ProdCinema) REFERENCES ProdCinema(Id))`,
    `CREATE TABLE DaVedere(Utente VARCHAR(20) not NULL, Account VARCHAR(40) not NULL, ProdCinema MEDIUMINT UNSIGNED not NULL, PRIMARY KEY (Utente, Account, ProdCinema ),
        FOREIGN KEY (Utente) REFERENCES Utente(Nome), FOREIGN KEY (Account) REFERENCES Account(Mail),FOREIGN KEY (ProdCinema ) REFERENCES ProdCinema(Id))`
]

//middleware
app.use(express.json());
// app.use(cors({ credentials: true, origin: 'http://localhost:4000' }));

app.post("/createDB/:dbname", async (req, res) => {
  const { dbname } = req.params;
  try {
    res.json();
  } catch (e) {
    res.status(500).json(e);
  }
});

class connection {
    #_conn

    constructor() {
        this.#_conn = null
    }
    async getConnection(){
        if(this.#_conn === null && this.#_conn === undefined){
            this.#_conn = await createConnection({
                host: 'sql11.freesqldatabase.com',
                database: 'sql11675959',
                user: 'sql11675959',
                password:'ancora non me la da zio pera'
            })
            await this.#_conn.connect()
        }
        return this.#_conn;
    }
}

const connect = new connection();

app.get('/table/:tablename', async (req, res) => {
    const { tablename } = req.params;
    try {
        let conn = await connect.getConnection();
        let query = `SELECT * FROM ${tablename} WHERE 1`;

        console.log(conn);

        const [results] = await conn.query(query);

        return results;
    } catch (e) {
        console.log(e)
        res.status(400).json(e);
    }
});

app.post('/createTables', async (req,res) => {
    try{
        let conn = await connect.getConnection();
        await Promise.all(CREATE_QUERIES.map(query => {return async () => await conn.query(query)}));

    }catch(err){
        res.status(400).json(e);
    }
})

app.get("/table/:tablename", async (req, res) => {
  const { tablename } = req.params;
  try {
    res.json();
  } catch (e) {
    res.status(500).json(e);
  }
});

app.post("/op/:opNum", async (req, res) => {
  let connection = await connect.getConnection;
  const { opNum } = req.params;

  try {
    switch (opNum) {
      case "1":
        const {
          id_val,
          rating_val,
          durata_val,
          budget_val,
          anno_val,
          titolo_val,
          cara_val,
          scadenza_val,
          tipo_val,
          stagione_val,
          serie_val,
        } = req.body;
        const query1_1 = await connection.query(
          `INSERT INTO ProdCinema(Id, Rating, Durata, Budget, Anno, Titolo, CARA, Scadenza, Tipo, Stagione, SerieTV) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `,
          [
            id_val,
            rating_val,
            durata_val,
            budget_val,
            anno_val,
            titolo_val,
            cara_val,
            scadenza_val,
            tipo_val,
            stagione_val,
            serie_val,
          ]
        );
        res.send(query1_1);

        const { idEpisodio_val, codicePersona_val } = req.body;
        const query1_2 =
        await connection.query(
            `INSERT INTO Creazione(IdEpisodio, CodicePersona) 
            VALUES (?, ?) `, [idEpisodio_val, codicePersona_val]);
        res.send(query1_2);

        const {idEpisodio_val};
        const query1_3 =
            `INSERT INTO Parte(IdEpisodio) 
            VALUES (?) `;
        await connection.query(query3, valuesForQuery3);
        res.send(query1_3);

        const valuesForQuery4 = ["idEpisodio_val", "categoria_val"];
        const query1_4 =
            `INSERT INTO Categoria(IdEpisodio, Categoria) 
            VALUES (?, ?) `;
        await connection.query(query4, valuesForQuery4);
        res.send(query1_4);

        const valuesForQuery5 = ["idEpisodio_val", "location_val"];
        const query1_5 =
            `INSERT INTO Ambientazione(IdEpisodio, Location) 
            VALUES (?, ?) `;
        await connection.query(query5, valuesForQuery5);
        res.send(query1_5);
        break;

      case "2":
        const query2 = await connection.query(
            `DELETE 
            FROM ProdCinema 
            WHERE Scadenza < CAST(GETDATE() AS Date) `);
        res.send(query2);
        break;

      case "3":
        const query3 = await connection.query(
            `UPDATE ProdCinema() 
            SET ... 
            WHERE Id = ... `);
        res.send(query3);
        break;

      case "4":
        const query4 = await connection.query(
            `UPDATE ProdCinema 
            SET Rating = t.meanR 
            FROM (SELECT ProdCinema, AVG(ProdCinema) as meanR 
            FROM Recensione 
            GROUP BY ProdCinema) t 
            WHERE Id = t.ProdCinema `);
        res.send(query4);
        break;

      case "5":
        const query5 = await connection.query(
            `INSERT INTO Account(Mail, Psw, Abbonamento, DataCreaz) 
            VALUES (...) `);
        res.send(query5);
        break;

      case "6":
        const query6 = await connection.query(
            `UPDATE Account 
            SET Abbonamento = ‘...’ 
            WHERE Mail = ‘...’ `);
        res.send(query6);
        break;

      case "7":
        const query7 = await connection.query(
            `DELETE 
            FROM Account 
            WHERE Mail = ‘...’ `
        );
        res.send(query7);
        break;

      case "8":
        const query8 = await connection.query(
            `INSERT INTO Utente(Nome, Account, Età, Posizione, Ling, Disp, TempoUtilizzo) 
            VALUES (...) `
        );
        res.send(query8);
        break;

      case "9":
        const query9 = await connection.query(
            `SELECT P.Id, P.Titolo, P.Tipo 
            FROM ProdCinema as P JOIN Visione as V on P.Id = V.ProdCinema 
            WHERE V.Data > DATE_ADD((CAST(GETDATE() AS Date) INTERVAL -1 MONTH) 
            GROUP BY V.ProdCinema 
            ORDER BY COUNT(V.ProdCinema) DESC 
            LIMIT 10  `);
        res.send(query9);

        break;

      case "10":
        const query10 = await connection.query(
            `SELECT P.Id, P.Titolo, P.Tipo 
            FROM Visioni as V JOIN ProdCinema as P ON V.ProdCin = P.Id JOIN 
                (SELECT P.Genere as FavGen 
                FROM Visione as V JOIN ProdCinema as P ON V.ProdCin = P.Id 
                WHERE	V.Utente = ... AND V.Account = ... 
                GROUP BY P.Genere 
                ORDER BY COUNT(*) DESC 
                LIMIT 1) t 
            ON P.Genere = t.FavGen LIMIT 5 `);
        res.send(query10);
        break;

      case "11":
        const query11 = await connection.query(
            `SELECT P.Id, P.Titolo, P.Tipo 
            FROM ProdCinema 
            WHERE … `);
        res.send(query11);
        break;

      case "12":
        const query12 = await connection.query(
            `INSERT INTO Visionato(Utente, Account, ProdCinema, Watchtime) 
            VALUES (...) `);
        res.send(query12);
        break;

      case "13":
        const query13 = await connection.query(
            `INSERT INTO Recensione(Utente, Account, ProdCinema, Gradimento) 
            VALUES (...) `);
        res.send(query13);
        break;

      case "14":
        const query14 = await connection.query(
            `SELECT Rating, Durata, Budget, Anno, CARA, Stagione, SerieTV FROM ProdCinema 
            WHERE ... `);
        res.send(query14);
        break;

      default:
        res.status(400).json({ error: "Operazione non supportata" });
        return;
    }

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Errore durante l'esecuzione della query" });
  }
});


app.listen(PORT, () => {
    console.log(`app sulla porta ${PORT}`);
})