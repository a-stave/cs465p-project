const express = require("express");
const router = express.Router();
const catalogController = require("../controllers/catalogController");

// GET home page.
router.get("/", catalogController.index);

// Library redirect home to /catalog
// router.get("/", (req, res) => {
//   res.redirect("/catalog");
// });

module.exports = router;
