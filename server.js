const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(bodyParser.json());


app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.query(query, [name, address, latitude, longitude], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'School added successfully.', schoolId: result.insertId });
    });
});
app.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    const query = 'SELECT * FROM schools';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        const userLat = parseFloat(latitude);
        const userLng = parseFloat(longitude);

        const sortedSchools = results.map((school) => {
            const distance = Math.sqrt(
                Math.pow(school.latitude - userLat, 2) + Math.pow(school.longitude - userLng, 2)
            );
            return { ...school, distance };
        }).sort((a, b) => a.distance - b.distance);

        res.json(sortedSchools);
    });
});

const port = process.env.PORT;
app.listen(port, () => console.log(`Server running on port ${port}`));
