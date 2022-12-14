let usedNumbers = [];
let usedAnswers = [];
let checkedItems = [];
let localStorageUpdater = [];
let answerText = [];
let bingo = false;
const phrases = [
  "Jävlar",
  "Easy!",
  "Sluta!",
  "I'm scared",
  "We're fine!",
  "Woah",
  "You lil' shit",
  "Aha!",
  "Vad är det?",
  "I'm so confused...",
  "Oh my god",
  "Kom då",
  "Really?",
  "Where am I?",
  "Men näääee",
  "Nej!",
  "What am I supposed to do?",
  "Oj!",
  "Stop it",
  "Oh goodness gracious",
  "Look at that!",
  "I can do this",
  "This is terrifying.",
  "That was so not fair!",
  "Va?!",
];

const emojis = [
  {
    type: {
      christmas: "❄️",
      halloween: "🕸️",
    },
    chance: 0,
  },
  {
    type: {
      christmas: "🎄",
      halloween: "👻",
    },
    chance: 40,
  },
  {
    type: {
      christmas: "☃️",
      halloween: "🎃",
    },
    chance: 40,
  },
  {
    type: {
      christmas: "🦝",
      halloween: "🦝",
    },
    chance: 1,
  },
  {
    type: {
      christmas: "🦌",
      halloween: "🦌",
    },
    chance: 5,
  },
];

const getRandomEmoji = () => {
  const theme = document.documentElement.getAttribute("data-theme");
  const filler = 100 - emojis.map((r) => r.chance).reduce((sum, current) => sum + current);

  if (filler <= 0) {
    console.log("chances sum is higher than 100!");
    return;
  }

  let probability = emojis.map((r, i) => Array(r.chance === 0 ? filler : r.chance).fill(i)).reduce((c, v) => c.concat(v), []);
  let pIndex = Math.floor(Math.random() * 100);
  const rarity = emojis[probability[pIndex]];

  return rarity.type[theme] === undefined ? "🤓" : rarity.type[theme];
};

const toggleDropdown = () => {
  document.getElementById("myDropdown").classList.toggle("show");
};

const switchTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    document.getElementById("myDropdown").classList.remove("show");
  }
};

window.onload = () => {
  const cards = JSON.parse(localStorage.getItem("cards"));
  const gameStatus = JSON.parse(localStorage.getItem("gameStatus"));
  if (cards === null || gameStatus === null || (gameStatus != null && gameStatus.winState === true)) {
    particles.stop();
    console.log("Generating new cards");
    createGame();
  } else {
    particles.stop();
    console.log("Generating cards from localstorage", cards);
    generateBingoCardsFromLocalStorage(cards, gameStatus);
  }
};

const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const checkDiagonal = (items) => {
  let diagonal_left_right = [
    { row: 0, column: 0 },
    { row: 1, column: 1 },
    { row: 2, column: 2 },
    { row: 3, column: 3 },
    { row: 4, column: 4 },
  ];
  let diagonal_right_left = [
    { row: 0, column: 4 },
    { row: 1, column: 3 },
    { row: 2, column: 2 },
    { row: 3, column: 1 },
    { row: 4, column: 0 },
  ];

  let LR_i = 0;
  let RL_i = 0;

  for (const newItem of diagonal_left_right) {
    items.map((item) => {
      if (item.row === newItem.row && item.column === newItem.column) {
        LR_i++;
      }
    });
  }
  for (const newItem of diagonal_right_left) {
    items.map((item) => {
      if (item.row === newItem.row && item.column === newItem.column) {
        RL_i++;
      }
    });
  }
  if (LR_i === 5 || RL_i === 5) {
    bingo = true;
    console.log("Diagonal");
    win();
  }
};
const reset = () => {
  usedNumbers = [];
  usedAnswers = [];
  checkedItems = [];
  localStorageUpdater = [];
  answerText = [];
  let bingoAnswerDiv = document.getElementById("answers");
  removeChilds(bingoAnswerDiv);
  let bingoWinDiv = document.getElementById("win");
  bingoWinDiv.style.visibility = "hidden";
  particles.stop();
  const bingoGrid = document.getElementById("bingo-grid");
  removeChilds(bingoGrid);
  localStorage.clear();
  bingo = false;
  createGame();
};

const removeChilds = (parent) => {
  while (parent.lastChild) {
    parent.removeChild(parent.lastChild);
  }
};

const updateGameStatus = (object) => {
  localStorage.setItem("gameStatus", JSON.stringify(object));
};

const createGame = async () => {
  if (usedNumbers.length === 0) {
    await generateBingoCards();
  }
};

