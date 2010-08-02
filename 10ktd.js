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

/*

type = {
  code : 1,
  speed : 500,
  initialHP : 50
};

*/

function Enemy (type, level) {
  var self = this;
  self.type = type;
  self.hp = type.initialHP;
  self.div = $('<div class="e' + type.code + ' l' + level + '">');
}

Enemy.prototype = {
  hitFor : function (amount) {
    var self = this;
    self.hp = self.hp - amount;
    if(self.hp < 1) self.die();
  },
  
  moveTo : function (x, y) {
    this.div.animate({
      top : y + 'px',
      left : x + 'px'
    }, this.type.speed);
  },
  
  die : function () {
    var self = this;
    self.div.animate({
      width : '0px',
      height : '0px'
    }, 200, function() {
      self.div.remove();
      delete self;
    });
  }
}

/*

type = {
  code : 1,
  projectileSpeed: 800
}

*/

function Unit (type, location) {
  var self = this;
  self.type = type;
  self.location = location;
  self.div = $('<div class="u' + type.code + '">');
  
  self.div.css({
    top : location.y + 'px',
    left : location.x + 'px'
  });
}

Unit.prototype = {
  fireAt : function (x, y) {
    var self = this;
    var projectile = $('<div class="w' + self.type.code + '">');
    
    projectile.css({
      top : self.location.y + 'px',
      left : self.location.x + 'px'
    });
    
    projectile.animate({
      top : y + 'px',
      left : x + 'px'
    }, self.type.projectileSpeed);
  }
}
