const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Book = sequelize.define(
  "Book",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Note: Sequelize associations are created after all models loaded,
    // so author and genre are found in `index.js`
  },
  {
    getterMethods: {
      // Virtual for book's URL
      url() {
        return `/catalog/book/${this.id}`;
      },
    },
  },
);

module.exports = Book;
