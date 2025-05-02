module.exports = (sequelize, DataTypes) => {
    const commodity = sequelize.define('commodity', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    }, {
        tableName: 'commodities',
        timestamps: true, // Adds createdAt and updatedAt fields
    });

    return commodity;
};
