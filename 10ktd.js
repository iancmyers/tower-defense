(function (undefined) {
  
  var gridSize = 50,
      life,
      money,
      level,
      loopTimeout,
      timeOfLastLoop,

      b = $('#b'),
      bSize = b.width(),
      rowsAndCols = bSize/gridSize,
      numLocations = rowsAndCols*rowsAndCols,
      slots=new Array(numLocations),
      slot=undefined,
      i=0,
      toggleHover = function () {$(this).toggleClass('h')},
    
      levels = [
      
      ];

  Game = {
    start: function () {
      life=20;
      money=200;
      level=0;
      timeOfLastLoop=+new Date(),
      i=0;
    
      b.empty();
      while (i++<numLocations) {
        var cl = '',
            s = $('<div id="'+i+'">')
                  .height(gridSize-1)
                  .width(gridSize-1)
                  .click(function () {
                    Game.click({t:$(this).data('uw')?'uw-slot':'slot',i:this.id});
                  });
      
        i>40&&i<51 ? s.addClass('no').data('uw',true) : s.hover(toggleHover,toggleHover);
        b.append(s);
      }
    
      (function queueNextLevel() {
        setTimeout(function () {
          level++;
          unleashMob();
          queueNextLevel();
        }, 15000);
      }());
    },
  
    click: function (event) {
      console.log(event);
      if (event.t=='slot') {
        slot = slots[event.i];
      }
    }
  }

  Game.start();

  function unleashMob() {
    
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

}());