const express = require("express");

const axios = require("axios");
const bbox = require("@turf/bbox");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const points = await getPoints();
    res.send({
      points: points,
      bbox: bbox.default(points),
    });
  } catch (e) {
    console.error(e);
  }
});

const getPoints = async () => {
  const res = await axios(
    "https://opendata.potsdam.de/explore/dataset/standplatze-glassammlung/download/?format=geojson&timezone=Europe/Berlin&lang=de"
  );
  return await res.data;
};

module.exports = router;
