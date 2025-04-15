const roots = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const chordTypes = ["Maj", "min", "7", "dim", "aug", "sus4"];
let chordData = {};
let state = {
  root: null,
  chordType: null,
  extension: null
};

function renderButtons(containerId, items, type) {
  const container = document.getElementById(containerId);
  items.forEach(label => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.dataset.type = type;
    btn.dataset.value = label;
    btn.onclick = () => handleSelection(type, label, btn);
    container.appendChild(btn);
  });
}

function renderExtensionButtons(extensionMap) {
  const container = document.getElementById("extension-container");
  Object.entries(extensionMap).forEach(([group, extensions]) => {
    Object.entries(extensions).forEach(([key, data]) => {
      const btn = document.createElement("button");
      btn.textContent = data.label;
      btn.dataset.type = "extension";
      btn.dataset.value = key;
      btn.dataset.group = group;
      btn.disabled = true;
      btn.onclick = () => handleSelection("extension", key, btn);
      container.appendChild(btn);
    });
  });
}

function handleSelection(type, value, btn) {
  // Deactivate all of the same type
  document.querySelectorAll(`button[data-type='${type}']`).forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  // Update state
  state[type === "chordType" ? "chordType" : type] = value;

  // Update valid extensions
  if (type === "chordType") {
    updateExtensionButtonStates();
  }

  tryTriggerChord();
}

function updateExtensionButtonStates() {
  const validGroup = chordTypeMap[state.chordType];
  document.querySelectorAll("button[data-type='extension']").forEach(btn => {
    const isValid = btn.dataset.group === validGroup;
    btn.disabled = !isValid;
    if (!isValid) btn.classList.remove("active");
  });
  state.extension = null;
}

function tryTriggerChord() {
  const { root, chordType, extension } = state;
  if (!root || !chordType || !extension) return;

  const chordGroup = chordTypeMap[chordType];
  const chordObj = chordData[chordGroup][extension];

  console.log(`Chord: ${root} ${chordType} ${chordObj.label}`);
  console.log(`Intervals: ${chordObj.intervals.join(", ")}`);
  console.log(`Description: ${chordObj.description}`);
}

// Link chordType to chordData group
const chordTypeMap = {
  "Maj": "Major",
  "min": "Minor",
  "7": "Dominant",
  "dim": "Diminished",
  "aug": "Augmented",
  "sus4": "Sus4"
};

renderButtons("root-container", roots, "root");
renderButtons("chord-type-container", chordTypes, "chordType");

fetch("chord_data_detailed.json")
  .then(response => response.json())
  .then(data => {
    chordData = data;
    renderExtensionButtons(data);
  })
  .catch(err => {
    console.error("Failed to load chord data:", err);
  });
