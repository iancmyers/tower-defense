(function (window, undefined) {
  
  var gridSize = 50,
      LEVEL_WAIT = 30000,
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
      LEFT = "left",
      TOP = "top",
      MAX_DAMAGE = 200,
      MAX_RANGE = 6,
      MAX_RELOAD = 100,
      life,
      money,
      level,
      kills,
      loopTimeout,
      timeOfLastLoop,
      math = Math,
      rand = math.random,
      floor = math.floor,
      max = math.max,
      min = math.min,
      abs = math.abs,
      setTimeout = window.setTimeout,
      setInterval = window.setInterval,
      clearInterval = window.clearInterval,
      clearTimeout = window.clearTimeout,
      currUnit = 0,
      timeouts = [],
      intervals = [];
      b = $('#b'),
      moneyEl = $('#mo b'),
      lifeEl = $('#li b'),
      killEl = $('#ki b'),
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

      showOptions = function (s) {
        slot = $('#'+ s.i);
        if ($(slot).find('i').length == 1) {
          var buffer = [];
          buffer.push(
            '<p id="options">',
              '<span class="upgrade">UPGRADE<b>$25</b></span>',
              '<span class="sell">SELL<b>$20</b></span>',
              '<span class="upSellVals">',
              
              '</span>',          
            '</p>');
          
          // figure out where to append the options
          var x = parseInt($(slot).css('left').split('px')[0]),
              y = parseInt($(slot).css('top').split('px')[0]),
              halfWidth = (gridSize*21)/2,
              halfHeight = (gridSize*13)/2,
              optionWidth = gridSize*6,
              left;

          if (x < (gridSize*21)-optionWidth) {
            console.log('right edge - go left');
            left = x + gridSize;
          } else {
            console.log('left edge - go right');
            left = x - (6*gridSize);
          }
          
          $('#b').append(buffer.join(''));
          $('#options').css({'width' : '290px', 'height' : '50px', 'top' : y+'px', 'left' : left+'px'});
          
        }
      },
      
      U = function (percentage, type, level, speedMultiplier, additionalArmor, lifeMultiplier) {
        return {
          p: percentage,
          t: type,
          l: level,
          lm: lifeMultiplier || 1,
          a: additionalArmor || 0,
          sm: speedMultiplier || 1
        };
      },

      addMoney = function(diff) {
        money += diff;
        $(moneyEl).html('$' + parseFloat(money).toFixed(2));
      },
      
      subtractMoney = function(diff) {
        money -= diff;
        $(moneyEl).html('$' + parseFloat(money).toFixed(2));
      },
      
      levels=[
      
        // u  = array of untis
        // nu = number of total units in round
        // r  = rate of unit arrival
        
        {u:[U(1,0,0)], nu:20, r:500},
        {u:[U(1,1,0)], nu:12, r:850},
        {u:[U(1,2,0)], nu:7,  r:850},
        {u:[U(1,3,0)], nu:1,  r:2500},
        
        {u:[U(.25,0,0),U(1,0,1)], nu:30, r:300},
        {u:[U(.5,1,0),U(1,1,1)], nu:25, r:500},
        {u:[U(.5,2,0),U(1,2,1)], nu:12, r:1100},
        {u:[U(.5,3,0),U(1,3,1)], nu:4, r:900},
        
        {u:[U(.25,0,1),U(1,0,2)], nu:10, r:300},
        {u:[U(.75,1,1),U(1,1,2)], nu:30, r:500},
        {u:[U(.5,2,1),U(1,2,2)], nu:7, r:1100},
        {u:[U(.5,3,1),U(1,3,2)], nu:2, r:900},
        
        {u:[U(.5,0,2),U(1,0,3)], nu:15, r:300},
        {u:[U(.3,1,2),U(1,1,3)], nu:12, r:500},
        {u:[U(.1,2,2),U(1,2,3)], nu:5, r:1100},
        {u:[U(.5,3,2),U(1,3,3)], nu:3, r:900},
        
        {u:[U(1,0,3)], nu:15, r:300},
        {u:[U(1,1,3)], nu:15, r:500},
        {u:[U(1,2,3)], nu:15, r:1100},
        {u:[U(1,3,3)], nu:1, r:900}
      ],
      
      units = [
        {
          rate: 200,
          range: 3,
          damage: 5,
          cost: 5
        },
        {
          rate: 680,
          range: 2,
          damage: 25,
          cost: 10
        },
        {
          rate: 250,
          range: 4,
          damage: 15,
          cost: 20
        }
      ],
      
      enemies = [
        {
          s:500,
          hp:35,
          p:.50,
          a:0
        },
        
        {
          s:1325,
          hp:80,
          p:.75,
          a:3
        },

        {
          s:600,
          hp:140,
          p:1,
          a:1
        },

        {
          s:900,
          hp:1100,
          p:5,
          a:1
        }
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
        
        
        (function () {
          var nextLevel, levelTimer, queueNextLevel;
          
          queueNextLevel = function () {
            nextLevel = levels[level++];

            if (!nextLevel) {
              Game.stop(true);
              return; // game over once all enemies are gone
            }

            $('#n').text(LEVEL_WAIT/1000);
            levelTimer = setTimeout(startLevel, LEVEL_WAIT);
            timeouts.push(levelTimer);
          };
          queueNextLevel();
          
          var unkI = setInterval(function () {$('#n').text(parseInt($('#n').text())-1);}, 1000);
          intervals.push(unkI);
          
          $('#sk').click(function () {
            clearTimeout(levelTimer);
            startLevel()
            return false;
          });
          
          function startLevel() {
            $('#c').text(level);
            unleashMob(nextLevel);
            queueNextLevel();
          }
        }());
        
        // Event to change the current weapon on the legend
        $('#l .lu').click(function(event) {
          currUnit = $(this).find('p')[0];
          currUnit = parseInt(currUnit.className.split('u')[1]);

          var unit = $('#l .lu')[currUnit];          
          $('#l .lu').removeClass('on').addClass('off');
          $(unit).addClass('on');
          
          $('#s1 p').css('width', units[currUnit].damage/MAX_DAMAGE*100 + "%");
          $('#s2 p').css('width', units[currUnit].range/MAX_RANGE*100 + "%");
          $('#s3 p').css('width', MAX_RELOAD/units[currUnit].rate*100 + "%");
        }).end().find('.u0').parent().click();
      },
      
      stop: function(win) {
        for(var i = 0; i < timeouts.length; i++)
          clearTimeout(timeouts[i]);

        for(var i = 0; i < intervals.length; i++)
          clearInterval(intervals[i]);
        
        if(win)
          alert('A WINNER IS YOU!\nKILLS: ' + kills + '\nLIVES LOST: ' + 20-life);
        else
          alert('Game over, man. Game over.\nKILLS: ' + kills);
      },
  
      click: function (event) {
        if($('#b #options').length == 1)
          $('#b #options').remove();
        if (event.t=='slot') {
          slot = slots[event.i];
          if (!slot && money >= units[currUnit].cost) {
            var el = event.el;
            slots[event.i] = Unit(currUnit, el, Board.p2s(el.css('left'), el.css('top')));
          } else if (slot) {
            showOptions(event);
          }
        }
      }
    },

    unleashMob = function (level) {
      var i=level.nu;
      (function loop() {
        if (i--) {
          var ui, r = rand(), enemy;
          
          for (ui = 0; ui < level.u.length; ui++) {
            if (r < level.u[ui].p) {
              enemy = level.u[ui];
              break;
            }
          }
          
          if (!enemy) {
            console.error("Err");
          } else {
            Enemy(enemy.t, enemy.lm, enemy.sm, enemy.a, enemy.l);
          }
          var unleashT = setTimeout(loop, level.r);
          timeouts.push(unleashT);
        }
      }());
    },
    Board = {
      /* pixels to spot: converts from pixels to grid location */
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
  
  function Enemy(type, hpMultiplier, speedMultiplier, additionalArmor, level) {
    additionalArmor += level*2;
    hpMultiplier += level;
    var locationMark = 0,
        keepGoing = true,
        currentKeySlot = KEY_SLOTS[locationMark++],
        currentKeyPoint = Board.s2mp(currentKeySlot),
        offset = rand()*15,
        el = $('<b>').addClass('e' + type + ' l' + (level || "0")).css({left:currentKeyPoint.x-50-12+'px',top:currentKeyPoint.y-9+'px'}),
        e = enemies[type],
        properties = {p:e.p, s: e.s*speedMultiplier, hp:e.hp*hpMultiplier, a:e.a+additionalArmor},
        
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
            if (!life || !keepGoing) return;
            
            var nextSlot = KEY_SLOTS[locationMark++], duration;
            if (!nextSlot) {
              life--;
              lifeEl.html(life);
              if (life <= 0) {
                Game.stop(false);
              }
              el.remove();
              clearInterval(interval);
              return;
            }
            duration = Board.diff(currentKeySlot, nextSlot) * properties.s;
            
            currSlot = currentKeySlot,
            currentKeySlot = nextSlot;
            currentKeyPoint = Board.s2mp(currentKeySlot);
            self.moveTo(currentKeyPoint, currSlot.r, duration);
          },
          
          moveTo: function (point, deg, duration) {
            el.css({
              '-webkit-transform':'rotate('+deg+'deg)',
              '-moz-transform':'rotate('+deg+'deg)'
            }).animate({
              top : point.y-9 + 'px',
              left : point.x-12 + 'px'
            }, duration, 'linear', function () {
              self.nextPoint();
            });
          },
          
          hitFor: function (damage) {
            properties.hp -= max(1, damage-properties.a);
            if (properties.hp < 0) self.die();
          },
          
          die: function () {
            el.remove();
            keepGoing = false;
            clearInterval(interval);
            addMoney(properties.p*hpMultiplier);
            kills = parseInt($(killEl).html());
            killEl.html(kills+1);
            
            slots.forEach(function (slot) {
              if (slot) {
                slot.died(self);
              }
            });
          }
          
        };
        intervals.push(interval);
    
    b.append(el);
    self.nextPoint();
    
    return self;
  }
  
  function Unit(type, slot, point) {
    subtractMoney(units[type].cost);
    var el = $('<i>').addClass('u' + type),
        currentTarget = null,
        fireInterval = null,
        currentEnemyPoint = null,
        currentEnemySlot = null,
        currentLevel = 0,
        self = {
          eLoc: function (enemy, enemySlot, enemyPoint) {
            if (!currentTarget && Board.diff(point, enemySlot) <= units[type].range) {
              currentTarget = enemy;
              fireInterval = setInterval(function () {
                enemy.hitFor(units[type].damage);
                self.fire(currentEnemyPoint, currentEnemySlot);
              }, units[type].rate);
              intervals.push(fireInterval);
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
                top: parseInt(enemyPoint.y) - 5 + 'px',
                left: parseInt(enemyPoint.x) + 15 + 'px'
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
            el.css({
              '-webkit-transform':'rotate(' + angle + 'deg)',
              '-moz-transform':'rotate(' + angle + 'deg)'
            });
          },
          
          upgrade: function () {
            var costToUpgrade = (currentLevel + 1) * units[type].cost;
            if (money >= costToUpgrade) {
              currentLevel++;
              subtractMoney(costToUpgrade);
            }
          },
          
          sell: function () {
            var costToSell = (currentLevel + 1) * 0.75;
            addMoney(costToSell)
          }
        };
    
    slot.append(el);
    return self;
  }
}(this));