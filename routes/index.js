const express = require("express");
const { config } = require("dotenv");
const router = express.Router();

config();

const STATIC_BASE = process.env.BASE === "/" ? "" : process.env.BASE;
const INDEX_CONFIG = {
  BASE: process.env.BASE || "",
  STATIC_BASE: STATIC_BASE,
  STYLE_URL:
    process.env.STYLE_URL ||
    "http://localhost:8080/tiles/styles/osm-bright-gl-style/style.json",
  title: "Wie weit zum Altglas",
};

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("index", INDEX_CONFIG);
});

module.exports = router;
