const { Card, Deck, MultipleChoice } = require("../models");
const { body, validationResult } = require("express-validator");

// List all MCQs
exports.mcq_list = async (req, res, next) => {
  try {
    const allMCQs = await MultipleChoice.findAll({
      order: [["id", "ASC"]],
      include: Deck,
    });

    res.render("pages/mcq_list", {
      title: "Multiple Choice Questions",
      mcq_list: allMCQs,
    });
  } catch (err) {
    next(err);
  }
};

// MCQ detail
exports.mcq_detail = (req, res) => {
  res.redirect(`/mcqs/${req.params.id}/update`);
};

// Create form GET
exports.mcq_create_get = async (req, res, next) => {
  try {
    const allDecks = await Deck.findAll({ order: [["name", "ASC"]] });

    res.render("pages/mcq_form", {
      title: "Create Multiple Choice Question",
      backUrl: "/multiple-choice",
      decks: allDecks,
    });
  } catch (err) {
    next(err);
  }
};

// Create form POST
exports.mcq_create_post = [
  body("question")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Question is required."),
  body("options")
    .trim()
    .custom((value) => {
      const arr = value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.length < 2) throw new Error("At least two options are required.");
      return true;
    }),
  body("correctAnswer")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Correct answer is required."),
  body("imageUrl")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Image URL must be valid."),
  async (req, res, next) => {
    const errors = validationResult(req);

    let deckIds = req.body.decks || [];
    if (!Array.isArray(deckIds)) deckIds = [deckIds];

    const optionsArray = req.body.options
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const mcqData = {
      question: req.body.question,
      options: optionsArray,
      correctAnswer: req.body.correctAnswer,
      imageUrl: req.body.imageUrl || null,
    };

    // Validate correctAnswer ∈ options
    if (!optionsArray.includes(req.body.correctAnswer)) {
      errors.errors.push({
        msg: "Correct answer must be one of the options.",
        param: "correctAnswer",
      });
    }

    if (!errors.isEmpty()) {
      const allDecks = await Deck.findAll({ order: [["name", "ASC"]] });
      allDecks.forEach((d) => (d.checked = deckIds.includes(d.id.toString())));

      return res.render("pages/mcq_form", {
        title: "Create Multiple Choice Question",
        mcq: mcqData,
        decks: allDecks,
        errors: errors.array(),
      });
    }

    try {
      const mcq = await MultipleChoice.create(mcqData);
      await mcq.setDecks(deckIds);

      res.redirect("/multiple-choice");
    } catch (err) {
      next(err);
    }
  },
];

// Delete MCQ via API on POST.
exports.mcq_delete_post = async (req, res, next) => {
  try {
    const mcqId = req.params.id || req.body.mcqid;
    const mcq = await MultipleChoice.findByPk(mcqId);

    if (!mcq) {
      return res.status(404).json({ error: "MCQ not found" });
    }

    // Remove join-table entries first
    await mcq.setDecks([]);

    await mcq.destroy();

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Update GET
exports.mcq_update_get = async (req, res, next) => {
  try {
    const [mcq, allDecks] = await Promise.all([
      MultipleChoice.findByPk(req.params.id, { include: Deck }),
      Deck.findAll({ order: [["name", "ASC"]] }),
    ]);

    if (!mcq) {
      const err = new Error("Multiple-choice question not found");
      err.status = 404;
      return next(err);
    }

    const mcqDeckIds = mcq.Decks.map((d) => d.id);
    allDecks.forEach((d) => (d.checked = mcqDeckIds.includes(d.id)));

    res.render("pages/mcq_form", {
      title: "Update Multiple Choice Question",
      backUrl: "/multiple-choice",
      mcq,
      decks: allDecks,
    });
  } catch (err) {
    next(err);
  }
};

// Update POST
exports.mcq_update_post = [
  body("question")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Question is required."),
  body("options")
    .trim()
    .custom((value) => {
      const arr = value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.length < 2) throw new Error("At least two options are required.");
      return true;
    }),
  body("correctAnswer")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Correct answer is required."),
  body("imageUrl")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Image URL must be valid."),
  async (req, res, next) => {
    const errors = validationResult(req);
    const mcqId = req.params.id;

    let deckIds = req.body.decks || [];
    if (!Array.isArray(deckIds)) deckIds = [deckIds];

    const optionsArray = req.body.options
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedData = {
      id: mcqId,
      question: req.body.question,
      options: optionsArray,
      correctAnswer: req.body.correctAnswer,
      imageUrl: req.body.imageUrl || null,
    };

    if (!optionsArray.includes(req.body.correctAnswer)) {
      errors.errors.push({
        msg: "Correct answer must be one of the options.",
        param: "correctAnswer",
      });
    }

    if (!errors.isEmpty()) {
      const allDecks = await Deck.findAll({ order: [["name", "ASC"]] });
      allDecks.forEach((d) => (d.checked = deckIds.includes(d.id.toString())));

      return res.render("pages/mcq_form", {
        title: "Update Multiple Choice Question",
        mcq: updatedData,
        decks: allDecks,
        errors: errors.array(),
      });
    }

    try {
      const mcq = await MultipleChoice.findByPk(mcqId);
      await mcq.update(updatedData);
      await mcq.setDecks(deckIds);

      res.redirect("/multiple-choice");
    } catch (err) {
      next(err);
    }
  },
];
