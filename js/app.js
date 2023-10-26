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

const EMOJIS = [
  {
    type: {
      christmas: "❄️",
      halloween: "🕸️",
    },
    chance: 5,
  },
  {
    type: {
      christmas: "🎄",
      halloween: "👻",
    },
    chance: 45,
  },
  {
    type: {
      christmas: "☃️",
      halloween: "🎃",
    },
    chance: 45,
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
    chance: 4,
  },
];

const getRandomEmoji = () => {
  const theme = document.documentElement.getAttribute("data-theme");

  const totalChance = EMOJIS.reduce((sum, { chance }) => sum + chance, 0);
  if (totalChance !== 100) {
    console.log("Chances sum is not equal to 100!");
    return;
  }

  const probability = EMOJIS.flatMap(({ chance }, index) =>
    Array(chance).fill(index)
  );
  const index = Math.floor(Math.random() * probability.length);
  const rarity = EMOJIS[probability[index]];
  return rarity.type[theme] ?? "🤓";
};

const toggleDropdown = () => {
  document.getElementById("themes").classList.toggle("show");
};

const switchTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};
window.onclick = function (event) {
  if (!event.target.matches(".theme-button")) {
    document.getElementById("themes").classList.remove("show");
  }
};

const insertHTML = (el, html) => el.insertAdjacentHTML("afterbegin", html);

const replaceHTML = (el, html) => {
	el.replaceChildren();
	insertHTML(el, html);
};

const generate = () => {
    const grid = document.querySelector("#bingo-grid");
    const cells = phrases.map((phrase, index) => createCell(phrase, index));
    cells.forEach(cell => {
      insertHTML(grid, cell)
      console.log(cell)
    });
  };
  
  const createCell = (phrase, index) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    const id = `${index}-${row}-${col}`;
    return `
    <button data-id=${id} data-card="toggle" class="toggle grid-item">
    ${phrase}
    <span class="checked"></span>
    </button>
    `;
  };
  
  window.onload = () => {
    const cards = JSON.parse(localStorage.getItem("cards"));
    const gameStatus = JSON.parse(localStorage.getItem("gameStatus"));
    if (cards === null || gameStatus === null || (gameStatus != null && gameStatus.winState === true)) {
          console.log("Generating new cards");
      createGame();
    } else {
          console.log("Generating cards from localstorage", cards);
      createGame();
    }
  };
  
  const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  
  const checkDiagonal = (items) => {
    const diagonalDirections = [
      [{ row: 0, column: 0 }, { row: 1, column: 1 }, { row: 2, column: 2 }, { row: 3, column: 3 }, { row: 4, column: 4 }],
      [{ row: 0, column: 4 }, { row: 1, column: 3 }, { row: 2, column: 2 }, { row: 3, column: 1 }, { row: 4, column: 0 }],
    ];
  
    for (const diagonal of diagonalDirections) {
      let count = 0;
      for (const item of diagonal) {
        if (items.some(i => i.row === item.row && i.column === item.column)) {
          count++;
        }
      }
      if (count === 5) {
        bingo = true;
        console.log("Diagonal");
        win();
      }
    }
  };
  
  const reset = () => {
    // Reset all game state variables and local storage data
    usedNumbers.length = 0;
    usedAnswers.length = 0;
    checkedItems.length = 0;
    localStorageUpdater.length = 0;
    answerText.length = 0;
    localStorage.clear();
  
    // Remove all children of the "answers" and "bingo-grid" elements
    const bingoAnswerDiv = document.getElementById("answers");
    bingoAnswerDiv.innerHTML = "";
    const bingoGrid = document.getElementById("bingo-grid");
    bingoGrid.innerHTML = "";
  
    // Hide the "win" element and stop particle animation
    const bingoWinDiv = document.getElementById("win");
    bingoWinDiv.style.visibility = "hidden";
    
    // Reset bingo game state variable and recreate the game board
    bingo = false;
    createGame();
  };
  
  const updateGameStatus = (object) => {
    localStorage.setItem("gameStatus", JSON.stringify(object));
  };
  
  const createGame = async () => {
    if (usedNumbers.length === 0) {
      generate();
    }
  };
  
  const updateLocalStorage = (localStorageUpdater, bingoItem, randomEmoji = '') => {
    for (let i = 0; i < localStorageUpdater.length; i++) {
      if (localStorageUpdater[i].id === bingoItem.id) {
        localStorageUpdater[i].checked.status = randomEmoji !== '';
        localStorageUpdater[i].checked.emote = randomEmoji;
      }
    }
    localStorage.setItem("cards", JSON.stringify(localStorageUpdater));
  };
  
  /*
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
          updateLocalStorage(localStorageUpdater, bingoItem)
        } else {
          checkedItems.push({ row: rowId, column: columnId });
          updateGameStatus({ rowLookup: rowLookup, winState: bingo, selectedItems: checkedItems });
          let randomEmoji = getRandomEmoji();
          checkedDIV.innerHTML = `${randomEmoji}`;
          checkedDIV.className = "checked";
          updateLocalStorage(localStorageUpdater, bingoItem, randomEmoji)
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
  */
  
  
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
  
            updateLocalStorage(localStorageUpdater, bingoItem)
          } else {
            checkedItems.push({ row: rowId, column: columnId });
            let randomEmoji = getRandomEmoji();
            checkedDIV.innerHTML = `${randomEmoji}`;
            checkedDIV.className = "checked";
            updateLocalStorage(localStorageUpdater, bingoItem, randomEmoji)
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
    // Get cards from local storage
    const cards = JSON.parse(localStorage.getItem("cards"));
  
    // Check if bingo has been achieved
    if (!bingo) {
      return;
    }
  
    // Add checked cards to answer div
    const answerText = [];
    const bingoAnswerDiv = document.getElementById("answers");
    cards.forEach(card => {
      if (card.checked.status) {
        const bingoAnswer = document.createElement("p");
        bingoAnswer.classList.add("bingo-answer-child");
        bingoAnswer.innerText = card.innerText;
        answerText.push(bingoAnswer.innerText);
        bingoAnswerDiv.appendChild(bingoAnswer);
      }
    });
  
    // Show win message and add animation
    const bingoWinDiv = document.getElementById("win");
    const winMessage = bingoWinDiv.children[0].children[0];
    winMessage.classList.add("gentle-tilt-move-shake");
    bingoWinDiv.style.visibility = "visible";
  
    // Refresh };
  }