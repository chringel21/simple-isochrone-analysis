let points;
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
