const sequelize = require("./db"); // your sequelize config file

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

testConnection();
