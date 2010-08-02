gridSize = 50;
$(function ($, undefined) {
  var b = $('#b'),
      bSize = b.width(),
      rowsAndCols = bSize/gridSize,
      numLocations = rowsAndCols*rowsAndCols,
      i=0,
      toggleHover = function () {$(this).toggleClass('h')};
  
  while (i++<numLocations) {
    b.append($('<div>').height(gridSize-1).width(gridSize-1).hover(toggleHover,toggleHover));
  }
});

life;
money;
level;
loopTimeout;
timeOfLastLoop;

Game = {
  start: function () {
    life=20;
    money=200;
    level=0;
    timeOfLastLoop=+new Date();
    
    (function nextLevel() {
      setTimeout(function () {
        level++;
        
        
        
        nextLevel();
      }, 15000);
    }());
  }
}