const generateBingoCardsFromLocalStorage = async (cards, gameStatus) => {
  checkedItems = gameStatus.selectedItems;
  const rowLookup = gameStatus === null ? [] : gameStatus.rowLookup;
  for (const bingoCards of cards) {
    const checked = document.createElement("span");
    const bingoItem = document.createElement("button");
    bingoItem.id = bingoCards.id;
    bingoItem.className = bingoCards.className;
    bingoItem.innerText = bingoCards.innerText;
    if (bingoCards.checked.status === true) {
      checked.className = "checked";
      checked.innerHTML = bingoCards.checked.emote;
    }
    bingoItem.onclick = () => {
      const bingoId = bingoItem.id.split("-");
      const columnId = parseInt(bingoId[1]);
      const rowId = parseInt(bingoId[2]);
      const checkedDIV = bingoItem.children[0];
      usedAnswers.push(bingoItem);
      if (checkedDIV.className === "checked") {
        checkedDIV.innerHTML = ``;
        checkedDIV.className = "";
        const indexOfObject = checkedItems.findIndex((object) => {
          return object.row === rowId && object.column === columnId;
        });
        checkedItems.splice(indexOfObject, 1);
        const rowExist = (item) => item.row === rowId;
        const item = rowLookup.find(rowExist);

        if (item.row === rowId) {
          item.columns--;
        }
        for (let i = 0; i < localStorageUpdater.length; i++) {
          if (localStorageUpdater[i].id === bingoItem.id) {
            localStorageUpdater[i].checked.status = false;
            localStorageUpdater[i].checked.emote = "";
          }
          localStorage.setItem("cards", JSON.stringify(localStorageUpdater));
        }
      } else {
        checkedItems.push({ row: rowId, column: columnId });
        updateGameStatus({ rowLookup: rowLookup, winState: bingo, selectedItems: checkedItems });
        let randomEmoji = getRandomEmoji();
        checkedDIV.innerHTML = `${randomEmoji}`;
        checkedDIV.className = "checked";
        for (let i = 0; i < localStorageUpdater.length; i++) {
          if (localStorageUpdater[i].id === bingoItem.id) {
            localStorageUpdater[i].checked.status = true;
            localStorageUpdater[i].checked.emote = randomEmoji;
          }
          localStorage.setItem("cards", JSON.stringify(localStorageUpdater));
        }
        // Check for win on columns
        const columnCount = checkedItems.filter((obj) => obj.column === columnId).length;
        if (columnCount === 5) {
          console.log("Column");
          bingo = true;
          win();
          updateGameStatus({ rowLookup: rowLookup, winState: bingo, selectedItems: checkedItems });
        }

        // Check for win on rows
        const rowExist = (item) => item.row === rowId;
        const item = rowLookup.find(rowExist);
        if (item) {
          item.columns++;
          if (item.columns === 5) {
            console.log("Row");
            bingo = true;
            updateGameStatus({ rowLookup: rowLookup, winState: bingo });
            win();
          }
        } else {
          rowLookup.push({ row: rowId, columns: 1 });
        }
      }
      checkDiagonal(checkedItems);
      updateGameStatus({ rowLookup: rowLookup, winState: bingo, selectedItems: checkedItems });
    };
    localStorageUpdater.push({
      id: bingoCards.id,
      className: bingoCards.className,
      innerText: bingoCards.innerText,
      checked: { status: bingoCards.checked.status, emote: bingoCards.checked.emote },
    });
    bingoItem.appendChild(checked);
    const bingoGrid = document.getElementById("bingo-grid");
    bingoGrid.appendChild(bingoItem);
  }
};

