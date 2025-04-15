const roots = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const chordTypes = ["Maj", "min", "7", "dim", "aug", "sus4"];
let selectedRoot = null;
let selectedChordType = null;
let chordData = {};

function renderButtons(containerId, items, onClick, multiSelect = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  items.forEach(label => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.onclick = () => {
      if (!multiSelect) {
        [...container.children].forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      } else {
        btn.classList.toggle("active");
      }
      onClick(label);
    };
    container.appendChild(btn);
  });
}

function updateExtensions() {
  const container = document.getElementById("extension-container");
  container.innerHTML = "";

  if (!selectedChordType || !chordData[selectedChordType]) return;

  const combos = chordData[selectedChordType];

  Object.entries(chordData).forEach(([type, extensions]) => {
    Object.entries(extensions).forEach(([key, data]) => {
      const btn = document.createElement("button");
      btn.textContent = data.label;
      const isValid = type === selectedChordType;
      if (!isValid) btn.disabled = true;
      btn.onclick = () => {
        if (!btn.disabled) {
          [...container.children].forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          console.log(`Selected chord: ${selectedRoot} ${selectedChordType} ${data.label}`);
          console.log(`Intervals: ${data.intervals.join(", ")}`);
          console.log(`Description: ${data.description}`);
        }
      };
      container.appendChild(btn);
    });
  });
}

renderButtons("root-container", roots, root => {
  selectedRoot = root;
  console.log(`Selected root: ${root}`);
});

renderButtons("chord-type-container", chordTypes, chordType => {
  selectedChordType = chordType;
  console.log(`Selected chord type: ${chordType}`);
  updateExtensions();
});

fetch("chord_data_detailed.json")
  .then(response => response.json())
  .then(data => {
    chordData = {
      "Maj": data.Major,
      "min": data.Minor,
      "7": data.Dominant,
      "dim": data.Diminished,
      "aug": data.Augmented,
      "sus4": data.Sus4
    };
    updateExtensions();
  })
  .catch(err => {
    console.error("Failed to load chord data:", err);
  });
