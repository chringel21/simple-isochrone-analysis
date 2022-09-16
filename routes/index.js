const express = require("express");
const router = express.Router();

const INDEX_CONFIG = {
  STYLE_URL:
    process.env.STYLE_URL ||
    "http://localhost:8080/tiles/styles/osm-bright-gl-style/style.json",
};

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", INDEX_CONFIG);
});

module.exports = router;
