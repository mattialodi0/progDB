const express = require('express');
const app = express();
const cors = require('cors');

//middleware
app.use(express.json());
// app.use(cors({ credentials: true, origin: 'http://localhost:4000' }));



app.get('/table/:tablename', async (req, res) => {
    const { tablename } = req.params;
    try {
        
        res.json();
    } catch (e) {
        res.status(400).json(e);
    }
});