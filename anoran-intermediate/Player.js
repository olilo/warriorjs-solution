class Player {
  playTurn(warrior) {
    // Cool code goes here
    if (this._map === undefined) {
      this._map = new Map();
    }
    this._map.decideAction(warrior);
  }
}

class Map {
  constructor() {
    this.entries = [];
    for (var i = 0; i < 20; i++) {
      this.entries[i] = [];
    }
    this.playerX = 10;
    this.playerY = 10;
    this.playerDirection = "forward";
  }
  toCoordinates(direction) {
    if (direction == "left") {
      return {x: this.playerX, y: this.playerY - 1};
    } else if (direction == "right") {
      return {x: this.playerX, y: this.playerY + 1};
    } else if (direction == "forward") {
      return {x: this.playerX + 1, y: this.playerY};
    } else {
      return {x: this.playerX - 1, y: this.playerY};
    }
  }
  decideAction(warrior) {
    var directions = ["left", "right", "forward", "backward"];
    var chosenDirection = undefined;
    var action = "";
    for (var i = 0; i < directions.length; i++) {
      var coords = this.toCoordinates(directions[i]);
      this.add(warrior, directions[i]);
      if (this.entries[coords.x][coords.y] == "enemy") {
        chosenDirection = directions[i];
        action = "bind";
      } else if (action != "bind" && this.entries[coords.x][coords.y] == "boundenemy") {
        chosenDirection = directions[i];
        action = "attack";
      } else if (action != "bind" && action != "attack" && this.entries[coords.x][coords.y] == "captive") {
        chosenDirection = directions[i];
        action = "rescue";
      }
    }
    var ticking = this.findTicking(warrior);
    if (ticking != null) {
      for (var i = 0; i < directions.length; i++) {
        if (warrior.feel(directions[i]).isCaptive()) {
          chosenDirection = directions[i];
          action = "rescue";
          break;
        }
      }
      if (action != "rescue") {
        var dir = warrior.directionOf(ticking);
        if (!warrior.feel(dir).isEmpty()) {
          if (warrior.feel("left").isEmpty()) {
            dir = "left";
          } else if (warrior.feel("right").isEmpty()) {
            dir = "right";
          } else if (warrior.feel("forward").isEmpty()) {
            dir = "forward";
          }
        }
        this.move(warrior, dir);
        return;
      }
    }
    if (warrior.health() < 8 && action != "bind") {
      warrior.rest();
    } else if (action == "bind") {
      this.bind(warrior, chosenDirection);
    } else if (action == "attack") {
      this.attack(warrior, chosenDirection);
    } else if (action == "rescue") {
      this.rescue(warrior, chosenDirection);
    } else if (warrior.listen().length > 0) {
      var nextUnit = warrior.listen()[0];
      if (warrior.feel(warrior.directionOf(nextUnit)).isStairs()) {
        this.move(warrior, "left");
      } else {
        this.move(warrior, warrior.directionOf(nextUnit));
      }
    } else {
      this.move(warrior, warrior.directionOfStairs());
    }
  }
  findTicking(warrior) {
    var units = warrior.listen();
    for (var i = 0; i < units.length; i++) {
      if (units[i].isCaptive() && units[i].isTicking()) {
        return units[i];
      }
    }
    return null;
  }
  add(warrior, direction) {
    var coords = this.toCoordinates(direction);
    if (this.entries[coords.x][coords.y] === undefined) {
      var space = warrior.feel(direction);
      if (space.isCaptive()) {
        this.entries[coords.x][coords.y] = "captive";
      } else if (space.isEnemy()) {
        this.entries[coords.x][coords.y] = "enemy";
      } else if (space.isWall()) {
        this.entries[coords.x][coords.y] = "wall";
      }
    }
  }
  move(warrior, direction) {
    var coords = this.toCoordinates(direction);
//    if (this.entries[coords.x][coords.y] === undefined) {
      warrior.walk(direction);
      this.playerX = coords.x;
      this.playerY = coords.y;
//    }
  }
  attack(warrior, direction) {
    var coords = this.toCoordinates(direction);
    if (this.entries[coords.x][coords.y] == "boundenemy") {
      warrior.attack(direction);
      if (warrior.feel(direction).isEmpty()) {
        this.entries[coords.x][coords.y] = undefined;
      } else {
        this.entries[coords.x][coords.y] = "enemy";
      }
    }
  }
  bind(warrior, direction) {
    var coords = this.toCoordinates(direction);
    if (this.entries[coords.x][coords.y] == "enemy") {
      warrior.bind(direction);
      if (warrior.feel(direction).isEmpty()) {
        this.entries[coords.x][coords.y] = undefined;
      } else {
        this.entries[coords.x][coords.y] = "boundenemy";
      }
    }
  }
  rescue(warrior, direction) {
    var coords = this.toCoordinates(direction);
    if (this.entries[coords.x][coords.y] == "captive") {
      warrior.rescue(direction);
      this.entries[coords.x][coords.y] = undefined;
    }
  }
}
