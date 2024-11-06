import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(bodyParser.json()); 

let events = []; // 

// Get 
app.get('/events', (req, res) => {
  res.json(events);
});

// Post
app.post('/events', (req, res) => {
  const { title, start, color } = req.body;
  const existingEventIndex = events.findIndex(event => event.title === title);

  if (existingEventIndex > -1) {
    // Update 
    events[existingEventIndex] = { title, start, color };
  } else {
    // Add 
    events.push({ title, start, color });
  }

  res.status(201).json(events);
});

// Delete 
app.delete('/events/:title', (req, res) => {
  const { title } = req.params;
  events = events.filter(event => event.title !== title);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
