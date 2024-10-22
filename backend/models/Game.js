module.exports = (sequelize, DataTypes) => {
    const Game = sequelize.define(
        'Game',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            // Model attributes are defined here
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                // allowNull defaults to true
            },
        },
        {
            // Other model options go here
        },
    );

    // `sequelize.define` also returns the model
    console.log(Game === sequelize.models.Game); // true
    return Game;
}
