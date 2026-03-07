const Deck = require("../models/deck");
const Card = require("../models/card");
const MultipleChoice = require("../models/multipleChoice");
const { body, validationResult } = require("express-validator");

// Display list of all Decks.
exports.deck_list = async (req, res, next) => {
  try {
    const allDecks = await Deck.findAll({
      order: [["name", "ASC"]],
    });

    res.render("pages/deck_list", {
      title: "Deck List",
      deck_list: allDecks,
    });
  } catch (err) {
    next(err);
  }
};

// Display detail page for a specific Deck.
exports.deck_detail = async (req, res, next) => {
  try {
    const deck = await Deck.findByPk(req.params.id, {
      include: [Card, MultipleChoice],
    });

    if (!deck) {
      const err = new Error("Deck not found");
      err.status = 404;
      return next(err);
    }

    res.render("pages/deck_detail", {
      title: deck.name,
      deck,
      cards: deck.Cards,
      mcqs: deck.MultipleChoices,
    });
  } catch (err) {
    next(err);
  }
};

// Display Deck create form on GET.
exports.deck_create_get = async (req, res, next) => {
  try {
    const [allCards, allMCQs] = await Promise.all([
      Card.findAll({ order: [["id", "ASC"]] }),
      MultipleChoice.findAll({ order: [["id", "ASC"]] }),
    ]);

    res.render("pages/deck_form", {
      title: "Create Deck",
      cards: allCards,
      mcqs: allMCQs,
    });
  } catch (err) {
    next(err);
  }
};

// Handle Deck create on POST.
exports.deck_create_post = [
  body("name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Deck name must be at least 3 characters."),
  body("description")
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage("Description must be 500 characters or fewer."),
  async (req, res, next) => {
    const errors = validationResult(req);

    let cardIds = req.body.cards || [];
    if (!Array.isArray(cardIds)) cardIds = [cardIds];

    let mcqIds = req.body.mcqs || [];
    if (!Array.isArray(mcqIds)) mcqIds = [mcqIds];

    const deckData = {
      name: req.body.name,
      description: req.body.description,
    };

    if (!errors.isEmpty()) {
      const [allCards, allMCQs] = await Promise.all([
        Card.findAll({ order: [["id", "ASC"]] }),
        MultipleChoice.findAll({ order: [["id", "ASC"]] }),
      ]);

      allCards.forEach((c) => (c.checked = cardIds.includes(c.id.toString())));
      allMCQs.forEach((m) => (m.checked = mcqIds.includes(m.id.toString())));

      return res.render("pages/deck_form", {
        title: "Create Deck",
        deck: deckData,
        cards: allCards,
        mcqs: allMCQs,
        errors: errors.array(),
      });
    }

    try {
      const deck = await Deck.create(deckData);
      await deck.setCards(cardIds);
      await deck.setMultipleChoices(mcqIds);

      res.redirect(deck.url);
    } catch (err) {
      next(err);
    }
  },
];

// Display Deck delete form on GET.
exports.deck_delete_get = async (req, res, next) => {
  try {
    const deck = await Deck.findByPk(req.params.id, {
      include: [Card, MultipleChoice],
    });

    if (!deck) {
      const err = new Error("Deck not found");
      err.status = 404;
      return next(err);
    }

    res.render("pages/deck_delete", {
      title: "Delete Deck",
      deck,
      cards: deck.Cards,
      mcqs: deck.MultipleChoices,
    });
  } catch (err) {
    next(err);
  }
};

// Handle Deck delete on POST.
exports.deck_delete_post = async (req, res, next) => {
  try {
    const deck = await Deck.findByPk(req.body.deckid, {
      include: [Card, MultipleChoice],
    });

    if (!deck) {
      const err = new Error("Deck not found");
      err.status = 404;
      return next(err);
    }

    if (deck.Cards.length > 0 || deck.MultipleChoices.length > 0) {
      return res.render("pages/deck_delete", {
        title: "Delete Deck",
        deck,
        cards: deck.Cards,
        mcqs: deck.MultipleChoices,
        error:
          "Remove all cards and multiple-choice questions before deleting this deck.",
      });
    }

    await deck.destroy();
    res.redirect("/decks");
  } catch (err) {
    next(err);
  }
};

// Display Deck update form on GET.
exports.deck_update_get = async (req, res, next) => {
  try {
    const [deck, allCards, allMCQs] = await Promise.all([
      Deck.findByPk(req.params.id, { include: [Card, MultipleChoice] }),
      Card.findAll({ order: [["id", "ASC"]] }),
      MultipleChoice.findAll({ order: [["id", "ASC"]] }),
    ]);

    if (!deck) {
      const err = new Error("Deck not found");
      err.status = 404;
      return next(err);
    }

    const deckCardIds = deck.Cards.map((c) => c.id);
    const deckMCQIds = deck.MultipleChoices.map((m) => m.id);

    allCards.forEach((c) => (c.checked = deckCardIds.includes(c.id)));
    allMCQs.forEach((m) => (m.checked = deckMCQIds.includes(m.id)));

    res.render("pages/deck_form", {
      title: "Update Deck",
      deck,
      cards: allCards,
      mcqs: allMCQs,
    });
  } catch (err) {
    next(err);
  }
};

// Handle Deck update on POST.
exports.deck_update_post = [
  body("name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Deck name must be at least 3 characters."),
  body("description")
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage("Description must be 500 characters or fewer."),
  async (req, res, next) => {
    const errors = validationResult(req);
    const deckId = req.params.id;

    let cardIds = req.body.cards || [];
    if (!Array.isArray(cardIds)) cardIds = [cardIds];

    let mcqIds = req.body.mcqs || [];
    if (!Array.isArray(mcqIds)) mcqIds = [mcqIds];

    const updatedData = {
      id: deckId,
      name: req.body.name,
      description: req.body.description,
    };

    if (!errors.isEmpty()) {
      const [allCards, allMCQs] = await Promise.all([
        Card.findAll({ order: [["id", "ASC"]] }),
        MultipleChoice.findAll({ order: [["id", "ASC"]] }),
      ]);

      allCards.forEach((c) => (c.checked = cardIds.includes(c.id.toString())));
      allMCQs.forEach((m) => (m.checked = mcqIds.includes(m.id.toString())));

      return res.render("pages/deck_form", {
        title: "Update Deck",
        deck: updatedData,
        cards: allCards,
        mcqs: allMCQs,
        errors: errors.array(),
      });
    }

    try {
      const deck = await Deck.findByPk(deckId);
      await deck.update(updatedData);
      await deck.setCards(cardIds);
      await deck.setMultipleChoices(mcqIds);

      res.redirect(deck.url);
    } catch (err) {
      next(err);
    }
  },
];

exports.playDeck = async (req, res, next) => {
  try {
    const deck = await Deck.findByPk(req.params.id, {
      include: [{ model: Card }, { model: MultipleChoice }],
    });

    if (!deck) return res.status(404).send("Deck not found");

    // Normalize
    deck.cards = deck.Cards || [];
    deck.multipleChoices = deck.MultipleChoices || [];

    res.render("pages/deck_play", { title: `Play: ${deck.name}`, deck });
  } catch (err) {
    next(err);
  }
};
