class Game {
    constructor(words, reset, popUp, keyStates) {
        this.words = words
        this.randomMainWord()
        this.mainWord = "TRACE".split("");
        this.finishState = 0;
        this.cursor = [0, 0]
        this.board = Array(6).fill(0).map(b => Array(5).fill(0).map(a => new Tile()));
        this.colours = {
            0: "rgb(63, 63, 63)",
            1: "#616161ff",
            2: "#89ff35ff",
            3: "#23c530ff"
        }
        this.keyColours = {
            0: "#616161ff",
            1: "rgb(63, 63, 63)",
            2: "#89ff35ff",
            3: "#23c530ff"
        }
        this.winMessages = ["Nice job", "Well done", "Excellent", "Splendid", "Marvellous", ":)"];
        this.keyStates = keyStates;
        this.popUp = popUp;
        this.resetButton = reset;
    }
    countLetters(word) {
        let letterCount = {};
        for (let a of word) {
            if (a in letterCount) {
                letterCount[a]++;
            }
            else {
                letterCount[a] = 1;
            }
        }
        return letterCount
    }
    newBoard() {
        this.finishState = 0;
        if (this.resetButton) this.resetButton.classList.remove("rainbow");
        for (let row of this.board) {
            for (let tile of row) {
                tile.content = "";
                tile.state = 0;
                this.updateTile(tile);
                tile.element.classList.remove("flip");
                tile.element.classList.remove("bounce");
            }
        }
        for (let i in this.keyStates) {
            let key = this.keyStates[i]
            key[0] = 0;
            key[1].style.backgroundColor = this.keyColours[key[0]];
        }
        this.cursor = [0, 0]
    }
    readSave(words) { // MAIN,word 1-5,,
        this.newBoard();
        this.mainWord = words[0].split('');
        this.finishState = 2;
        for (let i = 0; i < this.board.length; i++) {
            if (!words[i + 1]) {
                this.finishState = 0;
                break;
            }
            for (let j = 0; j < this.board[0].length; j++)
                this.board[i][j].content = words[i + 1][j];
            this.processRow(i);
            for (let j = 0; j < this.board[0].length; j++) {
                let tile = this.board[i][j];
                this.updateTile(tile);
                tile.element.classList.add("flip");
                let key = this.keyStates[tile.content];
                if (key[0] < tile.state) key[0] = tile.state;
                key[1].style.backgroundColor = this.keyColours[key[0]];
            }
            if (words[0] === words[i + 1]) {
                this.resetButton.classList.add("rainbow");
                this.finishState = 1;
                break;
            }
            this.cursor[0]++;
        }
    }
    save() {
        let list = this.board.map(a => a.map(b => b.content).join('')).join(',');
        localStorage.setItem("word_list", this.mainWord.join('') + ',' + list);
    }
    randomMainWord() {
        this.mainWord = this.words[Math.floor(Math.random() * this.words.length)].toUpperCase().split("")
    }
    changeMainWord(word) {
        this.mainWord = word.split("");
    }
    _type(word) {
        for (let w of word.split("")) {
            this.addLetter(w);
        }
    }
    addLetter(letter) {
        if (this.finishState !== 0) return false;
        let [row, col] = this.cursor, tile = this.board[row][col];
        if (col > this.board[0].length - 1) return false;
        tile.content = letter;
        tile.element.classList.add("bulge");
        this.updateTile(tile);
        this.cursor[1]++;
    }
    updateTile(tile) {
        tile.element.innerText = tile.content;
        tile.element.style.backgroundColor = this.colours[tile.state];
    }
    backspace() {
        if (this.finishState !== 0) return false;
        let [row, col] = this.cursor;
        if (col < 1) return false;
        col = --this.cursor[1];
        let tile = this.board[row][col];
        tile.content = "";
        tile.element.classList.remove("bulge");
        this.updateTile(tile)
    }
    isGuessed() {
        return this.board[this.cursor[0]].every(tile => tile.state === 3);
    }
    processRow(row) {
        let repetition = this.countLetters(this.mainWord), letterBox = {};
        this.board[row].forEach((tile, i) => {
            tile.changeState(1);
            let a = tile.content;
            this.mainWord.forEach((b, j) => {
                if (a == b) {
                    if (i == j) {
                        tile.changeState(3);
                    }
                    else if (tile.state !== 3) {
                        tile.changeState(2);
                    }
                }
            })
            if (tile.state === 2) {
                if (a in letterBox) {
                    letterBox[a].push(i)
                }
                else {
                    letterBox[a] = [i];
                }
            }
            if (repetition[a] > 0) {
                repetition[a]--;
            }
            else if (a in letterBox && letterBox[a].length > 0) {
                let index = letterBox[a].pop();
                this.board[this.cursor[0]][index].changeState(1);
            }
        })
    }
    enter() {
        if (this.finishState !== 0) return false;
        let entered = this.board[this.cursor[0]].map(a => a.content).join('').trim();
        if (entered.length < this.board[this.cursor[0]].length) {
            this.popUp("Word is too short.");
            return false;
        }
        else if (!this.words.includes(entered.toLowerCase())) {
            this.popUp("Not in the word list.");
            return false;
        }
        this.processRow(this.cursor[0]);
        let green = this.isGuessed();
        this.board[this.cursor[0]].forEach((tile, i) => {
            setTimeout(() => {
                this.updateTile(tile);
                tile.offsetHeight;
                if (green) tile.element.classList.add("bounce");
                else tile.element.classList.add("flip");
            }, 200 * i);
            let key = this.keyStates[tile.content];
            if (key[0] < tile.state) key[0] = tile.state;
            setTimeout(() => key[1].style.backgroundColor = this.keyColours[key[0]], 1500);
        });
        if (green) {
            this.finishState = 1;
            if (this.resetButton) setTimeout(() => this.resetButton.classList.add("rainbow"), 1500);
            setTimeout(() => this.popUp(this.winMessages[Math.floor(Math.random() * this.winMessages.length)]), 1500)
        }
        else {
            this.cursor[0]++;
            this.cursor[1] = 0;
            if (this.cursor[0] > this.board.length - 1) {
                this.finishState = -1;
                if (this.resetButton) setTimeout(() => this.resetButton.classList.add("rainbow"), 1500);
                setTimeout(() => this.popUp(this.mainWord.join("")), 1500)
            }
        }
        this.save();
    }
}

