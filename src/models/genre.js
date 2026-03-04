const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Genre = sequelize.define(
  "Genre",
  {
    name: {
      type: DataTypes.STRING(100), // Max length
      allowNull: false,
      validate: {
        len: [3, 100], // Min and Max length validation
      },
    },
  },
  {
    getterMethods: {
      url() {
        return `/catalog/genre/${this.id}`;
      },
    },
  },
);

module.exports = Genre;
