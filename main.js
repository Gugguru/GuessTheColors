let game = new Game()
game.canvas.onmousemove = function(e) { game.mouseMoved(e) }
game.canvas.onmousedown = function(e) { game.mouseClicked(e) }