// ASJDIUAHSDIUYAHSDIUAHSDIUYAHSDIUH
const generateBingoCards = async () => {
  const rowLookup = [];
  let row = 0;
  let rows = 0;
  let column = 0;
  for (let i = 0; i < phrases.length; ) {
    let n = randomNumber(0, 24);
    if (usedNumbers.includes(n)) {
      n = randomNumber(0, 24);
    } else {
      usedNumbers.push(n);
      const checked = document.createElement("span");
      const bingoItem = document.createElement("button");
      bingoItem.id = `${n}-${row}-${column}`;
      bingoItem.className = "grid-item";
      bingoItem.innerText = `${phrases[n]}`;
      bingoItem.onclick = () => {
        const bingoId = bingoItem.id.split("-");
        const columnId = parseInt(bingoId[1]);
        const rowId = parseInt(bingoId[2]);
        const checkedDIV = bingoItem.children[0];
        usedAnswers.push(bingoItem);
        if (checkedDIV.className === "checked") {
          checkedDIV.innerHTML = ``;
          checkedDIV.className = "";
          const indexOfObject = checkedItems.findIndex((object) => {
            return object.row === rowId && object.column === columnId;
          });
          checkedItems.splice(indexOfObject, 1);
          const rowExist = (item) => item.row === rowId;
          const item = rowLookup.find(rowExist);

          if (item.row === rowId) {
            item.columns--;
          }

          for (let i = 0; i < localStorageUpdater.length; i++) {
            if (localStorageUpdater[i].id === bingoItem.id) {
              localStorageUpdater[i].checked.status = false;
              localStorageUpdater[i].checked.emote = "";
            }
            localStorage.setItem("cards", JSON.stringify(localStorageUpdater));
          }
        } else {
          checkedItems.push({ row: rowId, column: columnId });
          let randomEmoji = getRandomEmoji();
          checkedDIV.innerHTML = `${randomEmoji}`;
          checkedDIV.className = "checked";
          for (let i = 0; i < localStorageUpdater.length; i++) {
            if (localStorageUpdater[i].id === bingoItem.id) {
              localStorageUpdater[i].checked.status = true;
              localStorageUpdater[i].checked.emote = randomEmoji;
            }
            localStorage.setItem("cards", JSON.stringify(localStorageUpdater));
          }
          const columnCount = checkedItems.filter((obj) => obj.column === columnId).length;
          if (columnCount === 5) {
            console.log("Column");
            bingo = true;
            win();
          }

          const rowExist = (item) => item.row === rowId;
          const item = rowLookup.find(rowExist);
          if (item != undefined) {
            item.columns++;
            if (item.columns === 5) {
              console.log("Row");
              bingo = true;
              updateGameStatus({ rowLookup: rowLookup, winState: bingo, selectedItems: checkedItems });

              win();
            }
          } else {
            rowLookup.push({ row: rowId, columns: 1 });
            rows++;
          }
        }
        updateGameStatus({ rowLookup: rowLookup, winState: bingo, selectedItems: checkedItems });
        checkDiagonal(checkedItems);
      };
      bingoItem.appendChild(checked);
      const bingoGrid = document.getElementById("bingo-grid");
      bingoGrid.appendChild(bingoItem);
      localStorageUpdater.push({
        id: bingoItem.id,
        className: bingoItem.className,
        innerText: bingoItem.innerText,
        checked: { status: false, emote: "" },
      });
      localStorage.setItem("cards", JSON.stringify(localStorageUpdater));
      if (row === 4) {
        row = 0;
        column++;
      } else {
        row++;
      }
      i++;
    }
  }
};

const win = () => {
  const cards = JSON.parse(localStorage.getItem("cards"));
  console.log(cards);
  if (bingo != false) {
    let bingoAnswerDiv = document.getElementById("answers");
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].checked.status) {
        let bingoAnswer = document.createElement("p");
        bingoAnswer.className = "bingo-answer-child";
        bingoAnswer.innerText = cards[i].innerText;
        answerText.push(bingoAnswer.innerText);
        bingoAnswerDiv.appendChild(bingoAnswer);
      }
    }
    let bingoWinDiv = document.getElementById("win");
    bingoWinDiv.children[0].children[0].classList.add("gentle-tilt-move-shake");
    bingoWinDiv.style.visibility = "visible";
    particles.refresh();
  }
};

tsParticles.load("tsparticles", {
  fullScreen: {
    zIndex: 1,
  },
  emitters: [
    {
      position: {
        x: 0,
        y: 30,
      },
      rate: {
        quantity: 5,
        delay: 0.15,
      },
      particles: {
        move: {
          direction: "top-right",
          outModes: {
            top: "none",
            left: "none",
            default: "destroy",
          },
        },
      },
    },
    {
      position: {
        x: 100,
        y: 30,
      },
      rate: {
        quantity: 5,
        delay: 0.15,
      },
      particles: {
        move: {
          direction: "top-left",
          outModes: {
            top: "none",
            right: "none",
            default: "destroy",
          },
        },
      },
    },
  ],
  particles: {
    color: {
      value: ["#f21b1d", "#24bcf4", "#ffdd31", "#b48cb7", "#d7ee44", "#FFF"],
    },
    move: {
      decay: 0.05,
      direction: "top",
      enable: true,
      gravity: {
        enable: true,
      },
      outModes: {
        top: "none",
        default: "destroy",
      },
      speed: {
        min: window.outerWidth < 800 ? 20 : 50,
        max: window.outerWidth < 800 ? 50 : 100,
      },
    },
    number: {
      value: 0,
    },
    opacity: {
      value: 1,
    },
    rotate: {
      value: {
        min: 0,
        max: 360,
      },
      direction: "random",
      animation: {
        enable: true,
        speed: 30,
      },
    },
    tilt: {
      direction: "random",
      enable: true,
      value: {
        min: 0,
        max: 360,
      },
      animation: {
        enable: true,
        speed: 30,
      },
    },
    size: {
      value: {
        min: 2,
        max: 5,
      },
      animation: {
        enable: true,
        startValue: "min",
        count: 1,
        speed: 25,
        sync: true,
      },
    },
    roll: {
      darken: {
        enable: true,
        value: 25,
      },
      enable: true,
      speed: {
        min: 5,
        max: 15,
      },
    },
    wobble: {
      distance: 30,
      enable: true,
      speed: {
        min: -7,
        max: 7,
      },
    },
    shape: {
      type: "circle",
      options: {},
    },
  },
});
const particles = tsParticles.domItem(0);
