class Grid {
    constructor(cols, rows, boxSize, ctx, x = 0, y = 0) {
        /** Creates a new grid at (x, y) */
        this.rows = rows;
        this.cols = cols;
        this.boxSize = boxSize;
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.noColor = "rgba(0,0,0,0)"
        this.cells = Array(rows * cols) // Indexing goes left -> right, top -> bot
        this.clearGrid()
        this.highlightColor = "cyan"
        this.edgeWidth = 2

        Grid.grids = (Grid.grids || []).concat(this)
    }

    size() {
        return this.cols * this.rows
    }

    coordToIdx(row, col) {
        return (row * this.cols + col)
    }

    idxToCoord(idx) {
        return [Math.floor(idx / this.cols), idx % this.cols]
    }

    getCellCorner(row, col) {
        /** Returns the top left corner of the specified cell */
        if ((col < 0) || (col >= this.cols) || (row < 0) || (row >= this.rows)) throw new Error("Index out of range")
        let x = col * this.boxSize + this.x
        let y = row * this.boxSize + this.y
        return [x, y]
    }

    getCellCenter(row, col) {
        /** Returns the coordinates for the cell (row, col), starting at (0, 0) */
        if ((col < 0) || (col >= this.cols) || (row < 0) || (row >= this.rows)) throw new Error("Index out of range")
        let x = col * this.boxSize + this.boxSize / 2 + this.x
        let y = row * this.boxSize + this.boxSize / 2 + this.y
        return [x, y]
    }

    getCell(x, y) {
        /** Returns the cell indices that the coordinates are on or (-1, -1) if it's not on anything */
        let col = Math.floor((x - this.x) / this.boxSize)
        let row = Math.floor((y - this.y) / this.boxSize)
        if ((col < 0) || (col >= this.cols) || (row < 0) || (row >= this.rows)) {
            return [-1, -1]
        } else {
            return [row, col]
        }
    }

    highlightCell(row, col) {
        /** Highlights the specified cell */
        if ((col < 0) || (col >= this.cols) || (row < 0) || (row >= this.rows)) throw new Error("Index out of range")
        let [x, y] = this.getCellCorner(row, col);
        this.ctx.beginPath();
        this.ctx.rect(x, y, this.boxSize, this.boxSize);
        this.ctx.strokeStyle = this.highlightColor;
        this.ctx.lineWidth = 5;
        this.ctx.stroke();
    }

    highlightCellCoord(x, y) {
        /** Highlights the cell at the specified location */
        var [row, col] = this.getCell(x, y);
        if (col >= 0 && row >= 0) {
            this.highlightCell(row, col);
        }
    }

    highlightRow(row) {
        /** Highlight the given row */
        let [x, y] = this.getCellCorner(row, 0);
        this.ctx.beginPath();
        this.ctx.rect(x, y, this.boxSize * this.cols, this.boxSize);
        this.ctx.strokeStyle = this.highlightColor;
        this.ctx.lineWidth = 5;
        this.ctx.stroke();
    }

    addColor(row, col, c) {
        /** Adds a circle of a given color to the cell */
        if (row >= 0 && row >= 0) {
            this.cells[row * this.cols + col] = c
        }
    }

    clearGrid() {
        this.cells.fill(this.noColor)
    }

    getRow(row) {
        let rowStart = this.coordToIdx(row, 0)
        return this.cells.slice(rowStart, rowStart + this.cols)
    }

    rowIsFull(row) {
        let r = this.getRow(row)
        return !(r.some(x => x == this.noColor))
    }

    removeColor(x, y) {
        /** Removes the color from the cell in the given position */
        this.addColor(x, y, this.noColor)
    }

    contains(x, y) {
        return ((x > this.x) && (x < this.rightEdge()) && 
                (y > this.y) && (y < this.bottomEdge()))
    }

    rightEdge() {
        return this.x + this.cols * this.boxSize 
    }

    bottomEdge() {
        return this.y + this.rows * this.boxSize
    }

    drawCellColors() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let currentColor = this.cells[row * this.cols + col];
                let [x, y] = this.getCellCenter(row, col);
                this.ctx.fillStyle = currentColor;
                this.ctx.beginPath()
                this.ctx.arc(x, y, this.boxSize / 2 - 2, 0, 2 * Math.PI);
                this.ctx.fill()
                // console.log(currentColor)
            }
        }
    }

    hide() {
        this.ctx.clearRect(this.x - this.edgeWidth, this.y - this.edgeWidth,
            this.cols * this.boxSize + this.edgeWidth * 2, this.rows * this.boxSize + this.edgeWidth * 2)
    }


    show() {
        /** Draws this grid to the canvas context given as input */
        // Cols
        this.ctx.strokeStyle = "black"
        this.ctx.lineWidth = this.edgeWidth
        for (let i = 0; i <= this.cols; i++) {
            this.ctx.beginPath()
            this.ctx.moveTo(this.x + i * this.boxSize, this.y)
            this.ctx.lineTo(this.x + i * this.boxSize, this.y + this.boxSize * this.rows)
            this.ctx.stroke()
        }
        // Rows
        for (let i = 0; i <= this.rows; i++) {
            this.ctx.beginPath()
            this.ctx.moveTo(this.x, this.y + i * this.boxSize)
            this.ctx.lineTo(this.x + this.boxSize * this.cols, this.y + i * this.boxSize)
            this.ctx.stroke()
        }
        this.drawCellColors()
    }

    update() {
        /** Called 60 times a second */
        this.show()
    }
}