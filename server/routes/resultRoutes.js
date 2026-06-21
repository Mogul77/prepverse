const express = require("express");
const router = express.Router();

const {
  saveResult,
  getResults,
} = require("../controllers/Resultcontroller");

router.post("/", saveResult);
router.get("/:userId", getResults);

module.exports = router;