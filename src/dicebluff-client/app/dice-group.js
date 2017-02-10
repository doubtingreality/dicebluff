'use strict';

function DiceGroup(diceList) {
    /* The dice group serves to roll multiple dice at once
        and to only return the numbers of eyes (in a list)
        when all dice have finished rolling */
    this.diceList = diceList;
}

DiceGroup.prototype.roll = function(
    maximumRollCount,
    minimumRollDuration,
    eyesCallback
) {
    var eyesList = [],
        diceCount = this.diceList.length,
        diceFinished = 0,
        diceIndex,
        diceReference;

    for (diceIndex = 0; (diceIndex < diceCount); diceIndex++) {
        // Push a placeholder onto the eyes count list
        eyesList.push(null);

        diceReference = this.diceList[diceIndex];

        diceReference.roll(
            maximumRollCount,
            minimumRollDuration,
            (function(diceIndex, eyes) {
                /* Assign the eyes count to the appropriate index
                    (eyes counts are collected in the order of their dices) */
                eyesList[diceIndex] = eyes;

                if (++diceFinished >= diceCount) {
                    /* Invoke the group callback
                        when all dice have finished rolling */
                    eyesCallback.call(null, eyesList);
                }
            }).bind(null, diceIndex)
        );
    }
};
