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
    this.entries[10][10] = "player";
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
    if (warrior.health() < 13 && action != "bind") {
      warrior.rest();
    } else if (action == "bind") {
      this.bind(warrior, chosenDirection);
    } else if (action == "attack") {
      this.attack(warrior, chosenDirection);
    } else if (action == "rescue") {
      this.rescue(warrior, chosenDirection);
    } else {
      this.move(warrior.directionOfStairs());
    }
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
    if (this.entries[coords.x][coords.y] === undefined) {
      warrior.walk(direction);
      this.playerX = coords.x;
      this.playerY = coords.y;
    }
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
