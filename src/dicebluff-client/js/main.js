;(function(windowReference, documentReference) {
    'use strict';

    var loaderFrames = [
        '(•   ) ',
        '( •  ) ',
        '(  • ) ',
        '(   •) ',
        '(  • ) ',
        '( •  ) '
    ];

    var diceFrames = [
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

    function Output(outputNode, fromPrompt) {
        this.outputNode = outputNode;
        this.fromPrompt = fromPrompt;
    }

    Output.prototype.enablePromptPrefix = function() {
        if (!this.fromPrompt) {
            this.fromPrompt = true;
            this.outputNode.classList.add('from-prompt');
        }
    };

    Output.prototype.disablePromptPrefix = function() {
        if (this.fromPrompt) {
            this.fromPrompt = false;
            this.outputNode.classList.remove('from-prompt');
        }
    };

    Output.prototype.appendText = function(outputText) {
        var textNode = documentReference.createTextNode(outputText);
        this.outputNode.appendChild(textNode);
    };

    Output.prototype.prependText = function(outputText) {
        var textNode = documentReference.createTextNode(outputText);

        if (this.outputNode.hasChildNodes()) {
            /* Insert the text node before the first child
                if the output node has children */
            this.outputNode.insertBefore(textNode, this.outputNode.firstChild);
        } else {
            this.outputNode.appendChild(textNode);
        }
    };

    Output.prototype.replaceText = function(outputText, offset, length) {
        var currentOutputText = this.outputNode.textContent,
            currentOutputTextLength = currentOutputText.length,
            beforeReplacementText = currentOutputText.substr(0,
                Math.min(offset, currentOutputTextLength)),
            afterReplacementText = currentOutputText.substr(
                Math.min((offset + length), (currentOutputTextLength - 1)));

        this.outputNode.textContent = (beforeReplacementText
            + outputText + afterReplacementText);
    };

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

                if (null === diceFrameLinesLength) {
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

        function rollIteration(rollCount, previousEyesCount) {
            var oppositeEyesCount, eyesList, eyesCount, rollDuration;

            /* Eyes are currently fixed at one to six
                (which must correspond to the frame indices) */
            if (null === previousEyesCount) {
                eyesCount = (Math.round((Math.random() * 5)) + 1);

            } else {
                oppositeEyesCount = ((6 - previousEyesCount) + 1);
                eyesList = [];

                /* Make sure the dice rolls to a different side
                    that is not the opposite side */
                for (eyesCount = 1; (eyesCount <= 6); eyesCount++) {
                    if ((eyesCount !== previousEyesCount)
                            && (eyesCount !== oppositeEyesCount)) {
                        eyesList.push(eyesCount);
                    }
                }

                eyesCount = eyesList[(Math.round((Math.random() * 3)))];
            }

            selfReference.drawFrame(eyesCount);

            if (--rollCount > 0) {
                /* Calculate the roll duration and recursively invoke
                    this method after the roll duration (timeout) */
                rollDuration = (minimumRollDuration
                    + ((maximumRollCount - rollCount)
                            * (maximumRollCount - rollCount)
                       * Math.random()));

                windowReference.setTimeout(
                    rollIteration.bind(null, rollCount, eyesCount),
                    rollDuration
                );

            } else {
                // Finally invoke the eyes callback
                windowReference.setTimeout(eyesCallback.bind(null, eyesCount));
            }
        }

        // Roll the dice
        rollIteration.call(null, maximumRollCount, null);
    };

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
        var eyesCountList = [],
            diceCount = this.diceList.length,
            diceFinished = 0,
            diceIndex,
            diceReference;

        for (diceIndex = 0; (diceIndex < diceCount); diceIndex++) {
            // Push a placeholder onto the eyes count list
            eyesCountList.push(null);

            diceReference = this.diceList[diceIndex];

            diceReference.roll(
                maximumRollCount,
                minimumRollDuration,
                (function(diceIndex, eyesCount) {
                    /* Assign the eyes count to the appropriate index
                        (eyes counts are collected in the order of their dices) */
                    eyesCountList[diceIndex] = eyesCount;

                    if (++diceFinished >= diceCount) {
                        /* Invoke the group callback
                            when all dice have finished rolling */
                        eyesCallback.call(null, eyesCountList);
                    }
                }).bind(null, diceIndex)
            );
        }
    };

    function Loader(loaderFrames, output) {
        var loaderFramesCount = loaderFrames.length,
            loaderFramesLength = null,
            loaderFramesIndex,
            loaderFrame;

        if (loaderFramesCount < 2) {
            throw new Error('Loader must have at least two frames');
        }

        for (loaderFramesIndex = 0;
                (loaderFramesIndex < loaderFramesCount);
                loaderFramesIndex++) {
            loaderFrame = loaderFrames[loaderFramesIndex];

            if (loaderFramesLength === null) {
                loaderFramesLength = loaderFrame.length;
            } else if (loaderFrame.length !== loaderFramesLength) {
                throw new Error('Each loader frame must have the same length');
            }
        }

        this.loaderFrames = loaderFrames;
        this.loaderInterval = null;
        this.output = output;
    }

    Loader.prototype.enable = function(frameDuration) {
        var selfReference, frameIndex, loaderFrame;

        if (this.loaderInterval === null) {
            /* Prepend the initial frame
                (subsequent frames are replaced over it) */
            frameIndex = 0;
            loaderFrame = this.loaderFrames[frameIndex];
            this.output.prependText(loaderFrame);

            this.loaderInterval = windowReference.setInterval((function() {
                // Loop the animation
                ((++frameIndex >= this.loaderFrames.length) && (frameIndex = 0));
                loaderFrame = this.loaderFrames[frameIndex];
                this.output.replaceText(loaderFrame, 0, loaderFrame.length);
            }).bind(this), frameDuration);
        }
    };

    Loader.prototype.disable = function() {
        if (this.loaderInterval !== null) {
            windowReference.clearInterval(this.loaderInterval);
            this.loaderInterval = null;
            this.output.replaceText('', 0, this.loaderFrames[0].length);
        }
    };

    function Console(consoleNode, consoleWidth, consoleHeight, historyLimit) {
        var selfReference = this,
            promptNode = consoleNode.querySelector('.prompt');

        if (promptNode === null) {
            throw new Error('Cannot find prompt node within console node');
        }

        this.historyLimit = historyLimit;
        this.outputList = [];

        this.promptEnabled = false;
        this.promptCallback = null;

        this.consoleNode = consoleNode;
        this.promptNode = promptNode;

        this.consoleWidth = consoleWidth;
        this.consoleHeight = consoleHeight;

        this.consoleNode.addEventListener('click', function(event) {
            if (selfReference.promptNode !== documentReference.activeElement) {
                event.preventDefault();
                selfReference.promptNode.focus();
            }
        });

        this.consoleNode.addEventListener('touchstart', function(event) {
            if (selfReference.promptNode !== documentReference.activeElement) {
                event.preventDefault();
                this.promptNode.focus();
            }
        });

        this.promptNode.addEventListener('keypress', function(event) {
            // Enter
            if (13 === event.which) {
                /* Prevent a line break from being inserted
                    and flush the prompt if it is enabled */
                event.preventDefault();
                (selfReference.promptEnabled && selfReference.flushPrompt());
            }
        });
    }

    Console.prototype.createOutput = function(outputText, fromPrompt) {
        var outputNode = documentReference.createElement('div'), output;

        /* Setup the output node
            and instantiate the output instance */
        outputNode.classList.add('output');
        (fromPrompt && outputNode.classList.add('from-prompt'));
        outputNode.textContent = (outputText || '');

        output = new Output(outputNode, fromPrompt);
        this.outputList.push(output);

        /* Insert the element before the prompt
            (and thereby below all other output)
            and scroll the console to the bottom */
        this.consoleNode.insertBefore(outputNode, this.promptNode);

        // Scroll after the elements have been updated
        windowReference.setTimeout((function() {
            this.consoleNode.scrollTop = this.consoleNode.scrollHeight;
        }).bind(this));

        /* Ensure the number of output lines
            remains within the history limit */
        this.cleanupOutput();

        return output;
    };

    Console.prototype.createEmptyOutput = function(whitespaceFill) {
        var outputText = '',
            outputTextLength = 0;

        if (whitespaceFill) {
            // Create a (visibly empty) line filled with spaces
            while (outputTextLength < this.consoleWidth) {
                outputText += ' ';
                outputTextLength++;
            }
        }

        return this.createOutput(outputText, false);
    };

    Console.prototype.cleanupOutput = function() {
        var outputListLength = this.outputList.length,
            outputListOverflow = Math.max(0,
                (outputListLength - this.historyLimit)),
            outputIndex,
            outputNode;

        // Remove output which exceeds the history limit
        for (outputIndex = 0;
                (outputIndex < outputListOverflow);
                outputIndex++) {
            outputNode = this.outputList[outputIndex].outputNode;

            if (this.consoleNode.contains(outputNode)) {
                this.consoleNode.removeChild(outputNode);
            }

            this.outputList.shift();
        }
    };

    Console.prototype.enablePrompt = function() {
        if (!this.promptEnabled) {
            // Show and enable the prompt
            this.promptEnabled = true;
            this.promptNode.hidden = false;
            this.promptNode.contentEditable = true;
        }
    };

    Console.prototype.disablePrompt = function() {
        if (this.promptEnabled) {
            // Hide and disable the prompt
            this.promptEnabled = false;
            this.promptNode.hidden = true;
            this.promptNode.contentEditable = false;
        }
    };

    Console.prototype.flushPrompt = function() {
        var promptContent;

        /* Store and clear the prompt contents
            before appending them to the output */
        promptContent = this.promptNode.textContent;
        this.promptNode.textContent = '';

        if (null !== this.promptCallback) {
            // Invoke the prompt callback if it exists
            this.promptCallback.call(this, promptContent);
        }

        return this.createOutput(promptContent, true);
    };

    Console.prototype.promptForInput = function(inputCallback) {
        if (this.promptEnabled) {
            throw new Error('Only one prompt can be active at once');
        }

        // Enable the prompt
        this.enablePrompt();

        this.promptCallback = function(promptContent) {
            /* Unregister the prompt callback (it must only be called once),
                disable the prompt and invoke the input callback */
            this.promptCallback = null;
            this.disablePrompt();

            windowReference.setTimeout(inputCallback.bind(null, promptContent));
        };
    };

    Console.prototype.createLoader = function(loaderMessage, loaderFrames) {
        var output, loader;

        output = this.createOutput(loaderMessage, false);
        loader = new Loader(loaderFrames, output);

        return loader;
    };

    Console.prototype.createDiceGroup = function(diceFrames, diceCount) {
        /* Dimensions can safely be read from the first frame/line indices
            because the dice constructor checks if all dimensions are equal.
            When calculating the amount of dice per row, the dice frame
            line length is multiplied to ensure white space between dice */
        var diceList = [],
            diceFrameLinesCount = diceFrames[0].length,
            diceFrameLineLength = diceFrames[0][0].length,
            dicePerRowLimit = Math.floor(
                (this.consoleWidth / (diceFrameLineLength * 1.5))),
            rowCount = Math.ceil((diceCount / dicePerRowLimit)),
            dicePerRow = Math.ceil((diceCount / rowCount)),
            rowIndex,
            rowOutputList,
            diceLineIndex,
            diceCountOnRow,
            diceWidthOnRow,
            diceIndexOnRow,
            diceOffsetOnRow,
            diceGroup;

        for (rowIndex = 0; (rowIndex < rowCount); rowIndex++) {
            // Insert an additional output to seperate the rows
            ((rowIndex !== 0) && this.createEmptyOutput(false));

            /* Create empty output nodes
                on which the dice can be rendered */
            rowOutputList = [];

            for (diceLineIndex = 0;
                    (diceLineIndex < diceFrameLinesCount);
                    diceLineIndex++) {
                rowOutputList.push(this.createEmptyOutput(true));
            }

            /* Calculate how many dice should be placed on the current row.
                Calculations are such that, earlier rows will get more dice
                if dice cannot be evenly divided over the rows */
            diceCountOnRow = Math.min(
                (diceCount - diceList.length),
                dicePerRow
            );

            /* Calculate the space a single dice
                (including the surrounding whitespace)
                will take on the current row */
            diceWidthOnRow = (this.consoleWidth / diceCountOnRow);

            for (diceIndexOnRow = 0;
                    (diceIndexOnRow < diceCountOnRow);
                    diceIndexOnRow++) {

                diceOffsetOnRow = Math.round(
                    ((diceWidthOnRow * diceIndexOnRow)
                        + ((diceWidthOnRow / 2) - (diceFrameLineLength / 2)))
                );

                // Construct the dice
                diceList.push(
                    new Dice(
                        diceFrames,
                        rowOutputList,
                        diceOffsetOnRow
                    )
                );
            }
        }

        // Encapsulate the dice in a group to enable simultaneous rolling
        diceGroup = new DiceGroup(diceList);
        return diceGroup;
    };

    function Examples(console) {
        this.console = console;
    }

    Examples.prototype.askForName = function() {
        this.console.createOutput('What is your name?');

        this.console.promptForInput(function(input) {
            console.log('Your name is: ' + input);
        });
    };

    Examples.prototype.rollDice = function() {
        var diceGroup = this.console.createDiceGroup(diceFrames, 12);

        diceGroup.roll(14, 100, function(eyes) {
            console.log('Rolled eyes: ' + eyes); }
        );
    };

    Examples.prototype.loader = function() {
        var loader = this.console.createLoader(
            'Connecting to server...',
            loaderFrames
        );

        loader.enable(200);
    };

    var consoleNode = documentReference.querySelector('.console');

    if (consoleNode) {
        // Begin examples
        var consoleEmulator = new Console(consoleNode, 74, 18, 40),
            examples = new Examples(consoleEmulator);

        examples.loader();
        examples.rollDice();
        examples.askForName();
    }


})(window, document);
