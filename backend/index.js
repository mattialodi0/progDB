const express = require("express");
const app = express();
const cors = require("cors");
const { createConnection } = require("mysql2");
const cred = require("./credentials.js").DBcredentials;

const PORT = 8001;
const SERIETV = "serie_tv";
const FILM = "film";
const CARA = "PG";
const TABLES_NAME = [
  "DaVedere",
  "InVisione",
  "Visione",
  "Recensione",
  "Parte",
  "Creazione",
  "Categoria",
  "Ambientazione",
  "Utente",
  "Account",
  "Personale",
  "ProdCinema",
  "SerieTV",
];
const CREATE_QUERIES = [
  `CREATE TABLE IF NOT EXISTS SerieTV(Id MEDIUMINT UNSIGNED not NULL AUTO_INCREMENT,Titolo VARCHAR(30) not NULL,NStagioni SMALLINT not NULL,PRIMARY KEY (Id))`,
  `CREATE TABLE IF NOT EXISTS ProdCinema(Id MEDIUMINT UNSIGNED not NULL AUTO_INCREMENT, Rating SMALLINT DEFAULT 0, Durata MEDIUMINT not NULL, 
        Budget INT not NULL, Anno YEAR(4), Titolo VARCHAR(30) not NULL, Cara ENUM('G','PG','PG-13','R','NC-17'), 
        Scadenza DATE, Tipo ENUM('serie_tv','film') not NULL, Stagione SMALLINT,  Serietv MEDIUMINT UNSIGNED, NumEpisodio SMALLINT, Visual INT DEFAULT 0,
        PRIMARY KEY (Id), FOREIGN KEY (Serietv) REFERENCES SerieTV(Id), CHECK(Rating >= 0 AND Rating <= 10))`,
  `CREATE TABLE IF NOT EXISTS Personale(Codice CHAR(16) not NULL, Nome VARCHAR(20) not NULL, DataNasc DATE, Nazionalità VARCHAR(30), Compito VARCHAR(20), PRIMARY KEY(Codice))`,
  `CREATE TABLE IF NOT EXISTS Account(Mail VARCHAR(40) not NULL, Password VARCHAR(100) not NULL, Abbonamento ENUM('mensile', 'semestrale', 'annuale', 'annuale PRO') not NULL,
        DataCreaz DATE not NULL, PRIMARY KEY (Mail), CHECK(Mail RLIKE '^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9._-]@[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]\\\\.[a-zA-Z]{2,63}$'))`,
  `CREATE TABLE IF NOT EXISTS Utente(Nome VARCHAR(20) not NULL, Account VARCHAR(40) not NULL, Eta SMALLINT, Posizione VARCHAR(100), Ling VARCHAR(30),Dispositivo VARCHAR(20),
        TempoUtilizzo MEDIUMINT UNSIGNED, PRIMARY KEY(Nome, Account), FOREIGN KEY (Account) REFERENCES Account(Mail))`,
  `CREATE TABLE IF NOT EXISTS Ambientazione( ProdCin MEDIUMINT UNSIGNED not NULL, Location VARCHAR(30), FOREIGN KEY (ProdCin) REFERENCES ProdCinema(Id))`,
  `CREATE TABLE IF NOT EXISTS Categoria(ProdCin MEDIUMINT UNSIGNED not NULL, Genere VARCHAR(30), FOREIGN KEY (ProdCin) REFERENCES ProdCinema(Id))`,
  `CREATE TABLE IF NOT EXISTS Creazione(ProdCin MEDIUMINT UNSIGNED not NULL, Personale CHAR(16) not NULL, FOREIGN KEY (ProdCin) REFERENCES ProdCinema(Id), FOREIGN KEY (Personale) REFERENCES Personale(Codice))`,
  `CREATE TABLE IF NOT EXISTS Parte( ProdCinema MEDIUMINT UNSIGNED not NULL, Attore CHAR(16) not NULL, Ruolo VARCHAR(20) not NULL, PRIMARY KEY (ProdCinema , Attore, Ruolo), 
        FOREIGN KEY (ProdCinema) REFERENCES ProdCinema(Id), FOREIGN KEY (Attore) REFERENCES Personale(Codice))`,
  `CREATE TABLE IF NOT EXISTS Recensione(Utente VARCHAR(20) not NULL, Account VARCHAR(40) not NULL, ProdCinema MEDIUMINT UNSIGNED not NULL, Gradimento SMALLINT not NULL,
        PRIMARY KEY (Utente, Account, ProdCinema), FOREIGN KEY (Utente) REFERENCES Utente(Nome), FOREIGN KEY (Account) REFERENCES Account(Mail), FOREIGN KEY (ProdCinema) REFERENCES ProdCinema(Id),
        CHECK(Gradimento <= 10 AND Gradimento >= 0))`,
  `CREATE TABLE IF NOT EXISTS Visione(Utente VARCHAR(20) not NULL, Account VARCHAR(40) not NULL, ProdCinema MEDIUMINT UNSIGNED not NULL, Watchtime INT UNSIGNED not NULL, Data DATE not NULL,
        PRIMARY KEY (Utente, Account, ProdCinema ), FOREIGN KEY (Utente) REFERENCES Utente(Nome), FOREIGN KEY (Account) REFERENCES Account(Mail), FOREIGN KEY (ProdCinema ) REFERENCES ProdCinema(Id))`,
  `CREATE TABLE IF NOT EXISTS InVisione(Utente VARCHAR(20) not NULL, Account VARCHAR(40) not NULL, ProdCinema MEDIUMINT UNSIGNED not NULL, Tempo INT UNSIGNED not NULL, PRIMARY KEY (Utente, Account, ProdCinema ),
        FOREIGN KEY (Utente) REFERENCES Utente(Nome), FOREIGN KEY (account) REFERENCES Account(Mail), FOREIGN KEY (ProdCinema) REFERENCES ProdCinema(Id))`,
  `CREATE TABLE IF NOT EXISTS DaVedere(Utente VARCHAR(20) not NULL, Account VARCHAR(40) not NULL, ProdCinema MEDIUMINT UNSIGNED not NULL, PRIMARY KEY (Utente, Account, ProdCinema ),
        FOREIGN KEY (Utente) REFERENCES Utente(Nome), FOREIGN KEY (Account) REFERENCES Account(Mail),FOREIGN KEY (ProdCinema ) REFERENCES ProdCinema(Id))`,
];

