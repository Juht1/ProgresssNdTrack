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

  const event = await prisma.event.create({
    data: {
      title: 'TitleTest',
      start: new Date(),
      color: '#ffffff'
    },
  })

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
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

  if (existingEvent) {
    // Update existing event
    await prisma.event.update({
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
    await prisma.event.create({
      data: {
        title: title,
        start: start,
        color: color
      }
    })
  }

  for (const emailRecipient of emailRecipients) {
    let mailOptions = {
      from: 'MS_GQ8EIP@trial-pq3enl6ojn8l2vwr.mlsender.net',
      to: emailRecipient,
      subject: title,
      text: `reminder for the "${title}" event at ${start}`
    };

    transporter.sendMail(mailOptions, function(err, info) {
      if (err) {
        console.error(err)
      }
      else {
        console.log("email sent: ", mailOptions)
      }
    })

  }

  res.status(201).json(await prisma.event.findMany());
});

// Delete an event by title
app.delete('/events/:title', async (req, res) => {
  const { title } = req.params;
  await prisma.event.delete({
    where: {title: title},
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