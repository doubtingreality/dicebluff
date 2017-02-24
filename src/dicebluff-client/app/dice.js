'use strict';

function Dice(diceFrames, outputList, outputOffset) {
    var outputListLength = outputList.length,
        diceFrameLinesLength = null,
        diceFramesCount = diceFrames.length,
        diceFramesIndex,
        diceFrame,
        diceFrameLinesCount,
        diceFrameLinesIndex,
        diceFrameLine;

    if (diceFramesCount !== 7) {
        throw new Error('Dice must have seven frames');
    }

    // Calculate the width of the dice frames
    for (diceFramesIndex = 0;
            (diceFramesIndex < diceFramesCount);
            diceFramesIndex++) {
        // Reference the dice frame and count the lines
        diceFrame = diceFrames[diceFramesIndex];
        diceFrameLinesCount = diceFrame.length;

        if (diceFrameLinesCount !== outputListLength) {
            throw new Error(
                'Each dice frame must have the same number of lines ' +
                'and this number must be equal to the number of output instances'
            );
        }

        for (diceFrameLinesIndex = 0;
                (diceFrameLinesIndex < diceFrameLinesCount);
                diceFrameLinesIndex++) {
            // Reference the line and check the total width
            diceFrameLine = diceFrame[diceFrameLinesIndex];

            if (diceFrameLinesLength === null) {
                diceFrameLinesLength = diceFrameLine.length;
            } else if (diceFrameLine.length !== diceFrameLinesLength) {
                throw new Error('Each dice frame line must have the same length');
            }
        }
    }

    this.diceFrames = diceFrames;
    this.outputList = outputList;
    this.outputOffset = outputOffset;

    /* Draw the intitial dice frame
        which must be a placeholder frame without eyes */
    this.drawFrame(0);
}

Dice.smallFrames = [
    [
        '╔═══╗',
        '║ ? ║',
        '╚═══╝'
    ],
    [
        '╔═══╗',
        '║ 1 ║',
        '╚═══╝'
    ],
    [
        '╔═══╗',
        '║ 2 ║',
        '╚═══╝'
    ],
    [
        '╔═══╗',
        '║ 3 ║',
        '╚═══╝'
    ],
    [
        '╔═══╗',
        '║ 4 ║',
        '╚═══╝'
    ],
    [
        '╔═══╗',
        '║ 5 ║',
        '╚═══╝'
    ],
    [
        '╔═══╗',
        '║ 6 ║',
        '╚═══╝'
    ]
];

Dice.largeFrames = [
    [
        '╔═════════╗',
        '║         ║',
        '║    ?    ║',
        '║         ║',
        '╚═════════╝'
    ],
    [
        '╔═════════╗',
        '║         ║',
        '║    •    ║',
        '║         ║',
        '╚═════════╝'
    ],
    [
        '╔═════════╗',
        '║       • ║',
        '║         ║',
        '║ •       ║',
        '╚═════════╝'
    ],
    [
        '╔═════════╗',
        '║       • ║',
        '║    •    ║',
        '║ •       ║',
        '╚═════════╝'
    ],
    [
        '╔═════════╗',
        '║ •     • ║',
        '║         ║',
        '║ •     • ║',
        '╚═════════╝'
    ],
    [
        '╔═════════╗',
        '║ •     • ║',
        '║    •    ║',
        '║ •     • ║',
        '╚═════════╝'
    ],
    [
        '╔═════════╗',
        '║ •  •  • ║',
        '║         ║',
        '║ •  •  • ║',
        '╚═════════╝'
    ]
];

Dice.randomEyes = function() {
    return (Math.floor((Math.random() * 6)) + 1);
};

Dice.prototype.drawFrame = function(frameIndex) {
    var diceFrame,
        diceFrameLinesCount,
        diceFrameLineIndex,
        diceFrameLine,
        diceFrameLineLength;

    if (typeof this.diceFrames[frameIndex] === 'undefined') {
        throw new Error('Dice frame does not exist');
    }

    diceFrame = this.diceFrames[frameIndex];
    diceFrameLinesCount = diceFrame.length;

    for (diceFrameLineIndex = 0;
            (diceFrameLineIndex < diceFrameLinesCount);
            diceFrameLineIndex++) {
        diceFrameLine = diceFrame[diceFrameLineIndex];
        diceFrameLineLength = diceFrameLine.length;

        /* Replace text to keep the dice in a consistent position
            (this is also why each line is padded to the same length) */
        this.outputList[diceFrameLineIndex].replaceText(
            diceFrameLine,
            this.outputOffset,
            diceFrameLineLength
        );
    }
};

Dice.prototype.roll = function(
    maximumRollCount,
    minimumRollDuration,
    eyesCallback
) {
    var selfReference = this;

    function rollIteration(rollCount, previousEyes) {
        var oppositeEyes, eyesList, eyes, rollDuration;

        /* Eyes are currently fixed at one to six
            (which must correspond to the frame indices) */
        if (previousEyes === null) {
            eyes = Dice.randomEyes();

        } else {
            oppositeEyes = ((6 - previousEyes) + 1);
            eyesList = [];

            /* Make sure the dice rolls to a different side
                that is not the opposite side */
            for (eyes = 1; (eyes <= 6); eyes++) {
                if ((eyes !== previousEyes)
                        && (eyes !== oppositeEyes)) {
                    eyesList.push(eyes);
                }
            }

            eyes = eyesList[(Math.floor((Math.random() * 4)))];
        }

        selfReference.drawFrame(eyes);

        if (--rollCount > 0) {
            /* Calculate the roll duration and recursively invoke
                this method after the roll duration (timeout) */
            rollDuration = Math.floor((minimumRollDuration
                + ((maximumRollCount - rollCount)
                    * (maximumRollCount - rollCount)
                    * Math.random())));

            window.setTimeout(
                rollIteration.bind(null, rollCount, eyes),
                rollDuration
            );

        } else {
            // Finally invoke the eyes callback
            window.setTimeout(eyesCallback.bind(null, eyes));
        }
    }

    // Roll the dice
    rollIteration.call(null, maximumRollCount, null);
};
