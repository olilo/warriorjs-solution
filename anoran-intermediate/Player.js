class Player {
  playTurn(warrior) {
    // Cool code goes here
    if (warrior.feel('right').isEnemy()) {
      warrior.attack('right');
    } else if (warrior.feel().isEnemy()) {
      warrior.attack();
    } else if (warrior.health() < 13) {
      warrior.rest();
    } else {
      warrior.walk(warrior.directionOfStairs());
    }
  }
}
