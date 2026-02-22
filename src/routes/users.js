const express = require("express");
const router = express.Router();

/* GET users listing. */
router
  .get("/", function (req, res, next) {
    res.send("respond with a resource");
  })
  /* Challenge: Add a new route for `localhost:3000/users/cool` */
  .get("/cool", function (req, res, next) {
    res.send("You are so cool");
  });

module.exports = router;
