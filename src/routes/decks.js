const express = require("express");
const router = express.Router();

const deckController = require("../controllers/deckController");

/// DECK ROUTES ///

// List all decks
router.get("/", deckController.deck_list);

// Create deck
router.get("/create", deckController.deck_create_get);
router.post("/create", deckController.deck_create_post);

// Delete deck
router.post("/:id/delete", deckController.deck_delete_post);

// Update deck
router.get("/:id/update", deckController.deck_update_get);
router.post("/:id/update", deckController.deck_update_post);

// Deck detail (must come last?)
router.get("/:id", deckController.deck_detail);

// Deck play
router.get("/:id/play", deckController.playDeck);

module.exports = router;
