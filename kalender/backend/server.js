import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import { PrismaClient } from '@prisma/client'
import nodemailer from "nodemailer";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const swaggerDocument = require('./docs/swagger.json');

const transporter = nodemailer.createTransport({
  host: "smtp.mailersend.net",
  port: 587,
  auth: {
    user: "MS_GQ8EIP@trial-pq3enl6ojn8l2vwr.mlsender.net",
    pass: "LoJpbBePxR68sGSM"
  }
});

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Swagger UI route
app.use(cors());
app.use(bodyParser.json());

async function main() {
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  setInterval(async () => {
    console.log("Sending emails");
    for (const reminder of (await prisma.reminder.findMany())) {
      const { title, start } = await prisma.event.findFirst({ where: { id: reminder.eventId } });

      const reminderDate = new Date(start);
      reminderDate.setMinutes(reminderDate.getMinutes() - 1);
      if (new Date() < reminderDate) {
        continue;
      }

      let mailOptions = {
        from: 'MS_GQ8EIP@trial-pq3enl6ojn8l2vwr.mlsender.net',
        to: reminder.recipient,
        subject: title,
        html: ` 
          <h1>Reminder for the "${title}" event at ${start}</h1>
          <img src='https://www.purina.co.uk/sites/default/files/2020-12/Understanding%20Your%20Cat%27s%20Body%20LanguageTEASER.jpg'>
        `
      };

      await prisma.reminder.delete({ where: { id: reminder.id } });

      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.error(err);
        } else {
          console.log("email sent: ", mailOptions);
        }
      });
    }
  }, 60000);
}

// Get all events
app.get('/events', async (req, res) => {
  res.json(await prisma.event.findMany());
});

// Get event by ID
app.get('/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Post an event (Create or Update)
app.post('/events', async (req, res) => {
  req.body.start = new Date(req.body.start).toISOString();
  const { title, start, color, emailRecipients } = req.body;
  const existingEvent = await prisma.event.findFirst({
    where: {
      title: title
    }
  });

  let createdEvent;
  if (existingEvent) {
    // Update existing event
    createdEvent = await prisma.event.update({
      where: {
        id: existingEvent.id
      },
      data: {
        title: title,
        start: start,
        color: color
      }
    });
  } else {
    createdEvent = await prisma.event.create({
      data: {
        title: title,
        start: start,
        color: color
      }
    })
  }

  for (const emailRecipient of emailRecipients) {
    await prisma.reminder.create({
      data: {
        recipient: emailRecipient,
        eventId: createdEvent.id
      }
    })
  }

  res.status(201).json(await prisma.event.findMany());
});

// Update an event by ID (PUT)
app.put('/events/:id', async (req, res) => {
  const { id } = req.params;
  const { title, start, color } = req.body;

  try {
    // Find the event to be updated
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        title: title || event.title,
        start: start ? new Date(start).toISOString() : event.start,
        color: color || event.color,
      }
    });

    res.json(updatedEvent);  // Return the updated event
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete an event by ID (DELETE)
app.delete('/events/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // First, delete any associated reminders
    await prisma.reminder.deleteMany({
      where: { eventId: parseInt(id) },
    });

    // Delete the event
    await prisma.event.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send(); // No content response after successful deletion
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a reminder (POST)
app.post('/reminders', async (req, res) => {
  const { recipient, eventId } = req.body;

  try {
    // Ensure eventId exists before creating reminder
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Create the reminder without allowing the user to specify `id`
    const reminder = await prisma.reminder.create({
      data: {
        recipient,
        eventId
      }
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Get all reminders
app.get('/reminders', async (req, res) => {
  res.status(200).json(await prisma.reminder.findMany());
});

// Get a single reminder by ID
app.get('/reminders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: parseInt(id) }
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.status(200).json(reminder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a reminder by ID (DELETE)
app.delete('/reminders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the reminder exists before attempting to delete
    const reminder = await prisma.reminder.findUnique({
      where: { id: parseInt(id) }
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Delete the reminder if it exists
    await prisma.reminder.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send(); // No content response after successful deletion
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Delete a reminder by ID (DELETE)
app.delete('/reminders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.reminder.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send(); // No content response after successful deletion
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
