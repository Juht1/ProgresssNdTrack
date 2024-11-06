// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create an instance of the Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/calendar', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// Define Event Schema
const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    start: { type: Date, required: true },
    color: { type: String }
});

const Event = mongoose.model('Event', eventSchema);

// API Routes
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/events', async (req, res) => {
    const newEvent = new Event(req.body);
    try {
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/events/:id', async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEvent) return res.status(404).send('Event not found');
        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/events/:id', async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).send('Event not found');
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});