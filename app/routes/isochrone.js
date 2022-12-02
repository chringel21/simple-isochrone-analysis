const express = require("express");

const axios = require("axios");

const router = express.Router();

let buckets, timeLimit;
const GRAPHHOPPER_ISOCHRONE_URL =
  process.env.GRAPHHOPPER_ISOCHRONE_URL || "http://localhost:8080/isochrone";

router.post("/", async (req, res, next) => {
  try {
    const points = req.body.points;
    timeLimit = req.body.time_limit * 60;
    buckets = parseInt(req.body.buckets);
    const rawGeoms = await getRawGeometries(points, timeLimit, buckets);
    res.send(rawGeoms);
  } catch (e) {
    console.error(e);
  }
});

const getRawGeometries = async (points, timeLimit, buckets) => {
  let geoms = [];
  for (const feature of points.features) {
    if (feature.geometry) {
      const apiResult = await fetchApi(
        feature.geometry.coordinates,
        timeLimit,
        buckets
      );
      if (apiResult.polygons) {
        for (const polygon of apiResult.polygons) {
          geoms.push(polygon);
        }
      }
    }
  }
  return geoms;
};

const fetchApi = async (point, timeLimit, buckets) => {
  const coords = point.reverse().join(",");
  const url = `${GRAPHHOPPER_ISOCHRONE_URL}?point=${coords}&profile=foot&time_limit=${timeLimit}&buckets=${buckets}`;

  const result = await axios.get(url);
  return await result.data;
};

module.exports = router;
