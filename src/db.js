const { Sequelize } = require("sequelize");

// Create a SQLite database stored in a file
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./library.db", // TODO this is the database file. Creates itself automatically.
  logging: false, // Disable logging for cleaner output. Set to true to see SQL queries.
});

async function connectSequelize() {
  try {
    await sequelize.authenticate();
    console.log("Connected to SQLite database successfully.");

    await sequelize.sync(); // Sync all defined models to the DB.
    console.log("Database synchronized.");
  } catch (err) {
    console.error("Unable to connect to SQLite:", err);
    process.exit(1);
  }
}

module.exports = { sequelize, connectSequelize };
