const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    username: process.env.DB_USER,  // Set these in .env
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'postgres',
});

const authenticateDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected!');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};


authenticateDatabase();

module.exports = sequelize;
