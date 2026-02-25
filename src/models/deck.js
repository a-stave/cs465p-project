const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Deck = sequelize.define(
  "Deck",
  {
    name: {
      type: DataTypes.STRING(100), // Max length 100
      allowNull: false,
      validate: {
        len: [3, 100], // Min and Max length validation
      },
    },
    description: {
      type: DataTypes.STRING(500), // Max length 500
      allowNull: true,
      validate: {
        len: [0, 500], // Max length validation
        validateDescription(value) {
          if (value && value.trim().length === 0) {
            throw new Error("Description cannot be empty or whitespace only");
          }
        },
      },
    },
    // Note: Cards association is added in `index.js` after all models are loaded
  },
  {
    getterMethods: {
      url() {
        return `/catalog/deck/${this.id}`;
      },
    },
  },
);

module.exports = Deck;
