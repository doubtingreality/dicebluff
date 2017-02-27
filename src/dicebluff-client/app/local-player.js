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
    var claimEyesCount = claimEyesList.length,
        handEyesCount = handEyesList.length,
        matchedEyesCount,
        claimProbability,
        claimDiceGroup,
        handDiceGroup;

    // Determine how many of the claim eyes are in our hand
    matchedEyesCount = DiceFilter.matchEyes(
        handEyesList,
        claimEyesList,
        wildcardPermitted,
        null,
        null
    );

    claimProbability = DiceStatistics.lookupPartialProbability(
        totalDiceCount,
        handEyesCount,
        claimEyesCount,
        matchedEyesCount,
        wildcardPermitted
    );

    this.console.createOutput('The claim:', false);

    claimDiceGroup = this.console.createDiceGroup(
        Dice.smallFrames,
        claimEyesCount
    );

    claimDiceGroup.drawFrame(claimEyesList);

    this.console.createEmptyOutput(false);
    this.console.createOutput('Your hand:', false);

    handDiceGroup = this.console.createDiceGroup(
        Dice.smallFrames,
        handEyesCount
    );

    handDiceGroup.drawFrame(handEyesList);

    this.console.createEmptyOutput(false);

    this.console.createOutput('The claim has a '
        + Math.round((100 * claimProbability))
        + '% probability of being true');

    this.console.createOutput('Do you accept this claim?', false);
    this.console.promptForConfirmation(verdictCallback, true);
};

LocalPlayer.prototype.reviseClaim = function(
    totalDiceCount,
    claimEyesList,
    handEyesList,
    wildcardPermitted,
    claimCallback
) {
    // --
};
