const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const { createConnection } = require("mysql2");
const cred = require("./credentials.js").DBcredentials;

const PORT = 8001;

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
  `CREATE TABLE IF NOT EXISTS Ambientazione( ProdCinema MEDIUMINT UNSIGNED not NULL, Location VARCHAR(30), FOREIGN KEY (ProdCinema) REFERENCES ProdCinema(Id))`,
  `CREATE TABLE IF NOT EXISTS Categoria(ProdCinema MEDIUMINT UNSIGNED not NULL, Genere VARCHAR(30), FOREIGN KEY (ProdCinema) REFERENCES ProdCinema(Id))`,
  `CREATE TABLE IF NOT EXISTS Creazione(ProdCinema MEDIUMINT UNSIGNED not NULL, Personale CHAR(16) not NULL, FOREIGN KEY (ProdCinema) REFERENCES ProdCinema(Id), FOREIGN KEY (Personale) REFERENCES Personale(Codice))`,
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


//middleware
app.use(express.json());
app.use(cors());


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

// app.get("/table/:tablename", async (req, res) => {
//   const { tablename } = req.params;
//   try {
//     let conn = await connect.getConnection();
//     let query = `SELECT * FROM ${tablename} WHERE 1`;

//     const [results] = await conn.query(query);

//     return results;
//   } catch (e) {
//     console.log(e);
//     res.status(400).json(e);
//   }
// });

