const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Card = sequelize.define(
  "Card",
  {
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Note: Deck association is added in `index.js` after all models are loaded
  },
  {
    getterMethods: {
      url() {
        return `/catalog/card/${this.id}`;
      },
    },
  },
);

module.exports = Card;
