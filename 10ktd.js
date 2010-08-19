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
      currUnit = 0,

      b = $('#b'),
      moneyEl = $('#money b'),
      lifeEl = $('#life b'),
      bSize = b.width(),
      rowsAndCols = bSize/gridSize,
      numLocations = 21*13,
      slots=new Array(numLocations),
      slot=undefined,
      i=0,
      pathArray=[147,148,149,150,129,108,109,110,111,112,113,134,155,176,197,198,199,200,201,202,203,182,161,140,139,138,137,116,95,74,53,54,55,56,57,58,59,80,101,122,143,164,165,166,167];
      toggleOn = function () {
        if ($(this).find('i').length == 0) {
          $(this).append('<span class="u' + currUnit + '"></span>');
          $(this).toggleClass('h');
        }
      },

      toggleOff = function () {
        $(this).find('span').remove();
        $(this).toggleClass('h');
      },
      
      units = [
        {
          rate: 200,
          range: 3,
          damage: 5,
          cost: 5
        },
        {
          rate: 300,
          range: 2,
          damage: 10,
          cost: 10,
        },
        {
          rate: 250,
          range: 4,
          damage: 3,
          cost: 25
        }
      ],
      
      enemies = [
        {
          s:500,
          hp:50
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
        money=25;
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
          pathArray.indexOf(i)<0 ? s.hover(toggleOn,toggleOff) : s.addClass('no').data('uw',true).append('<em>');
          b.append(s);
        }
    
        (function queueNextLevel() {
          //setTimeout(function () {
            level++;
            unleashMob();
          //  queueNextLevel();
          //}, 15000);
        }());
        
        // Event to change the current weapon
        $('#l .lu').click(function(event) {
          currUnit = $(this).find('p')[0];
          currUnit = parseInt(currUnit.className.split('u')[1]);
          //console.log(currUnit);

          var unit = $('#l .lu')[currUnit];          
          $('#l .lu').removeClass('on').addClass('off');
          $(unit).addClass('on');
        });
      },
      
      stop: function() {
        alert('Game over, man. Game over.');
        $('#b p, #b b, #b i').remove();
      },
  
      click: function (event) {
        if (event.t=='slot') {
          slot = slots[event.i];
          if (!slot && money >= units[currUnit].cost) {
            var el = event.el;
            slots[event.i] = Unit(currUnit, el, Board.p2s(el.css('left'), el.css('top')));
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
        if(s1.x > s2.x) {
          angle += 270;
        } else {
          angle += 90;
        }
        return angle;
      }
    }
  
  Game.start();
  
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
              slot.eLoc(self, Board.p2s(left, top), {x:left, y:top});
            }
          });
        }, 25),
        
        self = {
          nextPoint: function () {
            var nextSlot = KEY_SLOTS[locationMark++], duration;
            if (!nextSlot) {
              life--;
              lifeEl.html(life);
              if (life <= 0) {
                Game.stop();
              }
              el.remove();
              clearInterval(interval);
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
            money += 0.25*hpMultiplier;
            moneyEl.html('$' + parseFloat(money).toFixed(2));
            
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
    money -= units[type].cost;
    moneyEl.html('$' + parseFloat(money).toFixed(2));
    var el = $('<i>').addClass('u' + type),
        currentTarget = null,
        fireInterval = null,
        currentEnemyPoint = null,
        currentEnemySlot = null,
        self = {
          eLoc: function (enemy, enemySlot, enemyPoint) {
            if (!currentTarget && Board.diff(point, enemySlot) <= units[type].range) {
              currentTarget = enemy;
              fireInterval = setInterval(function () {
                enemy.hitFor(units[type].damage);
                self.fire(currentEnemyPoint, currentEnemySlot);
              }, units[type].rate);
            } else if (currentTarget == enemy && Board.diff(point, enemySlot) > units[type].range) {
              self.died(enemy);
            } else if (currentTarget == enemy) {
              currentEnemyPoint = enemyPoint;
              currentEnemySlot = enemySlot;
              self.rotate(Board.uangle(point, enemySlot));
            }
          },
          
          fire: function(enemyPoint, enemySlot) {
            var projectile = $('<p class="b' + type + '">');
            var start = Board.s2mp(point);
            
            projectile
              .css({
                top: start.y - 21,
                left: start.x - 3
              }).appendTo(b)
              .animate({
                top: enemyPoint.y,
                left: enemyPoint.x
              }, (Board.diff(point, enemySlot) / 25) + 125, function() {
                projectile.remove();
              });
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
}(this));