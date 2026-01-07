class Game {
    constructor(words) {
        this.words = words
        this.randomMainWord()
        this.isDone = false;
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
        this.keyStates = {}
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
        for (let row of this.board) {
            for (let tile of row) {
                tile.content = "";
                tile.state = 0;
                this.updateTile(tile);
            }
        }
        for(let i in this.keyStates){
            let key = this.keyStates[i]
            key[0] = 0;
            key[1].style.backgroundColor = this.keyColours[key[0]];
        }
        this.cursor = [0, 0]
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
        let [row, col] = this.cursor;
        if (col > this.board[0].length - 1) return false;
        this.board[row][col].content = letter;
        this.updateTile(this.board[row][col]);
        this.cursor[1]++;
    }
    updateTile(tile) {
        tile.element.innerText = tile.content;
        tile.element.style.backgroundColor = this.colours[tile.state];
    }
    backspace() {
        let [row, col] = this.cursor;
        if (col < 1) return false;
        this.board[row][col - 1].content = ""
        this.cursor[1]--;
        this.updateTile(this.board[row][col - 1])
    }
    enter() {
        let entered = this.board[this.cursor[0]].map(a=>a.content).join('').trim();
        if(entered.length < this.board[this.cursor[0]].length){
            alert("Word is too short.");
            return false;
        }
        else if(!this.words.includes(entered.toLowerCase())){
            alert("Not in the word list.");
            return false;
        }
        let repetition = this.countLetters(this.mainWord), letterBox = {};
        this.board[this.cursor[0]].forEach((tile, i) => {
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
        this.board[this.cursor[0]].forEach((tile, i) => {
            this.updateTile(tile);
            let key = this.keyStates[tile.content]
            key[0] = tile.state;
            key[1].style.backgroundColor = this.keyColours[key[0]];
        });
        this.cursor[0]++;
        this.cursor[1] = 0;
        if (this.cursor[0] > this.board.length - 1) {
            this.isDone = true
        }
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
        const words = text.split("\n")
        const game = new Game(words);

        for (let row of game.board) {
            let rowElement = document.createElement("div");
            rowElement.className = "tilerow"
            for (let tile of row) {
                rowElement.appendChild(tile.element);
            }
            UI.appendChild(rowElement);
        }
        addEventListener('keyup', e => {
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
        for (let layout of ['QWERTYUIOP', 'ASDFGHJKL', '#ZXCVBNM-']) {
            let keyrow = document.createElement("div");
            keyrow.className = "keyrow";
            for (let c of layout) {
                keytile = document.createElement('div');
                keytile.className = "keytile";
                if (c == "#") {
                    c = "Enter";
                    keytile.addEventListener("click", () => game.enter());
                }
                else if (c == '-') {
                    keytile.addEventListener("click", () => game.backspace());
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
                game.keyStates[c] = [0, keytile];
            }
            keyboard.appendChild(keyrow);
        }
    })
    .catch((e) => console.error(e));