const express = require("express");
const router = express.Router();

/* GET home page. Deprecated HOME in favor of redirecting to /catalog. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });

// GET home page.
router.get("/", (req, res) => {
  res.redirect("/catalog");
});

module.exports = router;
