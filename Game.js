class Game {
    constructor() {
        this.canvas = document.getElementById("myCanvas");
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.lineWidth = 2;
        this.bgHue = 270;
        this.mainGrid = new Grid(4, 8, 50, this.ctx, this.canvas.width / 3, this.canvas.height / 4);
        this.colorPickerGrid = new Grid(3, 2, 50, this.ctx, this.mainGrid.rightEdge() + 100, this.mainGrid.bottomEdge() - 2 * 50);
        this.randomizeColors()
        // this.colors = ["#604541", "#c76c21", "#835e52", "#9c6c35", "#59f0bb", "#956222"];
        this.colorPickerGrid.cells = this.colors;
        this.selectedColor = 0;
        this.solution = this.generateSolution();
        this.results = Array(this.mainGrid.rows).fill([0, 0])
        this.currentRow = this.mainGrid.rows - 1; // Start at the bottom
        this.lost = false;
        this.won = false;
        this.correctGrid = new Grid(this.mainGrid.cols, 1, this.mainGrid.boxSize, this.ctx, this.mainGrid.x, this.mainGrid.y - this.mainGrid.boxSize * 1.5)
        this.correctGrid.cells = this.solution;
        this.gameGrids = Grid.grids.slice()

        this.screen = "menu"
        this.playButton = new Grid(4, 1, 50, this.ctx, this.centralize(50, 50)[0] - 4 * 50 / 2, this.centralize(50, 50, )[1])


        this.mouseX = -1;
        this.mouseY = -1;




        document.body.appendChild(this.canvas);
        this.interval = setInterval(this.updateEverything.bind(this), 1000 / 60);
    }

    mouseMoved(e) {
        /** Keep track of mouse position */
        let rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }

    mouseClicked(e) {
        if (this.screen == "game") {
            if (!this.gameOver()) {
                let [row, col] = this.mainGrid.getCell(this.mouseX, this.mouseY)
                if (row == this.currentRow) {
                    this.mainGrid.addColor(row, col, this.colorPickerGrid.cells[this.selectedColor])
                }
                this.getColor(this.mouseX, this.mouseY);
                if (this.mainGrid.rowIsFull(this.currentRow)) {
                    this.rowComplete()
                }
            } else {
                this.restart()
            }
        } else if (this.screen == "menu") {
            if (this.playButton.getCell(this.mouseX, this.mouseY)[0] >= 0) { this.play() }
        }
    }

    keyPressed(e) {
        if (!this.gameOver()) {
            let num = parseInt(e.key);
            if ((num <= this.mainGrid.cols) && num > 0) {
                this.mainGrid.addColor(this.currentRow, num - 1, this.colorPickerGrid.cells[this.selectedColor])
            }
            if (this.mainGrid.rowIsFull(this.currentRow)) {
                this.rowComplete()
            }
            this.getColorDir(e.key)
        }
        if (e.key == "r") { this.restart() }
    }

    gameOver() { return this.won || this.lost }

    restart() {
        this.lost = false;
        this.won = false;
        this.currentRow = this.mainGrid.rows - 1;
        this.mainGrid.clearGrid();
        this.results.fill([0, 0])
        this.randomizeColors()
        this.solution = this.generateSolution();
        this.correctGrid.cells = this.solution
        this.colorPickerGrid.cells = this.colors;
        this.selectedColor = 0;
    }

    play() {
        this.screen = "game"
        this.restart()
    }

    randomizeColors() {
        let hu = Math.round(Math.random() * 360)
        this.colors = Array(this.colorPickerGrid.size()).fill(0).map((x, i) => "hsl(" + (hu + i * 360 / this.colorPickerGrid.size() + 1) + ",100%,50%)")
        // this.colors = Array(this.colorPickerGrid.size()).fill(0).map(x => this.getRandomColor())
    }

    generateSolution() {
        return Array(this.mainGrid.cols).fill(0).map(x => this.colors[Math.floor(Math.random() * this.colors.length)])
    }

    getRandomColor() {
        let c = ""
        while (c.length < 6) {
            c += Math.round(Math.random() * 255).toString(16)
        }
        return "#" + c.substring(0, 6)
    }

    giveFeedback(guess) {
        let pos = [];
        let colors = 0;
        let solution = this.solution.slice()
        // First check positions
        for (let i = 0; i < solution.length; i++) {
            if (guess[i] == solution[i]) {
                pos.push(i);
            }
        }
        // Remove correct ones from guess and solution
        for (let i = pos.length - 1; i >= 0; i--) {
            guess.splice(pos[i], 1)
            solution.splice(pos[i], 1)
        }
        // Check colors
        for (let i = 0; i < guess.length; i++) {
            if (solution.includes(guess[i])) {
                solution.splice(solution.findIndex(x => x == guess[i]), 1)
                colors += 1;
            }
        }
        return [pos.length, colors]
    }

    getColor(x, y) {
        let [row, col] = this.colorPickerGrid.getCell(x, y);
        if (row >= 0 && col >= 0) {
            this.selectedColor = this.colorPickerGrid.coordToIdx(row, col);
        }
    }

    getColorDir(dir) {
        switch (dir) {
            case "ArrowUp":
                if (this.selectedColor - this.colorPickerGrid.cols >= 0) {
                    this.selectedColor = this.selectedColor - this.colorPickerGrid.cols
                }
                break;
            case "ArrowDown":
                if (this.selectedColor + this.colorPickerGrid.cols < this.colors.length) {
                    this.selectedColor = this.selectedColor + this.colorPickerGrid.cols
                }
                break;
            case "ArrowLeft":
                if (this.selectedColor - 1 >= 0) {
                    this.selectedColor = this.selectedColor - 1
                }
                break;
            case "ArrowRight":
                if (this.selectedColor + 1 < this.colors.length) {
                    this.selectedColor = this.selectedColor + 1
                }
                break;

        }
    }

    rowComplete() {
        let row = this.mainGrid.getRow(this.currentRow);
        let feedback = this.giveFeedback(row);
        this.results[this.currentRow] = feedback;
        if (feedback[0] == this.mainGrid.cols) this.won = true
        if (!this.won) {
            if (this.currentRow > 0) {
                this.currentRow -= 1
            } else {
                this.lost = true;
            }
        }
    }

    centralize(w, h) {
        return [(this.canvas.width / 2) - (w / 2), (this.canvas.height / 2) - (h / 2)];
    }

    drawResults() {
        this.ctx.font = "30px Arial"
        this.ctx.fillStyle = "black"
        this.ctx.fillText("Guess the colors!", 10, 50)
        this.ctx.font = "20px Arial"
        this.ctx.fillStyle = "black"
        let gap = 10
        this.ctx.fillText("Pos    Color", this.mainGrid.x - 100, this.mainGrid.y, 100)
        for (let i = 0; i < this.results.length; i++) {
            let [x, y] = this.mainGrid.getCellCenter(i, 0)
            this.ctx.font = "30px Arial"
            this.ctx.fillText(this.results[i][0] + "      " + this.results[i][1], x - 120, y + 10)
        }
        if (this.won) {
            // let [x, y] = this.mainGrid.getCellCenter(0, this.mainGrid.cols / 2)
            this.ctx.fillText("Hooray! You won! Click to restart!", this.correctGrid.x, this.correctGrid.y - gap)

        } else if (this.lost) {

            // let [x, y] = this.mainGrid.getCellCenter(0, this.mainGrid.cols / 2)
            this.ctx.fillText("Too bad! You lost! Click to restart!", this.correctGrid.x, this.correctGrid.y - gap - 20)
            this.ctx.fillText("Correct solution was:", this.correctGrid.x, this.correctGrid.y - gap)
        }

    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    cycleBackground(speed) {
        this.bgHue += speed;
        this.bghue %= 360;
        this.canvas.style = "background-color:hsl(" + this.bgHue + ", 100%, 50%)"
    }

    highlightSelectedColor() {
        let [row, col] = this.colorPickerGrid.idxToCoord(this.selectedColor)
        this.colorPickerGrid.highlightCell(row, col)
    }

    highlightCurrentRow() {
        this.mainGrid.highlightRow(this.currentRow)
    }


    updateEverything() {
        // Clear screen
        this.clear();
        this.cycleBackground(0)
        if (this.screen == "game") {
            // Update grids
            this.gameGrids.forEach(g => {
                g.update()
            });
            this.highlightSelectedColor()
            this.highlightCurrentRow()
            this.drawResults()
            if (!this.gameOver()) {
                this.correctGrid.hide()
            }
        } else if (this.screen == "menu") {
            this.ctx.font = "30px Arial"
            this.ctx.fillStyle = "black"
            this.ctx.fillText("PLAY!", (this.playButton.x + this.playButton.rightEdge()) / 2 - 50, this.playButton.bottomEdge() - 30 / 2)
            if (this.playButton.contains(this.mouseX, this.mouseY)) {
                this.playButton.highlightRow(0)
            }
        }
        // this.playButton.hide()
    }
}