class ProdCinema {
  durata_val;
  budget_val;
  anno_val;
  titolo_val;
  cara_val;
  scadenza_val;
  tipo_val;
  stagione_val;
  serie_val;
  num_episodio_val;

  constructor(
    durata,
    budget,
    anno,
    titolo,
    cara,
    scadenza,
    tipo,
    stagione,
    serie,
    num_episodio
  ) {
    this.id = null;
    this.durata_val = durata;
    this.budget_val = budget;
    this.anno_val = anno;
    this.titolo_val = titolo;
    this.cara_val = cara;
    this.scadenza_val = scadenza;
    this.tipo_val = tipo;
    this.stagione_val = stagione;
    this.serie_val = serie;
    this.num_episodio_val = num_episodio;
  }

  setSerieTVid(id) {
    this.serie_val = id;
  }

  getTitle() {
    return this.titolo_val;
  }

  getProdArr() {
    return [
      this.durata_val,
      this.budget_val,
      this.anno_val,
      this.titolo_val,
      this.cara_val,
      this.scadenza_val,
      this.tipo_val,
      this.stagione_val,
      this.serie_val,
      this.num_episodio_val,
    ];
  }
}

const prodCin_test = [
  new ProdCinema(
    10140,
    165000000,
    2013,
    "Interstellar",
    CARA,
    null,
    FILM,
    null,
    null,
    null
  ),
  new ProdCinema(1320, 2000000, 2005, "Pilot", CARA, null, SERIETV, 1, null, 1),
  new ProdCinema(
    1320,
    2000000,
    2005,
    "Purple Giraffe",
    CARA,
    null,
    SERIETV,
    1,
    null,
    2
  ),
  new ProdCinema(
    1320,
    2000000,
    2005,
    "Sweet Taste of Liberty",
    CARA,
    null,
    SERIETV,
    1,
    null,
    3
  ),
];