class Tile {
    constructor(letter = "") {
        // 0: no input 1: grey 2: yellow 3: green
        this.state = 0;
        this.content = letter;
        this.element = document.createElement("div")
        this.element.classList.add("tile");
        this.element.innerText = ""
    }
    changeState(n) {
        this.state = n;
    }
}

function isLetter(c) {
    return c.toLowerCase() !== c.toUpperCase();
}
fetch("words.txt")
    .then((res) => res.text())
    .then((text) => {
        const UI = document.getElementById("board");
        const keyboard = document.getElementById("keyboard");
        const reset = document.getElementById("reset");
        const popUp = document.getElementById("popup");
        const words = text.split("\n");

        function displayPopUp(text = "") {
            popUp.innerText = text;
            popUp.classList.remove("faded")
            popUp.offsetHeight;
            popUp.classList.add("faded")
        }

        let keyStates = {};

        const game = new Game(words, reset, displayPopUp, keyStates);

        for (let layout of ['QWERTYUIOP', 'ASDFGHJKL', '#ZXCVBNM-']) {
            let keyrow = document.createElement("div");
            keyrow.className = "keyrow";
            for (let c of layout) {
                keytile = document.createElement('div');
                keytile.className = "keytile";
                if (c == "#") {
                    c = "Enter";
                    keytile.style.width = "30pt";
                    keytile.addEventListener("click", () => game.enter());
                }
                else if (c == '-') {
                    keytile.addEventListener("click", () => game.backspace());
                    keytile.style.width = "20pt";
                    keytile.style.fontSize = "15pt";
                    fetch('backspace.svg')
                        .then(r => r.text())
                        .then(text => {
                            keytile.innerHTML = text;
                        })
                        .catch(console.error.bind(console));
                }
                else {
                    keytile.addEventListener("click", () => game.addLetter(c));
                }
                keytile.innerText = c;
                keyrow.appendChild(keytile);
                keyStates[c] = [0, keytile];
            }
            keyboard.appendChild(keyrow);
        }

        for (let row of game.board) {
            let rowElement = document.createElement("div");
            rowElement.className = "tilerow"
            for (let tile of row) {
                rowElement.appendChild(tile.element);
            }
            UI.appendChild(rowElement);
        }
        if (typeof screen.orientation !== 'undefined') addEventListener('keyup', e => {
            if (e.key === "Enter") {
                game.enter()
            }
            else if (e.key === "Backspace") {
                game.backspace()
            }
            else if (e.key.length === 1 && isLetter(e.key)) {
                game.addLetter(e.key.toUpperCase())
            }
        })

        reset.addEventListener("click", e => {
            game.newBoard();
            game.randomMainWord()
        })

        let save = localStorage.getItem('word_list');
        if (save) game.readSave(save.split(','));
    })
    .catch((e) => console.error(e));