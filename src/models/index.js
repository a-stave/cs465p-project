// const Author = require("./author");
// const Book = require("./book");
// const Genre = require("./genre");
// const BookInstance = require("./bookinstance");

// // Book -> Author (many-to-one)
// Book.belongsTo(Author, { foreignKey: { allowNull: false } });
// Author.hasMany(Book);

// // Book -> Genre (many-to-many)
// Book.belongsToMany(Genre, { through: "BookGenres" });
// Genre.belongsToMany(Book, { through: "BookGenres" });

// // BookInstance -> Book (many-to-one)
// BookInstance.belongsTo(Book, { foreignKey: { allowNull: false } });
// Book.hasMany(BookInstance);

// module.exports = { Author, Book, Genre, BookInstance };

const { sequelize } = require("../db");

const Author = require("./author");
const Book = require("./book");
const Genre = require("./genre");
const BookInstance = require("./bookinstance");

// --- ASSOCIATIONS ---

// Book → Author (many books belong to one author)
Book.belongsTo(Author, { foreignKey: { allowNull: false } });
Author.hasMany(Book);

// Book → Genre (many-to-many)
Book.belongsToMany(Genre, { through: "BookGenres" });
Genre.belongsToMany(Book, { through: "BookGenres" });

// BookInstance → Book (many instances belong to one book)
BookInstance.belongsTo(Book, { foreignKey: { allowNull: false } });
Book.hasMany(BookInstance);

module.exports = {
  sequelize,
  Author,
  Book,
  Genre,
  BookInstance,
};
