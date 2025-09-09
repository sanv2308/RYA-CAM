const hierarchyLabels = [
  "LTN",
  "MTN",
  "HTN",
  "Chadlite",
  "Chad",
  "Adam"
];

let baseRating = null;

const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const ratingResult = document.getElementById("ratingResult");
const applyBtn = document.getElementById("applyBtn");
const simulateBtn = document.getElementById("simulateBtn");
const hierarchySelect = document.getElementById("hierarchySelect");

function randomRating() {
  return Math.floor(Math.random() * hierarchyLabels.length);
}

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    preview.src = e.target.result;
    baseRating = randomRating();
    ratingResult.textContent = `${hierarchyLabels[baseRating]} (PSL ${baseRating})`;
  };
  reader.readAsDataURL(file);
});

applyBtn.addEventListener("click", () => {
  if (baseRating === null) return;
  const procedures = document.querySelectorAll(".procedure:checked");
  let bonus = procedures.length; // one level per procedure
  let newRating = Math.min(baseRating + bonus, hierarchyLabels.length - 1);
  ratingResult.textContent = `${hierarchyLabels[newRating]} (PSL ${newRating})`;
});

simulateBtn.addEventListener("click", () => {
  const target = parseInt(hierarchySelect.value, 10);
  ratingResult.textContent = `${hierarchyLabels[target]} (PSL ${target})`;
});
