'use strict';

function SimulatedPlayer() {
    /* Randomly sample a bias between zero and one
        from a truncated normal distribution
        using rejection sampling */
    var bias;

    do {
        bias = ((Statistics.randomNormal() * 0.13444414725) + 0.5);
    } while ((bias < 0) || (bias > 1));

    this.bias = bias;
}

SimulatedPlayer.prototype.rollDice = function(diceCount, eyesCallback) {
    var eyesList = [],
        diceIndex,
        rollDuration;

    for (diceIndex = 0; (diceIndex < diceCount); diceIndex++) {
        eyesList.push(Dice.randomEyes());
    }

    /* With a roll count of twenty and a minimum roll duration
        of a hundred milliseconds, local player dice rolls take
        between 2000ms and 4470ms. Sample a random roll duration
        between these boundaries from a truncated normal distribution
        using rejection sampling */
    do {
        rollDuration = Math.round(((Statistics.randomNormal() * 332.0770437103) + 3235));
    } while ((rollDuration < 2000) || (rollDuration > 4470));

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

    /* Randomly sample a duration between 5000ms and 20000ms
        from a truncated normal distribution using rejection sampling */
    do {
        evaluationDuration = Math.round(((Statistics.randomNormal() * 2016.662208767) + 12500));
    } while ((evaluationDuration < 5000) || (evaluationDuration > 20000));

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