app.post("/createTables", async (req, res) => {
  try {
    let conn = await connect.getConnection();

    // console.log("inserimento schemi ...");
    for (let query of CREATE_QUERIES) {
      let result = await conn.promise().query(query);
      // console.log(result[0].serverStatus === 2 ? "inserito con successo" : "errore");
    }

    res.json({ out: "Schemi inseriti" });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.post("/deleteTables", async (req, res) => {
  try {
    let conn = await connect.getConnection();

    await conn.promise().query(`DROP TABLE IF EXISTS DaVedere, InVisione, Visione, Recensione, Parte, Creazione, Categoria, Ambientazione, Utente, Account, Personale, ProdCinema, SerieTV`);

    res.json({ out: "Schemi rimossi" });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

app.post("/clearTables", async (req, res) => {
  try {
    let conn = await connect.getConnection();

    await conn.promise().query(`DROP TABLE IF EXISTS DaVedere, InVisione, Visione, Recensione, Parte, Creazione, Categoria, Ambientazione, Utente, Account, Personale, ProdCinema, SerieTV`);
    for (let query of CREATE_QUERIES) {
      let result = await conn.promise().query(query);
    }

    res.json({ out: "Relazioni rimosse" });
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});


// errori: 4, 10
app.post("/op/:opNum", async (req, res) => {
  let connection = await connect.getConnection();
  const { opNum } = req.params;

  try {

    switch (opNum) {
      case "1":
        {
          //inserimento prodotto

          const [query1_1] = await connection.promise().query(
            `INSERT INTO ProdCinema(Id, Rating, Durata, Budget, Anno, Titolo, CARA, Scadenza, Tipo, Stagione, SerieTV, NumEpisodio ) VALUES (NULL,0, 10140,165000000,2013,"Interstellar","PG",null,"film",null,null,null)`);

          let prod_id = query1_1.insertId;

          // popoliamo il database
          await connection.promise().query(`INSERT INTO ProdCinema(Id, Rating, Durata, Budget, Anno, Titolo, CARA, Scadenza, Tipo, Stagione, SerieTV, NumEpisodio) VALUES (null, 0, 10140,165000000,2013,"Interstellar","PG",null,"film",null,null,null), (null, 0, 1320, 2000000, 2005, "Pilot", 'PG', null, 'serie_tv', 1, null, 1), (null, 0, 1320,2000000,2005,"Purple Giraffe", 'PG' ,null, 'serie_tv' ,1,null,2), (null, 0, 1320,2000000,2005,"Sweet Taste of Liberty", 'PG', null, 'serie_tv',1,null,3)`);


          // inserimento personale
          const [query1_2] = await connection.promise().query(
            `INSERT INTO Personale(Codice, Nome, DataNasc, Nazionalità, Compito) VALUES ("Regista1","Nolan","1978-10-08","francese","Regista"), ("Attore1","Francesco","1988-06-18","americano","Attore")`);

          //inserimento nella relazione
          const [query1_3] = await connection.promise().query(
            `INSERT INTO Creazione(ProdCinema, Personale) VALUES (${prod_id}, 'Regista1'), (${prod_id}, 'Attore1')`);

          const [query1_4] = await connection.promise().query(
            `INSERT INTO Parte(ProdCinema, Attore, Ruolo) VALUES (${prod_id}, 'Attore1', 'Cane') `);

          const [query1_5] = await connection.promise().query(
            `INSERT INTO Categoria(ProdCinema, Genere) VALUES (${prod_id}, 'Commedia') `);

          const [query1_6] = await connection.promise().query(
            `INSERT INTO Ambientazione(ProdCinema, Location) VALUES (${prod_id}, 'Giove')`);

          res.json({ out: { 'ProdCinema': query1_1, 'Personale': query1_2, 'Creazione': query1_3, 'Parte': query1_4, 'Categoria': query1_5, 'Ambientazione': query1_6 } });
        }
        break;

      case "2":
        {
          //rimozione prodotto
          const [query2] = await connection.promise().query(
            `DELETE FROM ProdCinema 
             WHERE Scadenza < CAST(NOW() AS Date)`
          );
          res.json({ out: query2 });
        }
        break;

      case "3":
        {
          //aggiornamento prodotto
          let [query3] = await connection.promise().query(`UPDATE ProdCinema SET Scadenza = '2025-01-01' WHERE  Titolo = 'Interstellar'`);
          res.json({ out: query3 });
        }
        break;

      case "4":
        {
          //aggiornamento rating
          const [query4] = await connection.promise().query(
            'UPDATE ProdCinema, ('+
              'SELECT ProdCinema, AVG(Gradimento) as meanR '+ 
              'FROM Recensione '+
              'GROUP BY ProdCinema '+
            ') t '+
            'SET Rating = t.meanR '+
            'WHERE Id = t.ProdCinema'
          );
          res.json({ out: query4 });
        }
        break;

      case "5":
        {
          //inserimento account
          const [query5] = await connection.promise().query(
            `INSERT INTO Account(Mail, Password, Abbonamento, DataCreaz) 
           VALUES ("famiglia@fam.com","12345678","mensile","2025-01-01"), ("stevesting@random.com","ciaociao","annuale","2022-10-01"), ("giuse@gg.com", "123stella","annuale","2020-08-23")`);
          res.json({ out: query5 });
        }
        break;

      case "6":
        {
          //cambio abbonamento
          const [query6] = await connection.promise().query(
            `UPDATE Account 
           SET Abbonamento = 'annuale PRO'
           WHERE Mail = 'famiglia@fam.com'`
          );
          res.json({ out: query6 });
        }
        break;

      case "7":
        {
          //rimozione account
          const [query7] = await connection.promise().query(`DELETE FROM Account WHERE Mail = 'giuse@gg.com'`);
          res.json({ out: query7 });
        }
        break;

      case "8":
        {
          //inserimento utente
          const [query8] = await connection.promise().query(
            'INSERT INTO Utente(Nome, Account, Eta, Posizione, Ling, Dispositivo, TempoUtilizzo) ' +
            'VALUES ("Marco", "famiglia@fam.com", 28, "Roma", "italiano", "Laptop Dell XPS", 0), ' +
            '("Federica", "famiglia@fam.com", 25, "Roma", "italiano", "Laptop Dell XPS", 0), ' +
            '("Giuseppe", "giuse@gg.com", 44, "Bologna", "italiano", "Lenovo ThinkPad X1", 0), ' +
            '("Steve", "stevesting@random.com", 23, "NewYork", "americano", "MacBook Air", 0)'
          );
          res.json({ out: query8 });
        }
        break;

      case "9":
        {
          //top 10 di sempre
          const [query9] = await connection.promise().query(
            `SELECT Id, Titolo, Tipo
          FROM ProdCinema
          ORDER BY COUNT(Visual) DESC
          LIMIT 10`
          );
          res.json({ out: query9 });
        }
        break;

      case "10":
        {
          //top 10 mensile
          const query10 = await connection.promise().query(
            'SELECT P.Id, P.Titolo, P.Tipo ' +
            'FROM ProdCinema as P JOIN Visione as V on  ' +
            'P.Id = V.ProdCinema ' +
            'WHERE V.Data > DATE_ADD((CAST(NOW() AS Date) INTERVAL -1 MONTH) ' +
            'GROUP BY V.ProdCinema ' +
            'ORDER BY COUNT(V.ProdCinema) DESC ' +
            'LIMIT 10'
          );
          res.json({ out: query10 });
        }
        break;

      case "11":
        {
          //consigliati
          let [query11] = await connection.promise().query(`SELECT P.Id, P.Titolo, P.Tipo FROM Visione as V JOIN ProdCinema as P ON V.ProdCinema = P.Id JOIN Categoria as C ON P.Id = C.ProdCinema JOIN (SELECT C.genere as FavGen FROM Visione as V JOIN Categoria as C ON V.ProdCinema = C.ProdCinema WHERE V.Utente = 'Federica' AND V.Account = 'famiglia@fam.com' GROUP BY C.Genere ORDER BY COUNT(*) DESC LIMIT 1) t ON C.Genere = t.FavGen LIMIT 5`);
          res.json({ out: query11 });
        }
        break;

      case "12":
        {
          //ricerca prodotto
          const [query12] = await connection.promise().query(`SELECT Id, Titolo, Tipo FROM ProdCinema WHERE Titolo = 'Interstellar'`);
          res.json({ out: query12 });
        }
        break;

      case "13":
        {
          const [rees] = await connection.promise().query(`SELECT Id FROM ProdCinema where Titolo = 'Interstellar'`)
          let id_prod = rees[0]?.Id;

          const [query13] = await connection.promise().query(`INSERT INTO Visione(Utente, Account, ProdCinema, Watchtime, Data) VALUES ('Federica', 'famiglia@fam.com', ${id_prod}, 10100, '2024-01-10') `);
          res.json({ out: query13 });
        }
        break;

      case "14":
        {
          //inserimento recensione
          const [rees] = await connection.promise().query(`SELECT Id FROM ProdCinema where Titolo = 'Interstellar'`)
          let id_prod = rees[0]?.Id;
          const [query14] = await connection.promise().query(`INSERT INTO Recensione(Utente, Account, ProdCinema, Gradimento) VALUES ('Federica', 'famiglia@fam.com', ${id_prod}, 9)`);
          res.json({ out: query14 });
        }
        break;

      case "15":
        {
          //ricerca info
          const [query15] = await connection.promise().query(
            `SELECT Rating, Durata, Budget, Anno, CARA, Stagione, SerieTV, Visual 
          FROM ProdCinema 
          WHERE Titolo = 'Interstellar'`,
          );
          res.json({ out: query15 });
        }
        break;

      default:
        res.status(400).json({ error: "Operazione non supportata" });
        return;
    }

    // res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Errore durante l'esecuzione della query" });
  }
});

app.get("/", (req, res) => {
  console.log(__dirname);
  res.sendFile(path.join(__dirname, "/../index.html"));
});

app.listen(PORT, () => {
  console.log(`app sulla porta ${PORT}`);
});
