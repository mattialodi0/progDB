const express = require('express');
const app = express();
const cors = require('cors');

//middleware
app.use(express.json());
// app.use(cors({ credentials: true, origin: 'http://localhost:4000' }));


app.post('/createDB/:dbname', async (req, res) => {
    const { dbname } = req.params;
    try {
        
        res.json();
    } catch (e) {
        res.status(500).json(e);
    }
});

app.get('/table/:tablename', async (req, res) => {
    const { tablename } = req.params;
    try {
        
        res.json();
    } catch (e) {
        res.status(500).json(e);
    }
});

app.post('/op/:opNum', async (req, res) => {
    const { opNum } = req.params;
    try {
        
        res.json();
    } catch (e) {
        res.status(500).json(e);
    }
});











