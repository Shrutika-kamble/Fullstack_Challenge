const { Sequelize } = require("sequelize");
require("dotenv").config(); // Load .env variables

// Test if env variables are loaded
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false // optional: turn off SQL logs
  }
);

module.exports = sequelize;
