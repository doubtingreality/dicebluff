'use strict';

function LocalPlayer(console) {
    this.console = console;
}

LocalPlayer.prototype.rollDice = function(diceCount, eyesCallback) {
    var diceGroup = this.console.createDiceGroup(Dice.largeFrames, diceCount);

    this.console.createEmptyOutput(false);
    this.console.createOutput('Press <space> to roll the dice.', false);

    this.console.promptForKeypress(32, function() {
        // Roll the dice when space is pressed
        diceGroup.roll(20, 100, eyesCallback);
    });
};

LocalPlayer.prototype.evaluateClaim = function(
    totalDiceCount,
    claimEyesList,
    handEyesList,
    wildcardPermitted,
    verdictCallback
) {
    //
};

LocalPlayer.prototype.reviseClaim = function(
    totalDiceCount,
    claimEyesList,
    handEyesList,
    wildcardPermitted,
    claimCallback
) {
    //
};
