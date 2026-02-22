const Author = require("./author");
const Book = require("./book");
const Genre = require("./genre");
const BookInstance = require("./bookinstance");

// Book -> Author (many-to-one)
Book.belongsTo(Author, { foreignKey: { allowNull: false } });
Author.hasMany(Book);

// Book -> Genre (many-to-many)
Book.belongsToMany(Genre, { through: "BookGenres" });
Genre.belongsToMany(Book, { through: "BookGenres" });

// BookInstance -> Book (many-to-one)
BookInstance.belongsTo(Book, { foreignKey: { allowNull: false } });
Book.hasMany(BookInstance);

module.exports = { Author, Book, Genre, BookInstance };
