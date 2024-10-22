require('dotenv').config();
const port = process.env.PORT || 3001;
const host = 'localhost'
const express = require("express")
const app = express()
const swaggerUi = require("swagger-ui-express")

const swaggerDoc = require("./docs/swagger.json")
const { db, sync} = require("./db");

app.use(express.json())
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc))

app.get("/", (req, res) => {
    res.send(`Server running. Docs at <a href="http://${host}:${port}/docs">/docs</a>`)
})



app.get("/games", async (req, res) => {
    const games = await db.games.findAll();
    res.send(games.map(({id, name}) => { return {id, name}}))
})


app.post("/games",async (req, res) => {
    if (!req.body.name || req.body.name.trim().length === 0) {
        return res.status(400).send({error: "Missing required field 'name'"})
    }
    const newPrice = parseFloat(req.body.price);
    const newGame = {
        name: req.body.name,
        price: isNaN(newPrice) ? null : newPrice
    }
    const createdGame = await db.games.create(newGame);
    res.status(201)
        .location(`${getBaseUrl(req)}/games/${createdGame.id}`)
        .send(createdGame)
})

app.get("/games/:id", async (req, res) => {
    const game = await getGame(req, res)
    if (!game) { return }
    return res.send(game)
})

app.put("/games/:id", async (req, res) => {
    const game = await getGame(req, res)
    if (!game) { return }
    if (!req.body.name || req.body.name.trim().length === 0) {
        return res.status(400).send({error: "Missing required field 'name'"})
    }
    const newPrice = parseFloat(req.body.price);
    game.name = req.body.name
    game.price = isNaN(newPrice) ? null : newPrice
    await game.save();
    return res
        .location(`${getBaseUrl(req)}/games/${game.id}`)
        .send(game)
})

app.delete("/games/:id", async (req, res) => {
    const game = await getGame(req, res)
    if (!game) { return }
    await game.destroy();
    return res.status(204).send()
})


app.listen(port, async () => {
    if (process.env.SYNC === "true") { await sync(); }
    console.log(`API up at: http://${host}:${port}`)
})

function getBaseUrl(req) {
    return (req.connection && req.connection.encrypted ? 'https' : 'http') + `://${req.headers.host}`
}

async function getGame(req, res) {
    const idNumber = parseInt(req.params.id)
    if (isNaN(idNumber)) {
        res.status(400).send({error: `ID must be a whole number: ${req.params.id}`})
        return null
    }
    const game = await db.games.findByPk(idNumber)
    if (!game) {
        res.status(404).send({error: `Game Not Found!`})
        return null
    }
    return game
}