const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mariadb',
    logging: console.log, // Default, displays the first parameter of the log function call
    //logging: (...msg) => console.log(msg), // Displays all log function call parameters
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

const db = {}
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.games = require("./models/game")(sequelize, DataTypes);

const sync = (async () => {
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
});

module.exports = {db, sync};
