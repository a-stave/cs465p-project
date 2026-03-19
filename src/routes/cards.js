const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");

/// CARD ROUTES ///

// List all cards
router.get("/", cardController.card_list);

// Create card
router.get("/create", cardController.card_create_get);
router.post("/create", cardController.card_create_post);

// Delete card
router.get("/:id/delete", cardController.card_delete_get);
router.post("/:id/delete", cardController.card_delete_post);

// Update card
router.get("/:id/update", cardController.card_update_get);
router.post("/:id/update", cardController.card_update_post);

// Card detail (must come last)
router.get("/:id", cardController.card_detail);

module.exports = router;
