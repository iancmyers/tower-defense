(function (window, undefined) {
  
  var gridSize = 50,
      KEY_SLOTS = [
        {x:0, y:7, r:90},
        {x:3, y:7, r:0},
        {x:3, y:5, r:90},
        {x:8, y:5, r:180},
        {x:8, y:9, r:90},
        {x:14, y:9, r:0},
        {x:14, y:6, r:-90},
        {x:11, y:6, r:0},
        {x:11, y:2, r:90},
        {x:17, y:2, r:180},
        {x:17, y:7, r:90},
        {x:20, y:7, r:90}
      ],
      life,
      money,
      level,
      loopTimeout,
      timeOfLastLoop,
      math = Math,
      rand = math.random,
      floor = math.floor,
      max = math.max,
      abs = math.abs,
      setTimeout = window.setTimeout,
      setInterval = window.setInterval,
      clearInterval = window.clearInterval,
      clearTimeout = window.clearTimeout,

      b = $('#b'),
      bSize = b.width(),
      rowsAndCols = bSize/gridSize,
      numLocations = 21*13,
      slots=new Array(numLocations),
      slot=undefined,
      i=0,
      pathArray=[147,148,149,150,129,108,109,110,111,112,113,134,155,176,197,198,199,200,201,202,203,182,161,140,139,138,137,116,95,74,53,54,55,56,57,58,59,80,101,122,143,164,165,166,167];
      toggleHover = function () {$(this).toggleClass('h')},
      
      units = [
        {
          rate: 200,
          range: 2,
          damage: 5
        }
      ],
      
      enemies = [
        {
          s:500,
          hp:50000
        },
        
        {
          s:250,
          hp:150
        }
      ],
      
      levels = [
      
      ],

    Game = {
      start: function () {
        life=20;
        money=200;
        level=0;
        timeOfLastLoop=+new Date(),
        i=-1;
    
        b.empty();
        while (i++<numLocations-1) {
          var cl = '',
              s = $('<div id="'+i+'">')
                    .css({
                      height:gridSize,
                      width:gridSize,
                      top:gridSize*floor(i/21),
                      left:gridSize*(i%21)
                    })
                    .click(function () {
                      Game.click({t:$(this).data('uw')?'uw-slot':'slot',i:this.id, el:$(this)});
                    });
          pathArray.indexOf(i)<0 ? s.hover(toggleHover,toggleHover) : s.addClass('no').data('uw',true).append('<em>');
          b.append(s);
        }
    
        (function queueNextLevel() {
          //setTimeout(function () {
            level++;
            unleashMob();
          //  queueNextLevel();
          //}, 15000);
        }());
      },
  
      click: function (event) {
        if (event.t=='slot') {
          slot = slots[event.i];
          if (!slot) {
            var el = event.el;
            slots[event.i] = Unit(0, el, Board.p2s(el.css('left'), el.css('top')));
          }
        }
      }
    },

    unleashMob = function () {
      i=100;
      (function loop() {
        if (i--) {
          Enemy(0, 1, 1);
          setTimeout(loop, 300);
        }
      }());
    },
    count = 0,
    Board = {
      /* pixels to spot: contverts from pixels to grid location */
      p2s: function (x,y) {
        return {x:floor(parseInt(x)/gridSize), y:floor(parseInt(y)/gridSize)};
      },
      
      // slotToMiddleXPoint
      s2mp: function (s) {
        var p = Board.s2p(s);
        return {x:p.x+(gridSize/2), y:p.y+(gridSize/2)};
      },
    
      /* opposite of above */
      s2p: function (s) {
        return {x:s.x*gridSize, y:s.y*gridSize};
      },
    
      /* distance in grid between two spots */
      diff: function (s1, s2) {
        return max(
                 floor(abs(s1.x - s2.x)),
                 floor(abs(s1.y - s2.y))
               );
      },
      
      /* finds the angle between two spots */
      uangle: function(s1, s2) {        
        var angle = Math.atan((s2.y - s1.y) / (s2.x - s1.x)) * (180 / Math.PI);
        if(s1.y < s2.y){
          angle += 180;
        }
        if(count < 100) {
          console.log((s1.y - s2.y) / (s1.x - s2.x),angle < 1 ? angle + 360 : angle);
        }
        count++;
        return angle; //< 1 ? angle + 360 : angle;
      }
    };
  
  Game.start();

  /*

  type = {
    code : 1,
    speed : 500,
    initialHP : 50
  };

  */
  
  
  function Enemy(type, hpMultiplier, level) {
    var locationMark = 0,
        currentKeySlot = KEY_SLOTS[locationMark++],
        currentKeyPoint = Board.s2mp(currentKeySlot),
        offset = rand()*15,
        el = $('<b>').addClass('e' + type + ' l' + level).css({left:currentKeyPoint.x-50-12+'px',top:currentKeyPoint.y-9+'px'}),
        e = enemies[type],
        properties = {s: e.s, hp:e.hp*hpMultiplier},
        
        interval = setInterval(function () {
          slots.forEach(function (slot) {
            var top = el.css('top'), left = el.css('left');
            if (slot) {
              slot.eLoc(self, Board.p2s(left, top));
            }
          });
        }, 25),
        
        self = {
          nextPoint: function () {
            var nextSlot = KEY_SLOTS[locationMark++], duration;
            if (!nextSlot) {
              el.remove();
              return;
            }
            duration = Board.diff(currentKeySlot, nextSlot) * e.s;
            
            currSlot = currentKeySlot,
            currentKeySlot = nextSlot;
            currentKeyPoint = Board.s2mp(currentKeySlot);
            self.moveTo(currentKeyPoint, currSlot.r, duration);
          },
          
          moveTo: function (point, deg, duration) {
            el.css('-webkit-transform','rotate('+deg+'deg)').animate({
              top : point.y-9 + 'px',
              left : point.x-12 + 'px'
            }, duration, 'linear', function () {
              self.nextPoint();
            });
          },
          
          hitFor: function (damage) {
            properties.hp -= damage;
            if (properties.hp < 0) self.die();
          },
          
          die: function () {
            el.remove();
            clearInterval(interval);
            
            slots.forEach(function (slot) {
              if (slot) {
                slot.died(self);
              }
            });
          }
        };
    
    b.append(el);
    self.nextPoint();
    
    return self;
  }
  
  function Unit(type, slot, point) {
    var el = $('<i>').addClass('u' + type),
        currentTarget = null,
        fireInterval = null,
        self = {
          eLoc: function (enemy, enemyPoint) {
            //console.log(Board.diff(point, enemyPoint), units[type].range);
            if (!currentTarget && Board.diff(point, enemyPoint) <= units[type].range) {
              currentTarget = enemy;
              fireInterval = setInterval(function () {
                enemy.hitFor(units[type].damage);
              }, units[type].rate);
            } else if (currentTarget == enemy && Board.diff(point, enemyPoint) > units[type].range) {
              self.died(enemy);
            } else if (currentTarget == enemy) {
              self.rotate(Board.uangle(point, enemyPoint));
            }
          },
          
          died: function (enemy) {
            if (enemy == currentTarget) {
              currentTarget = null;
              clearInterval(fireInterval);
            }
          },
          
          rotate: function (angle) {
            el.css('-webkit-transform', 'rotate(' + angle + 'deg)');
          }
        };
    
    slot.append(el);
    return self;
  }

  /*
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
  */
  
  /*

  type = {
    code : 1,
    projectileSpeed: 800
  }

  */
/*
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
  */
  
}(this));