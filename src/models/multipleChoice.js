const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const MultipleChoice = sequelize.define(
  "MultipleChoice",
  {
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    options: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Array of strings for options
      allowNull: false,
    },
    correctAnswer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true, // Validate that it's a URL
      },
    },
    // Note: Deck association is added in `index.js` after all models are loaded
  },
  {
    getterMethods: {
      url() {
        return `/catalog/multiple-choice/${this.id}`;
      },
    },
  },
);

module.exports = MultipleChoice;
