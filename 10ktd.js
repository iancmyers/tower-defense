/*

type = {
  code : 1,
  speed : 500
};

*/

function Enemy (type, level, initialHP) {
  var self = this;
  self.type = type;
  self.hp = initialHP;
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
    });
  },
  
  die : function () {
    
  }
}