import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express'; // Use import instead of require
import swaggerDocument from './docs/swagger.json' assert { type: 'json' }; // Use import with assertion

const app = express();
const PORT = process.env.PORT || 5000;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Corrected path for Swagger UI

app.use(cors());
app.use(bodyParser.json());

let events = []; 

// Get all events
app.get('/events', (req, res) => {
  res.json(events);
});

// Post an event
app.post('/events', (req, res) => {
  const { title, start, color } = req.body;
  const existingEventIndex = events.findIndex(event => event.title === title);

  if (existingEventIndex > -1) {
    // Update existing event
    events[existingEventIndex] = { title, start, color };
  } else {
    // Add new event
    events.push({ title, start, color });
  }

  res.status(201).json(events);
});

// Delete an event by title
app.delete('/events/:title', (req, res) => {
  const { title } = req.params;
  events = events.filter(event => event.title !== title);
  res.status(204).send();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});