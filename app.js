const path = require('path');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// Load .env file for local development
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());

// MongoDB Connection - credentials injected into the full SRV URI
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_URI      = process.env.MONGO_URI;  // e.g. supercluster.d83jj.mongodb.net/superData

mongoose.connect(
    `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_URI}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
    }
)
.then(() => {
    console.log("MongoDB Connection Successful");
})
.catch((err) => {
    console.error("MongoDB Connection Error:", err);
});

// Schema
const Schema = mongoose.Schema;

const dataSchema = new Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});

// Model
const planetModel = mongoose.model('planets', dataSchema);

// Planet API
app.post('/planet', async function (req, res) {
    try {
        const planetData = await planetModel.findOne({ id: req.body.id });
        res.send(planetData);
    } catch (err) {
        console.log("Ooops, We only have 9 planets and a sun. Select a number from 0 - 9");
        console.error(err);
        res.status(500).send({ error: "Error in Planet Data" });
    }
});

// Home Route
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});

// OS Details Route
app.get('/os', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        os: OS.hostname(),
        env: process.env.NODE_ENV
    });
});

// Liveness Route
app.get('/live', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({ status: "live" });
});

// Readiness Route
app.get('/ready', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({ status: "ready" });
});

// Server Start
app.listen(3000, () => {
    console.log("Server successfully running on port - 3000");
});

module.exports = app;