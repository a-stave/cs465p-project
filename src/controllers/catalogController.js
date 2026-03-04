const Card = require("../models/card");
const Deck = require("../models/deck");
const MultipleChoice = require("../models/multipleChoice");

exports.index = async (req, res, next) => {
  try {
    const [card_count, deck_count, mcq_count] = await Promise.all([
      Card.count(),
      Deck.count(),
      MultipleChoice.count(),
    ]);

    res.render("index", {
      title: "Flashcard App Home",
      card_count,
      deck_count,
      mcq_count,
    });
  } catch (err) {
    next(err);
  }
};