const registi_query_1 = [
  "regista1",
  "regista2",
  "regista3",
  "regista4",
  "regista5",
];

const attori_query_1 = ["attore1", "attore2", "attore3", "attore4", "attore5"];

class Account {
  mail;
  password;
  abbonamento;
  dataCreaz;
  constructor(mail, password, abbonamento, dataCreaz) {
    this.mail = mail;
    this.password = password;
    this.abbonamento = abbonamento;
    this.dataCreaz = dataCreaz;
  }
}

const account_test = [
  new Account("famiglia@fam.com", "12345678", "mensile", "2024-01-07"),
  new Account("stevesting@random.com", "ciaociao", "annuale", "2022-10-01"),
  new Account("giuse@gg.com", "123stella", "annuale", "2020-08-23"),
];

class User {
  nome;
  account;
  età;
  posizione;
  lingua;
  dispositivo;
  tempoUtilizzo;

  constructor(
    nome,
    account,
    età,
    posizione,
    lingua,
    dispositivo,
    tempoUtilizzo
  ) {
    this.nome = nome;
    this.account = account;
    this.età = età;
    this.posizione = posizione;
    this.lingua = lingua;
    this.dispositivo = dispositivo;
    this.tempoUtilizzo = tempoUtilizzo;
  }
}

const userTest = [
  new User(
    "Marco",
    "famiglia@fam.com",
    28,
    "Roma",
    "italiano",
    "Laptop Dell XPS 13"
  ),
  new User(
    "Federica",
    "famiglia@fam.com",
    25,
    "Roma",
    "italiano",
    "Laptop Dell XPS 13"
  ),
  new User(
    "Giuseppe",
    "giuse@gg.com",
    44,
    "Bologna",
    "italiano",
    "Lenovo ThinkPad X1 Carbon"
  ),
  new User(
    "Steve",
    "stevesting@random.com",
    23,
    "NewYork",
    "americano",
    "MacBook Air"
  ),
];

//middleware
app.use(express.json());

// app.post("/createDB/:dbname", async (req, res) => {
//   const { dbname } = req.params;
//   try {
//     res.json();
//   } catch (e) {
//     res.status(500).json(e);
//   }
// });

class connection {
  #_conn;

  constructor() {
    this.#_conn = null;
  }
  async getConnection() {
    if (this.#_conn === null || this.#_conn === undefined) {
      this.#_conn = await createConnection(cred);
      await this.#_conn.connect();
    }
    return this.#_conn;
  }
}

const connect = new connection();

