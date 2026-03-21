const { Card, Deck, MultipleChoice } = require("../models");
const { body, validationResult } = require("express-validator");

// Display list of all Cards.
exports.card_list = async (req, res, next) => {
  try {
    const allCards = await Card.findAll({
      order: [["id", "ASC"]],
      include: Deck,
    });

    res.render("pages/card_list", {
      title: "Card List",
      card_list: allCards,
    });
  } catch (err) {
    next(err);
  }
};

// Display detail page for a specific Card.
exports.card_detail = (req, res) => {
  res.redirect(`/cards/${req.params.id}/update`);
};

// Display Card create form on GET.
exports.card_create_get = async (req, res, next) => {
  try {
    const allDecks = await Deck.findAll({ order: [["name", "ASC"]] });

    res.render("pages/card_form", {
      title: "Create Card",
      backUrl: "/cards",
      decks: allDecks,
    });
  } catch (err) {
    next(err);
  }
};

// Handle Card create on POST.
exports.card_create_post = [
  body("question")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Question must not be empty."),
  body("answer")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Answer must not be empty."),
  async (req, res, next) => {
    const errors = validationResult(req);

    // Normalize deck selection (MDN-style)
    let deckIds = req.body.decks || [];
    if (!Array.isArray(deckIds)) deckIds = [deckIds];

    const cardData = {
      question: req.body.question,
      answer: req.body.answer,
    };

    if (!errors.isEmpty()) {
      const allDecks = await Deck.findAll({ order: [["name", "ASC"]] });

      // Mark selected decks
      allDecks.forEach((deck) => {
        deck.checked = deckIds.includes(deck.id.toString());
      });

      return res.render("pages/card_form", {
        title: "Create Card",
        card: cardData,
        decks: allDecks,
        errors: errors.array(),
      });
    }

    try {
      const card = await Card.create(cardData);
      await card.setDecks(deckIds); // many-to-many join

      res.redirect("/cards");
    } catch (err) {
      next(err);
    }
  },
];

// Handle Card delete via API on POST.
exports.card_delete_post = async (req, res, next) => {
  try {
    const cardId = req.params.id || req.body.cardid;
    const card = await Card.findByPk(cardId);

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Remove join-table entries first
    await card.setDecks([]);

    await card.destroy();

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Display Card update form on GET.
exports.card_update_get = async (req, res, next) => {
  try {
    const [card, allDecks] = await Promise.all([
      Card.findByPk(req.params.id, { include: Deck }),
      Deck.findAll({ order: [["name", "ASC"]] }),
    ]);

    if (!card) {
      const err = new Error("Card not found");
      err.status = 404;
      return next(err);
    }

    // Mark decks already associated
    const cardDeckIds = card.Decks.map((d) => d.id);
    allDecks.forEach((deck) => {
      deck.checked = cardDeckIds.includes(deck.id);
    });

    res.render("pages/card_form", {
      title: "Update Card",
      backUrl: "/cards",
      card,
      decks: allDecks,
    });
  } catch (err) {
    next(err);
  }
};

// Handle Card update on POST.
exports.card_update_post = [
  body("question")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Question must not be empty."),
  body("answer")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Answer must not be empty."),
  async (req, res, next) => {
    const errors = validationResult(req);
    const cardId = req.params.id;

    let deckIds = req.body.decks || [];
    if (!Array.isArray(deckIds)) deckIds = [deckIds];

    const updatedData = {
      id: cardId,
      question: req.body.question,
      answer: req.body.answer,
    };

    if (!errors.isEmpty()) {
      const allDecks = await Deck.findAll({ order: [["name", "ASC"]] });

      allDecks.forEach((deck) => {
        deck.checked = deckIds.includes(deck.id.toString());
      });

      return res.render("pages/card_form", {
        title: "Update Card",
        card: updatedData,
        decks: allDecks,
        errors: errors.array(),
      });
    }

    try {
      const card = await Card.findByPk(cardId);
      await card.update(updatedData);
      await card.setDecks(deckIds);

      res.redirect("/cards");
    } catch (err) {
      next(err);
    }
  },
];
