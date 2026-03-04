const { sequelize } = require("../db");

const Deck = require("./deck");
const Card = require("./card");
const MultipleChoice = require("./multipleChoice");

// --- ASSOCIATIONS ---

// Deck <-> Card
Deck.belongsToMany(Card, { through: "DeckCards" });
Card.belongsToMany(Deck, { through: "DeckCards" });

// Deck <-> MultipleChoice
Deck.belongsToMany(MultipleChoice, { through: "DeckMultipleChoices" });
MultipleChoice.belongsToMany(Deck, { through: "DeckMultipleChoices" });

// Remove MDN code once you feel confident
const Author = require("./author");
const Book = require("./book");
const Genre = require("./genre");
const BookInstance = require("./bookinstance");

// --- ASSOCIATIONS ---

// Book -> Author (many books belong to one author)
Book.belongsTo(Author, { foreignKey: { allowNull: false } });
Author.hasMany(Book);

// Book -> Genre (many-to-many)
Book.belongsToMany(Genre, { through: "BookGenres" });
Genre.belongsToMany(Book, { through: "BookGenres" });

// BookInstance -> Book (many instances belong to one book)
BookInstance.belongsTo(Book, { foreignKey: { allowNull: false } });
Book.hasMany(BookInstance);

module.exports = {
  sequelize,
  Author,
  Book,
  Genre,
  BookInstance,
  Deck,
  Card,
  MultipleChoice,
};