app.get("/table/:tablename", async (req, res) => {
  const { tablename } = req.params;
  try {
    let conn = await connect.getConnection();
    let query = `SELECT * FROM ${tablename} WHERE 1`;

    const [results] = await conn.query(query);

    return results;
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post("/createTables", async (req, res) => {
  try {
    // let conn = await connect.getConnection();

    // // console.log("inserimento schemi ...");
    // for (let query of CREATE_QUERIES) {
    //   let result = await conn.promise().query(query);
    //   // console.log(result[0].serverStatus === 2 ? "inserito con successo" : "errore");
    // }

    res.json({ out: "Schemi inseriti" });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.post("/deleteTables", async (req, res) => {
  try {
    let conn = await connect.getConnection();

    console.log("pulizia db ...");
    for (let table_name of TABLES_NAME) {
      await conn.promise().query(`DROP TABLE *`);
    }

    res.json({ out: "Schemi rimossi" });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.get("/table/:tablename", async (req, res) => {
  const { tablename } = req.params;
  try {
    res.json();
  } catch (e) {
    res.status(500).json(e);
  }
});

app.post("/op/:opNum", async (req, res) => {
  let connection = await connect.getConnection();
  const { opNum } = req.params;

  try {
    const req_num = req.body.product_number;

    switch (opNum) {
      case "1":
        //inserimento prodotto

        const [query1_1] = await connection.promise().query(
          `INSERT INTO ProdCinema(Id, Rating, Durata, Budget, Anno, Titolo, CARA, Scadenza, Tipo, Stagione, SerieTV) 
          VALUES (NULL, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?) `,
          prodCin_test[req_num].getProdArr()
        );

        let prod_id = query1_1.insertId;

        // inserimento personale

        await connection.promise().query(
          `INSERT INTO Personale(Codice, Nome, DataNasc, Nazionalità, Compito)
                    VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`,
          [
            registi_query_1[req_num],
            "Pippo",
            "1978-10-08",
            "francese",
            "Regista",
            attori_query_1[req_num],
            "Francesco",
            "1988-06-18",
            "americano",
            "Attore",
          ]
        );

        //inserimento nella relazione
        await connection.promise().query(
          `INSERT INTO Creazione(ProdCin, Personale) 
            VALUES (?, ?), (?,?) `,
          [prod_id, registi_query_1[req_num], prod_id, attori_query_1[req_num]]
        );

        await connection.promise().query(
          `INSERT INTO Parte(ProdCinema, Attore, Ruolo) 
            VALUES (?, ?, ?) `,
          [prod_id, attori_query_1[req_num], "Cane"]
        );

        await connection.promise().query(
          `INSERT INTO Categoria(ProdCin, Genere) 
            VALUES (?, ?) `,
          [prod_id, "Commedia"]
        );

        await connection.promise().query(
          `INSERT INTO Ambientazione(ProdCin, Location) 
            VALUES (?, ?) `,
          [prod_id, "Marte"]
        );

        break;

      case "2":
        //rimozione prodotto
        const query2 = await connection.promise().query(
          `DELETE FROM ProdCinema 
            WHERE Scadenza < CAST(GETDATE() AS Date)`
        );
        res.send(query2);
        break;

      case "3":
        let [result] = await connection
          .promise()
          .query(`SELECT Id FROM ProdCinema where Titolo = ?`, [
            prodCin_test[req_num].getTitle(),
          ]);

        let id = result[0]?.Id;

        if (!id) {
          res.send("Prodotto non ancora inserito");
          break;
        }

        await connection
          .promise()
          .query(`UPDATE ProdCinema SET Scadenza = ? WHERE Id = ? `, [
            "2025-01-01",
            id,
          ]);

        break;

      case "4":
        //aggiornamento rating
        const query4 = await connection.promise().query(
          `UPDATE ProdCinema 
            SET Rating = t.meanR 
            FROM 
              (SELECT ProdCinema, AVG(ProdCinema) as meanR 
              FROM Recensione 
              GROUP BY ProdCinema
            ) t 
            WHERE Id = t.ProdCinema `
        );
        res.send(query4);
        break;

      case "5":
        //inserimento account
        const query5 = await connection.promise().query(
          `INSERT INTO Account(Mail, Psw, Abbonamento, DataCreaz) 
            VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?) `,
          [
            "famiglia@fam.com",
            "12345678",
            "mensile",
            "2025-01-01",
            "stevesting@random.com",
            "ciaociao",
            "annuale",
            "2022-10-01",
            "giuse@gg.com",
            "123stella",
            "annuale",
            "2020-08-23",
          ]
        );
        res.send(query5);
        break;

      case "6":
        //cambio abbonamento
        const query6 = await connection.promise().query(
          `UPDATE Account 
            SET Abbonamento = 'annuale PRO'
            WHERE Mail = famiglia@fam.com  `
        );
        res.send(query6);
        break;

      case "7":
        //rimozione account
        const query7 = await connection.query(
          `DELETE FROM Account 
            WHERE Mail = giuse@gg.com `
        );
        res.send(query7);
        break;

      case "8":
        //inserimento utente
        //to check
        const query8 = await connection.promise().query(
          `INSERT INTO Utente(Nome, Account, Età, Posizione, Ling, Disp, TempoUtilizzo) 
            VALUES (?, ?, ?, ?, ?, ?, ?) `,
          [
            req.body.nome,
            req.body.account,
            req.body.età,
            req.body.posizione,
            req.body.ling,
            req.body.disp,
            req.body.tempoUtilizzo,
          ]
        );
        res.send(query8);
        break;

      case "9":
        //top 10 di sempre
        const query9 = await connection.promise().query(
          `SELECT Id, Titolo, Tipo
          FROM ProdCinema
          ORDER BY COUNT(Visual) DESC
          LIMIT 10`
        );
        res.send(query9);

        break;

      case "10":
        //top 10 mensile
        const query10 = await connection.promise().query(
          `SELECT P.Id, P.Titolo, P.Tipo 
            FROM Visione as V JOIN ProdCinema as P 
            ON V.ProdCin = P.Id JOIN (
                SELECT P.Genere as FavGen 
                FROM Visione as V JOIN ProdCinema as P ON V.ProdCin = P.Id 
                WHERE	V.Utente = ... AND V.Account = ... 
                GROUP BY P.Genere 
                ORDER BY COUNT(*) DESC 
                LIMIT 1
            ) t ON P.Genere = t.FavGen
            LIMIT 5 `
        );
        res.send(query10);
        break;

      case "11":
        //consigliati
        const query11 = await connection.promise().query(
          `SELECT P.Id, P.Titolo, P.Tipo 
              FROM Visione as V JOIN ProdCinema as P 
              ON V.ProdCin = P.Id JOIN (
                  SELECT P.Genere as FavGen 
                  FROM Visione as V JOIN ProdCinema as P ON V.ProdCin = P.Id 
                  WHERE	V.Utente = ... AND V.Account = ... 
                  GROUP BY P.Genere 
                  ORDER BY COUNT(*) DESC 
                  LIMIT 1
              ) t ON P.Genere = t.FavGen
              LIMIT 5 `
        );
        res.send(query11);
        break;

      case "12":
        //ricerca prodotto
        const query12 = await connection.promise().query(
          `SELECT Id, Titolo, Tipo 
           FROM ProdCinema
           WHERE Titolo = 'Interstellar'`,
          []
        );
        res.send(query12);
        break;

      case "13":
        //inserimento visione
        const query13 = await connection.promise().query(
          `INSERT INTO Visionato(Utente, Account, ProdCinema, Watchtime) 
            VALUES (?, ?, ?, ?) `,
          [
            req.body.utente,
            req.body.account,
            req.body.prodCinema,
            req.body.watchtime,
          ]
        );
        res.send(query13);
        break;

      case "14":
        //inserimento recensione
        const query14 = await connection.promise().query(
          `INSERT INTO Recensione(Utente, Account, ProdCinema, Gradimento) 
            VALUES (?, ?, ?, ?) `,
          [
            req.body.utente,
            req.body.account,
            req.body.prodCinema,
            req.body.gradimento,
          ]
        );
        res.send(query14);
        break;

      case "15":
        //ricerca info
        //uso l'id
        const query15 = await connection.promise().query(
          `SELECT Rating, Durata, Budget, Anno, CARA, Stagione, SerieTV 
           FROM ProdCinema 
           WHERE Titolo = 'Interstellar'`,
          [req.body.id]
        );
        res.send(query15);
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

app.get("/", (req, res) => {
  console.log(__dirname);
  res.sendFile(__dirname + "/../index.html");
});

app.listen(PORT, () => {
  console.log(`app sulla porta ${PORT}`);
});
