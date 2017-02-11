'use strict';

function SimulatedPlayer() {
    this.bias = (1 - Math.random()); // (0,1]
}

SimulatedPlayer.prototype.rollDice = function(diceCount, eyesCallback) {
    var eyesList = [],
        diceIndex,
        rollDuration;

    for (diceIndex = 0; (diceIndex < diceCount); diceIndex++) {
        eyesList.push(Dice.randomEyes());
    }

    rollDuration = (Math.floor((Math.random() * 2471)) + 2000); // 2000ms-4470ms
    window.setTimeout(eyesCallback.bind(null, eyesList), rollDuration);
};

SimulatedPlayer.prototype.decide = function(probability) {
    if (probability === 0) {
        return false;
    } else if (probability === 1) {
        return true;
    }

    // Adjust the probability based on the bias
    if (this.bias > 0.5) {
        probability = (1 - Math.pow((1 - probability), (this.bias * 2)));
    } else if (this.bias < 0.5) {
        probability = Math.pow(probability, ((1 - this.bias) * 2));
    }

    return (Math.random() < probability);
};

SimulatedPlayer.prototype.evaluateClaim = function(
    totalDiceCount,
    claimEyesList,
    handEyesList,
    wildcardPermitted,
    verdictCallback
) {
    var claimEyesCount,
        handEyesCount,
        matchedEyesCount,
        claimProbability,
        verdict,
        evaluationDuration;

    claimEyesCount = claimEyesList.length;
    handEyesCount = handEyesList.length;

    // Determine how many of the claim eyes are not in our hand
    matchedEyesCount = DiceFilter.matchEyes(
        claimEyesList,
        handEyesList,
        wildcardPermitted,
        null,
        null
    );

    claimProbability = DiceStatistics.lookupPartialProbability(
        totalDiceCount,
        claimEyesCount,
        handEyesCount,
        matchedEyesCount,
        wildcardPermitted
    );

    verdict = this.decide(claimProbability);
    evaluationDuration = (Math.floor((Math.random() * 15001)) + 5000); // 5000ms-20000ms
    window.setTimeout(verdictCallback.bind(null, verdict), evaluationDuration);
};

SimulatedPlayer.prototype.reviseClaim = function(
    totalDiceCount,
    claimEyesList,
    handEyesList,
    wildcardPermitted,
    claimCallback
) {
    var revisionCount,
        claimEyesCount,
        claimEyesIndex,
        claimEyes,
        handEyesCount,
        handEyesIndex,
        handEyes,
        unclaimedDiceCount,
        claimProbability;

    revisionCount = 0; // Track the number of revisions

    claimEyesList = claimEyesList.slice().sort();
    claimEyesCount = claimEyesList.length;

    handEyesList = handEyesList.slice().sort();
    handEyesCount = handEyesList.length;

    // 1. Add random eyes (maximum number is the number of unclaimed dice)
    // 2. Shift dice eyes upwards where possible (but do it probabilistically)
    // 3. Add eyes from own hand if necessary
};
