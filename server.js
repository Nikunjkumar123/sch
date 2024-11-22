const express = require('express');
require('dotenv').config();
const haversine = require('haversine-distance');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(bodyParser.json());


app.post('/addSchool', async (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
            [name, address, latitude, longitude]
        );
        res.status(201).json({ message: 'School added successfully', id: result.insertId });
    } catch (error) {
        console.error('Error adding school:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/listSchools', async (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    try {
        const [schools] = await db.query('SELECT * FROM schools');

        const sortedSchools = schools
            .map((school) => ({
                ...school,
                distance: haversine(
                    { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
                    { latitude: school.latitude, longitude: school.longitude }
                )
            }))
            .sort((a, b) => a.distance - b.distance);

        res.status(200).json(sortedSchools);
    } catch (error) {
        console.error('Error fetching schools:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const port = process.env.PORT;
app.listen(port, () => console.log(`Server running on port ${port}`));
