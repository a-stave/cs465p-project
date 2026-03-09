const { sequelize } = require("../config/database");

const Deck = require("./Deck");
const Card = require("./Card");
const MultipleChoice = require("./MultipleChoice");

// --- ASSOCIATIONS ---

// Deck <-> Card
Deck.belongsToMany(Card, { through: "DeckCards" });
Card.belongsToMany(Deck, { through: "DeckCards" });

// Deck <-> MultipleChoice
Deck.belongsToMany(MultipleChoice, { through: "DeckMultipleChoices" });
MultipleChoice.belongsToMany(Deck, { through: "DeckMultipleChoices" });

module.exports = {
  sequelize,
  Deck,
  Card,
  MultipleChoice,
};
