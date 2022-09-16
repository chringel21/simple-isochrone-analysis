const express = require("express");

const bbox = require("@turf/bbox");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const points = await getPoints();
    const bounds = bbox.default(points);
    res.send({
      points: points,
      bbox: bounds,
    });
  } catch (e) {
    console.error(e);
  }
});

const getPoints = async () => {
  const res = await fetch(
    "https://opendata.potsdam.de/explore/dataset/standplatze-glassammlung/download/?format=geojson&timezone=Europe/Berlin&lang=de"
  );
  return await res.json();
};

module.exports = router;
