let points;
const colors = {
  1: ["#a1d76a"],
  2: ["#e9a3c9", "#a1d76a"],
  3: ["#e9a3c9", "#f7f7f7", "#a1d76a"],
  4: ["#d01c8b", "#f1b6da", "#b8e186", "#4dac26"],
  5: ["#d01c8b", "#f1b6da", "#f7f7f7", "#b8e186", "#4dac26"],
  6: ["#c51b7d", "#e9a3c9", "#fde0ef", "#e6f5d0", "#a1d76a", "#4d9221"],
  7: [
    "#c51b7d",
    "#e9a3c9",
    "#fde0ef",
    "#f7f7f7",
    "#e6f5d0",
    "#a1d76a",
    "#4d9221",
  ],
  8: [
    "#c51b7d",
    "#de77ae",
    "#f1b6da",
    "#fde0ef",
    "#e6f5d0",
    "#b8e186",
    "#7fbc41",
    "#4d9221",
  ],
  9: [
    "#c51b7d",
    "#de77ae",
    "#f1b6da",
    "#fde0ef",
    "#f7f7f7",
    "#e6f5d0",
    "#b8e186",
    "#7fbc41",
    "#4d9221",
  ],
  10: [
    "#8e0152",
    "#c51b7d",
    "#de77ae",
    "#f1b6da",
    "#fde0ef",
    "#e6f5d0",
    "#b8e186",
    "#7fbc41",
    "#4d9221",
    "#276419",
  ],
  11: [
    "#8e0152",
    "#c51b7d",
    "#de77ae",
    "#f1b6da",
    "#fde0ef",
    "#f7f7f7",
    "#e6f5d0",
    "#b8e186",
    "#7fbc41",
    "#4d9221",
    "#276419",
  ],
};
const fetchButton = document.getElementById("fetch-points");
const isochroneButton = document.getElementById("calculate-isochrones");
const resetButton = document.getElementById("reset");

isochroneButton.addEventListener("click", (e) => {
  e.preventDefault;
  calculateIsochrones();
});

resetButton.addEventListener("click", (e) => {
  reset();
});

const addPoints = async () => {
  fetchButton.classList.remove("default");
  fetchButton.toggleAttribute("disabled");
  fetchButton.textContent = "Lade...";
  try {
    const res = await fetch(STATIC_BASE + "/points");
    const json = await res.json();
    console.log(json);
    if (json) {
      map.addSource("potsdam-altglas", {
        type: "geojson",
        data: json.points,
      });
      map.addLayer({
        id: "altglas",
        type: "circle",
        source: "potsdam-altglas",
        paint: {
          "circle-radius": 6,
          "circle-color": "#B42222",
        },
      });
      map.fitBounds(json.bbox);
      points = json.points;

      isochroneButton.classList.add("default");
      isochroneButton.toggleAttribute("disabled");
    }
  } catch (e) {
    console.error(e);
    setTimeout(() => {
      fetchButton.textContent = "Fehler!";
    }, 2000);
  } finally {
    fetchButton.classList.add("default");
    fetchButton.toggleAttribute("disabled");
    fetchButton.textContent = "Lade Altglascontainer";
  }
};

const calculateIsochrones = async () => {
  isochroneButton.classList.remove("default");
  isochroneButton.toggleAttribute("disabled");
  isochroneButton.textContent = "Berechne...";
  try {
    const formData = { points: points };
    formData.time_limit = document.querySelector(
      'input[name="time_limit"]'
    ).value;
    formData.buckets = document.querySelector('input[name="buckets"]').value;
    const res = await fetch(STATIC_BASE + "/isochrone", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    console.log(json);
    if (json) {
      map.addSource("isochrones-altglas", {
        type: "geojson",
        data: json,
      });
      map.addLayer({
        id: "isochrones",
        type: "fill",
        source: "isochrones-altglas",
        layout: {},
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.5,
        },
      });
    }
  } catch (e) {
    console.error(e);
    setTimeout(() => {
      isochroneButton.textContent = "Fehler!";
    }, 2000);
  } finally {
    isochroneButton.classList.add("default");
    isochroneButton.toggleAttribute("disabled");
    isochroneButton.textContent = "Erreichbarkeit berechnen";
    document.querySelector("h4").textContent = "Erreichbarkeit";
  }
};

const reset = () => {
  points = null;
  map.getLayer("isochrones") && map.removeLayer("isochrones");
  map.getSource("isochrones-altglas") && map.removeSource("isochrones-altglas");
  map.getLayer("altglas") && map.removeLayer("altglas");
  map.getSource("potsdam-altglas") && map.removeSource("potsdam-altglas");
  !isochroneButton.hasAttribute("disabled") &&
    isochroneButton.toggleAttribute("disabled");
};

const calculateIntervals = () => {
  const timeLimit = document.getElementById("input-time-limit").value;
  const buckets = document.getElementById("input-buckets").value;
  let intervals = [];
  for (i = 0; i < buckets; i++) {
    const interval = (timeLimit / buckets) * (i + 1);
    const rounded = round(interval, 2);
    intervals.push(rounded);
  }
  return intervals;
};

const buildLegendEntries = (intervals) => {
  const length = intervals.length;
  const legendColors = colors[length].reverse();
  let entries = [];
  for (i = 0; i < length; i++) {
    entries.push(
      `<div><span class="rounded-full inline-block h-2.5 mr-1.5 w-2.5" style="background-color: ${legendColors[i]}"></span> ${intervals[i]} min</div>`
    );
  }
  return entries;
};

const createLegend = () => {
  const intervals = calculateIntervals();
  const legendEntries = buildLegendEntries(intervals);
  document.getElementById("legend").innerHTML = legendEntries.join("");
};

const round = (number, decimalPlaces) => {
  const factorOfTen = Math.pow(10, decimalPlaces);
  return Math.round(number * factorOfTen) / factorOfTen;
};
