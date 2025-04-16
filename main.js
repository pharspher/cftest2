const roots = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "Db", "Eb", "Gb", "Ab", "Bb"];
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

  if (type === "chordType") {
    updateExtensionButtonStates();
  }

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

    if (isValid) {
      validButtons.push(btn);
    }

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



function resolveNote(originalRoot, interval) {
  const semitoneOffsets = {
    "1": 0, "b2": 1, "2": 2, "#2": 3, "b3": 3, "3": 4, "4": 5, "#4": 6,
    "b5": 6, "5": 7, "#5": 8, "b6": 8, "6": 9, "bb7": 9, "b7": 10, "7": 11,
    "b9": 1, "9": 2, "#9": 3, "11": 5, "#11": 6, "b13": 8, "13": 9
  };

  const enharmonicMap = {
    1: { sharp: "C#", flat: "Db" },
    3: { sharp: "D#", flat: "Eb" },
    6: { sharp: "F#", flat: "Gb" },
    8: { sharp: "G#", flat: "Ab" },
    10: { sharp: "A#", flat: "Bb" }
  };

  const chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const aliasMap = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };

  const useFlats = originalRoot.includes("b");
  const normalizedRoot = aliasMap[originalRoot] || originalRoot;
  const baseIndex = chromatic.indexOf(normalizedRoot);
  const offset = semitoneOffsets[interval] ?? 0;
  const resolvedIndex = (baseIndex + offset + 12) % 12;
  const rawNote = chromatic[resolvedIndex];

  if (enharmonicMap[resolvedIndex]) {
    return useFlats ? enharmonicMap[resolvedIndex].flat : enharmonicMap[resolvedIndex].sharp;
  }

  return rawNote;
}
  };

  const chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const aliasMap = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };

  const useFlats = originalRoot.includes("b");
  const normalizedRoot = aliasMap[originalRoot] || originalRoot;
  const baseIndex = chromatic.indexOf(normalizedRoot);
  const offset = semitoneOffsets[interval] ?? 0;
  const resolvedIndex = (baseIndex + offset) % 12;
  const rawNote = chromatic[resolvedIndex];

  if (enharmonicMap[resolvedIndex]) {
    return useFlats ? enharmonicMap[resolvedIndex].flat : enharmonicMap[resolvedIndex].sharp;
  }

  return rawNote;
}
  };

  const chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const aliasMap = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };

  const useFlats = root.includes("b");
  const normalizedRoot = aliasMap[root] || root;
  const baseIndex = chromatic.indexOf(normalizedRoot);
  const offset = semitoneOffsets[interval] ?? 0;
  const resolvedIndex = (baseIndex + offset) % 12;
  const rawNote = chromatic[resolvedIndex];

  if (enharmonicMap[resolvedIndex]) {
    return useFlats ? enharmonicMap[resolvedIndex].flat : enharmonicMap[resolvedIndex].sharp;
  }

  return rawNote;
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

  const allVoicingIntervals = [...chordObj.voicing.left, ...chordObj.voicing.right];
  const chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const baseIndex = chromatic.indexOf(({"Db":"C#","Eb":"D#","Gb":"F#","Ab":"G#","Bb":"A#"}[state.root] || state.root));
  const useFlats = state.root.includes("b");

  const resolvedVoicing = allVoicingIntervals.map(interval => {
    const note = resolveNote(state.root, interval);
    const absIndex = (baseIndex + ({
      "1": 0, "b2": 1, "2": 2, "#2": 3, "b3": 3, "3": 4, "4": 5, "#4": 6,
      "b5": 6, "5": 7, "#5": 8, "b6": 8, "6": 9, "bb7": 9, "b7": 10, "7": 11,
      "b9": 1, "9": 2, "#9": 3, "11": 5, "#11": 6, "b13": 8, "13": 9
    }[interval] || 0)) % 12;
    return { name: note, index: absIndex };
  });

  const sorted = resolvedVoicing.sort((a, b) => a.index - b.index).map(n => n.name);
  display.textContent = `${state.root}${chordObj.label} (${sorted.join(", ")})`;

  const leftNotes = chordObj.voicing.left.map(i => resolveNote(state.root, i));
  const rightNotes = chordObj.voicing.right.map(i => resolveNote(state.root, i));
  noteList.textContent = `LH: ${leftNotes.join(", ")} | RH: ${rightNotes.join(", ")}`;
}

  const chordGroup = chordTypeMap[state.chordType];
  const chordObj = chordData[chordGroup][state.extension];

  const leftNotes = chordObj.voicing.left.map(i => resolveNote(state.root, i));
  const rightNotes = chordObj.voicing.right.map(i => resolveNote(state.root, i));
  const allNotes = [...leftNotes, ...rightNotes];

  display.textContent = `${state.root}${chordObj.label} (${allNotes.join(", ")})`;
  noteList.textContent = `LH: ${leftNotes.join(", ")} | RH: ${rightNotes.join(", ")}`;
}

  const chordGroup = chordTypeMap[state.chordType];
  const chordObj = chordData[chordGroup][state.extension];

  const leftNotes = chordObj.voicing.left.map(i => resolveNote(state.root, i));
  const rightNotes = chordObj.voicing.right.map(i => resolveNote(state.root, i));
  const allNotes = [...leftNotes, ...rightNotes];

  display.textContent = chordText + " (" + allNotes.join(", ") + ")";
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
