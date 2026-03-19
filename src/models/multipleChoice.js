const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const MultipleChoice = sequelize.define(
  "MultipleChoice",
  {
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error("Options must be an array");
          }
        },
      },
    },
    correctAnswer: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isInOptions(value) {
          if (!this.options.includes(value)) {
            throw new Error("correctAnswer must be one of the options");
          }
        },
      },
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
        return `/multiple-choice/${this.id}`;
      },
    },
  },
);

module.exports = MultipleChoice;
