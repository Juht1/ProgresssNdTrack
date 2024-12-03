import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express'; // Use import instead of require
import swaggerDocument from './docs/swagger.json' assert { type: 'json' }; // Use import with assertion
import { PrismaClient } from '@prisma/client'
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.mailersend.net",
  port: 587,
  auth: {
    user: "MS_GQ8EIP@trial-pq3enl6ojn8l2vwr.mlsender.net",
    pass: "LoJpbBePxR68sGSM"
  }
})

const prisma = new PrismaClient()
const app = express();
const PORT = process.env.PORT || 5000;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Corrected path for Swagger UI

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
      const {title, start} = await prisma.event.findFirst({where: {
        id: reminder.eventId
      }});

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
  
      await prisma.reminder.delete({
        where: {
          id: reminder.id
        }
      });

      transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
          console.error(err)
        }
        else {
          console.log("email sent: ", mailOptions)
        }
      });
    }
  }, 30000);
}

// Get all events
app.get('/events', async (req, res) => {
  res.json(await prisma.event.findMany());
});

// Post an event
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

// Delete an event by title
app.delete('/events/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.event.delete({
    where: {id: parseInt(id)},
})
  res.status(204).send();
});

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })