const { Card, Deck, MultipleChoice } = require("../models");

exports.index = async (req, res, next) => {
  try {
    const [card_count, deck_count, mcq_count] = await Promise.all([
      Card.count(),
      Deck.count(),
      MultipleChoice.count(),
    ]);

    res.render("index", {
      title: "Cram.io",
      card_count,
      deck_count,
      mcq_count,
    });
  } catch (err) {
    next(err);
  }
};
