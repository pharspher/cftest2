
const roots = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Db", "Eb", "Gb", "Ab", "Bb"];
const chordTypes = ["Maj", "min", "7", "dim", "aug", "sus4"];
let chordData = {};
let state = {
  root: null,
  chordType: null,
  extension: null
};

const chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const semitoneOffsets = {
  "1": 0, "b2": 1, "2": 2, "#2": 3, "b3": 3, "3": 4, "4": 5, "#4": 6,
  "b5": 6, "5": 7, "#5": 8, "b6": 8, "6": 9, "bb7": 9, "b7": 10, "7": 11,
  "b9": 1, "9": 2, "#9": 3, "11": 5, "#11": 6, "b13": 8, "13": 9
};
const aliasMap = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };
const majorScales = {
  "C": ["C", "D", "E", "F", "G", "A", "B"],
  "C#": ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
  "D": ["D", "E", "F#", "G", "A", "B", "C#"],
  "D#": ["D#", "E#", "F##", "G#", "A#", "B#", "C##"],
  "E": ["E", "F#", "G#", "A", "B", "C#", "D#"],
  "F": ["F", "G", "A", "Bb", "C", "D", "E"],
  "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
  "G": ["G", "A", "B", "C", "D", "E", "F#"],
  "G#": ["G#", "A#", "B#", "C#", "D#", "E#", "F##"],
  "A": ["A", "B", "C#", "D", "E", "F#", "G#"],
  "A#": ["A#", "B#", "C##", "D#", "E#", "F##", "G##"],
  "B": ["B", "C#", "D#", "E", "F#", "G#", "A#"],
  "Db": ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  "Eb": ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  "Gb": ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
  "Ab": ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  "Bb": ["Bb", "C", "D", "Eb", "F", "G", "A"]
};

const intervalToDegree = {
  "1": 0, "b2": 1, "2": 1, "#2": 1, "b3": 2, "3": 2,
  "4": 3, "#4": 3, "b5": 4, "5": 4, "#5": 4,
  "b6": 5, "6": 5, "bb7": 6, "b7": 6, "7": 6,
  "b9": 1, "9": 1, "#9": 1, "11": 3, "#11": 3,
  "b13": 5, "13": 5
};

function resolveNote(root, interval) {
  const offset = semitoneOffsets[interval] ?? 0;
  const normalized = aliasMap[root] || root;
  const baseIndex = chromatic.indexOf(normalized);
  const resolvedIndex = (baseIndex + offset + 12) % 12;
  const rawNote = chromatic[resolvedIndex];

  const scale = majorScales[root];
  if (!scale) return rawNote;

  const accidental = interval.startsWith("b") ? "b" :
                     interval.startsWith("#") ? "#" : "";

  const degree = intervalToDegree[interval];
  if (degree === undefined || !scale[degree]) return rawNote;

  let baseNote = scale[degree];
  if (accidental === "b" && !baseNote.includes("b") && !baseNote.includes("#")) {
    return baseNote + "b";
  }
  if (accidental === "#" && !baseNote.includes("b") && !baseNote.includes("#")) {
    return baseNote + "#";
  }
  return baseNote;
}

function renderButtons(containerId, items, type) {
  const container = document.getElementById(containerId);
  items.forEach(label => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.dataset.type = type;
    btn.dataset.value = label;
    btn.onpointerdown = () => handleSelection(type, label, btn);
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
      btn.onpointerdown = () => handleSelection("extension", key, btn);
      container.appendChild(btn);
    });
  });
}

function handleSelection(type, value, btn) {
  document.querySelectorAll(`button[data-type='${type}']`).forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  state[type === "chordType" ? "chordType" : type] = value;

  if (type === "chordType") updateExtensionButtonStates();
  tryTriggerChord();
}

function updateExtensionButtonStates() {
  const validGroup = chordTypeMap[state.chordType];
  const wasExtension = state.extension;
  let extensionStillValid = false;
  let validButtons = [];

  document.querySelectorAll("button[data-type='extension']").forEach(btn => {
    const isValid = btn.dataset.group === validGroup;
    btn.disabled = !isValid;

    if (isValid) validButtons.push(btn);

    if (btn.dataset.value === wasExtension && isValid) {
      extensionStillValid = true;
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  if (!extensionStillValid) {
    state.extension = null;
    updateChordDisplay(null, []);
  }

  if (validButtons.length === 1) {
    const btn = validButtons[0];
    btn.classList.add("active");
    state.extension = btn.dataset.value;
    tryTriggerChord();
  } else if (extensionStillValid) {
    tryTriggerChord();
  }
}

function updateChordDisplay(chordText, intervals = []) {
  const display = document.getElementById("chord-display");
  const noteList = document.getElementById("note-list");

  if (!chordText || !intervals.length) {
    display.textContent = "—";
    noteList.textContent = "";
    return;
  }

  const chordGroup = chordTypeMap[state.chordType];
  const chordObj = chordData[chordGroup][state.extension];

  const allNotes = intervals.map(i => resolveNote(state.root, i));
  display.textContent = `${state.root}${chordObj.label} (${allNotes.join(", ")})`;

  const leftNotes = chordObj.voicing.left.map(i => resolveNote(state.root, i));
  const rightNotes = chordObj.voicing.right.map(i => resolveNote(state.root, i));
  noteList.textContent = `LH: ${leftNotes.join(", ")} | RH: ${rightNotes.join(", ")}`;
}

function tryTriggerChord() {
  if (state.chordType === "7" && !state.extension) {
    const extButtons = document.querySelectorAll("button[data-type='extension'][data-group='Dominant']");
    for (const btn of extButtons) {
      if (btn.dataset.value === "7" && !btn.disabled) {
        btn.classList.add("active");
        state.extension = "7";
        break;
      }
    }
  }

  const { root, chordType, extension } = state;
  if (!root || !chordType || !extension) return;

  const chordGroup = chordTypeMap[chordType];
  const chordObj = chordData[chordGroup][extension];

  updateChordDisplay(`${root}${chordObj.label}`, chordObj.intervals);
}

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
