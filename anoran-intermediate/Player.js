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
    this.directions = ["left", "right", "forward", "backward"];
  }
  toCoordinates(direction, distance) {
    if (distance == undefined) {
      distance = 1;
    }
    if (direction == "left") {
      return {x: this.playerX, y: this.playerY - distance};
    } else if (direction == "right") {
      return {x: this.playerX, y: this.playerY + distance};
    } else if (direction == "forward") {
      return {x: this.playerX + distance, y: this.playerY};
    } else {
      return {x: this.playerX - distance, y: this.playerY};
    }
  }
  decideAction(warrior) {
    var chosenDirection = undefined;
    var action = "";
    var lookAhead = warrior.look();
    for (var i = 0; i < this.directions.length; i++) {
      var dir = this.directions[i];
      var coords = this.toCoordinates(dir);
      this.add(warrior, dir);
      if (this.entries[coords.x][coords.y] == "enemy") {
        chosenDirection = dir;
        action = "bind";
      } else if (action != "bind" && this.entries[coords.x][coords.y] == "boundenemy") {
        chosenDirection = dir;
        if (warrior.health() > 8) {
          action = "bomb";
        } else {
          action = "attack";
        }
      } else if (action != "bind" && action != "attack" && this.entries[coords.x][coords.y] == "captive") {
        chosenDirection = dir;
        action = "rescue";
      }
    }
    var ticking = this.findTicking(warrior);
    var tickingDistance = ticking ? warrior.distanceOf(ticking) : 20;
    if (action != "bind" && lookAhead[1].isEnemy() && tickingDistance > 2) {
      action = "bomb";
    }
    if (ticking != null) {
      var decision = this.rescueTicking(warrior, ticking);
      if (decision.action != undefined) {
        action = decision.action;
        chosenDirection = decision.direction;
      }
    }
    if (warrior.health() < 8 && action != "bind" && warrior.listen().length > 0) {
      warrior.rest();
    } else if (action == "move") {
      this.move(warrior, chosenDirection);
    } else if (action == "bind") {
      this.bind(warrior, chosenDirection);
    } else if (action == "bomb") {
      this.explodeBomb(warrior, chosenDirection);
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
    var space = warrior.feel(direction);
    if (space.isEmpty()) {
      this.entries[coords.x][coords.y] = undefined;
      return;
    }
    if (this.entries[coords.x][coords.y] === undefined) {
      if (space.isCaptive()) {
        this.entries[coords.x][coords.y] = "captive";
      } else if (space.isEnemy()) {
        this.entries[coords.x][coords.y] = "enemy";
      } else if (space.isWall()) {
        this.entries[coords.x][coords.y] = "wall";
      }
    }
  }
  rescueTicking(warrior, ticking) {
    for (var i = 0; i < this.directions.length; i++) {
      var dir = this.directions[i];
      var coords = this.toCoordinates(dir);
      if (this.entries[coords.x][coords.y] == "captive") {
        return {action: "rescue", direction: this.directions[i]};
      }
    }
    var dir = warrior.directionOf(ticking);
    if (!warrior.feel(dir).isEmpty()) {
      if (warrior.feel("left").isEmpty()) {
        dir = "left";
      } else if (warrior.feel("right").isEmpty()) {
        dir = "right";
      } else if (warrior.feel("forward").isEmpty()) {
        dir = "forward";
      } else {
        return {}
      }
    }
    return {action: "move", direction: dir};
  }
  move(warrior, direction) {
    var coords = this.toCoordinates(direction);
    if (this.entries[coords.x][coords.y] === undefined) {
      warrior.walk(direction);
      this.playerX = coords.x;
      this.playerY = coords.y;
    }
  }
  explodeBomb(warrior, direction) {
    var coords = this.toCoordinates(direction);
    //if (this.entries[coords.x][coords.y] == "boundenemy") {
      warrior.detonate(direction);
      if (warrior.feel(direction).isEmpty()) {
        this.entries[coords.x][coords.y] = undefined;
      } else {
        this.entries[coords.x][coords.y] = "enemy";
      }
    //}
  }
  attack(warrior, direction) {
    var coords = this.toCoordinates(direction);
    //if (this.entries[coords.x][coords.y] == "boundenemy") {
      warrior.attack(direction);
      if (warrior.feel(direction).isEmpty()) {
        this.entries[coords.x][coords.y] = undefined;
      } else {
        this.entries[coords.x][coords.y] = "enemy";
      }
    //}
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
