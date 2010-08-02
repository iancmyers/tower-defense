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