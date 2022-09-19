const express = require("express");

const axios = require("axios");
const turfHelpers = require("@turf/helpers");
const dissolve = require("@turf/dissolve");
const union = require("@turf/union");
const difference = require("@turf/difference");
const polygonSmooth = require("@turf/polygon-smooth");

const router = express.Router();

const BUCKETS = 5;
const GRAPHHOPPER_ISOCHRONE_URL =
  process.env.GRAPHHOPPER_ISOCHRONE_URL || "http://localhost:8080/isochrone";

router.post("/", async (req, res, next) => {
  try {
    const points = req.body;
    const rawGeoms = await getRawGeometries(points);
    const isochrones = getIsochrones(rawGeoms);
    res.send(isochrones);
  } catch (e) {
    console.error(e);
  }
});

const getRawGeometries = async (points) => {
  let geoms = [];
  for (const feature of points.features) {
    if (feature.geometry) {
      const apiResult = await fetchApi(feature.geometry.coordinates);
      if (apiResult.polygons) {
        for (const polygon of apiResult.polygons) {
          geoms.push(polygon);
        }
      }
    }
  }
  return geoms;
};

const fetchApi = async (point) => {
  const coords = point.reverse().join(",");
  const url = `${GRAPHHOPPER_ISOCHRONE_URL}?point=${coords}&profile=foot&time_limit=600&buckets=${BUCKETS}`;

  const result = await axios.get(url);
  return await result.data;
};

const getIsochrones = (polygons) => {
  const fc = turfHelpers.featureCollection(polygons);
  const isochrones = dissolve.default(fc, { propertyName: "bucket" });
  for (const feature of isochrones.features) {
    feature.properties.bucket = parseInt(feature.properties.bucket);
  }
  let unionedFeatures = unionFeatures(isochrones);
  unionedFeatures = buildDifference(unionedFeatures);
  isochrones.features = unionedFeatures;
  return isochrones;
};

const unionFeatures = (featureCollection) => {
  let unionedFeatures = [];
  let unionedFeature;
  for (let i = 0; i < BUCKETS; i++) {
    unionedFeature = null;
    for (const feature of featureCollection.features) {
      if (i === feature.properties.bucket) {
        if (!unionedFeature) {
          unionedFeature = feature;
        }
        unionedFeature = union.default(unionedFeature, feature);
      }
    }
    unionedFeature.properties.bucket = i;
    unionedFeatures.push(unionedFeature);
  }
  return unionedFeatures;
};

const buildDifference = (polygons) => {
  for (let i = polygons.length - 1; i > 0; i--) {
    polygons[i] = difference.default(polygons[i], polygons[i - 1]);
  }
  return polygons;
};

module.exports = router;
