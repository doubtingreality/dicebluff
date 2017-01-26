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
                eyes = (Math.floor((Math.random() * 6)) + 1);

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

                windowReference.setTimeout(
                    rollIteration.bind(null, rollCount, eyes),
                    rollDuration
                );

            } else {
                // Finally invoke the eyes callback
                windowReference.setTimeout(eyesCallback.bind(null, eyes));
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

        documentReference.addEventListener('DOMContentLoaded', function() {
            // Focus on the prompt when the page has loaded
            (this.promptEnabled && selfReference.focusPrompt());
        });

        function handleConsoleClick(event) {
            // TODO: Prevent this from working when we are dragging
            if (selfReference.promptNode !== documentReference.activeElement) {
                event.preventDefault();
                selfReference.focusPrompt();
            }
        }

        this.consoleNode.addEventListener('click', handleConsoleClick);
        this.consoleNode.addEventListener('touchstart', handleConsoleClick);

        this.promptNode.addEventListener('keypress', function(event) {
            if (event.keyCode === 13) { // Enter
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

        if (this.promptCallback !== null) {
            // Invoke the prompt callback if it exists
            windowReference.setTimeout(
                this.promptCallback.bind(this, promptContent)
            );
        }

        return this.createOutput(promptContent, true);
    };

    Console.prototype.focusPrompt = function() {
        var range, selection;

        this.promptNode.focus();

        if (this.promptNode.hasChildNodes()) {
            /* If the prompt node already contains children,
                the cursor is placed at the end of the prompt node */
            range = documentReference.createRange();
            range.selectNodeContents(this.promptNode);
            range.collapse(false);

            selection = documentReference.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
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

    Console.prototype.promptForInputRepeat = function(repeatCallback, inputCallback) {
        var selfReference = this;

        function inputIteration(promptContent) {
            if (repeatCallback.call(null, promptContent)) {
                inputCallback.call(null, promptContent);
            } else {
                selfReference.promptForInput(inputIteration);
            }
        }

        selfReference.promptForInput(inputIteration);
    };

    Console.prototype.promptForKeypress = function(keyCode, keyCallback) {
        function handleKeypress(event) {
            if (event.keyCode === keyCode) {
                // Remove the event listener and invoke the keyboard event
                documentReference.removeEventListener('keypress', handleKeypress, false);
                keyCallback.call(null);
            }
        }

        documentReference.addEventListener('keypress', handleKeypress, false);
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

    function LocalPlayer(console, name, diceCount) {
        this.console = console;
        this.name = name;

        this.diceCount = diceCount;
        this.previousEyesList = null;
    }

    LocalPlayer.prototype.getDiceCount = function() {
        // Return the number of dice in hand
        return this.diceCount;
    };

    LocalPlayer.prototype.discardDice = function() {
        if (this.diceCount > 0) {
            this.previousEyesList = null;
            this.diceCount--;
        }
    };

    LocalPlayer.prototype.rollDice = function(eyesCallback) {
        var selfReference = this,
            diceGroup = this.console.createDiceGroup(diceFrames, this.diceCount);

        this.console.createEmptyOutput(false);
        this.console.createOutput('Press <space> to roll the dice.', false);

        this.console.promptForKeypress(32, function() {
            // Roll the dice when space is pressed
            diceGroup.roll(20, 100, function(eyesList) {
                selfReference.previousEyesList = eyesList.slice();
                eyesCallback.call(null, eyesList);
            });
        });
    };

    LocalPlayer.prototype.estimateEyes = function(
        estimatedEyesList,
        opponentList,
        wildcardEnabled,
        eyesCallback
    ) {
        //
    };

    LocalPlayer.prototype.evaluateEstimate = function(
        estimatedEyesList,
        opponentList,
        wildcardEnabled,
        verdictCallback
    ) {
        //
    };

    function SimulatedPlayer(name, diceCount) {
        this.name = name;
        this.diceCount = diceCount;
        this.previousEyesList = null;
    }

    // Based upon http://bit.ly/2jtJsl1, values were calculated with R 3.3.2
    SimulatedPlayer.probabilityTable = [
        [ 0.17 ],
        [ 0.31, 0.03 ],
        [ 0.42, 0.07 ],
        [ 0.52, 0.13, 0.02 ],
        [ 0.60, 0.20, 0.04 ],
        [ 0.67, 0.26, 0.06, 0.01 ],
        [ 0.72, 0.33, 0.10, 0.02 ],
        [ 0.77, 0.40, 0.13, 0.03 ],
        [ 0.81, 0.46, 0.18, 0.05, 0.01 ],
        [ 0.84, 0.52, 0.22, 0.07, 0.02 ],
        [ 0.87, 0.57, 0.27, 0.10, 0.02 ],
        [ 0.89, 0.62, 0.32, 0.13, 0.04, 0.01 ],
        [ 0.91, 0.66, 0.37, 0.16, 0.05, 0.01 ],
        [ 0.92, 0.70, 0.42, 0.19, 0.07, 0.02 ],
        [ 0.94, 0.74, 0.47, 0.23, 0.09, 0.03, 0.01 ],
        [ 0.95, 0.77, 0.51, 0.27, 0.11, 0.04, 0.01 ],
        [ 0.95, 0.80, 0.56, 0.31, 0.14, 0.05, 0.01 ],
        [ 0.96, 0.83, 0.60, 0.35, 0.17, 0.07, 0.02, 0.01 ],
        [ 0.97, 0.85, 0.64, 0.39, 0.20, 0.08, 0.03, 0.01 ],
        [ 0.97, 0.87, 0.67, 0.43, 0.23, 0.10, 0.04, 0.01 ],
        [ 0.98, 0.89, 0.70, 0.47, 0.26, 0.12, 0.05, 0.02 ],
        [ 0.98, 0.90, 0.73, 0.51, 0.30, 0.15, 0.06, 0.02, 0.01 ],
        [ 0.98, 0.92, 0.76, 0.55, 0.33, 0.17, 0.07, 0.03, 0.01 ],
        [ 0.99, 0.93, 0.79, 0.58, 0.37, 0.20, 0.09, 0.04, 0.01 ],
        [ 0.99, 0.94, 0.81, 0.62, 0.41, 0.23, 0.11, 0.04, 0.02 ]
    ];

    SimulatedPlayer.wildcardProbabilityTable = [
        [ 0.33 ],
        [ 0.56, 0.11 ],
        [ 0.70, 0.26, 0.04 ],
        [ 0.80, 0.41, 0.11, 0.01 ],
        [ 0.87, 0.54, 0.21, 0.05 ],
        [ 0.91, 0.65, 0.32, 0.10, 0.02 ],
        [ 0.94, 0.74, 0.43, 0.17, 0.05, 0.01 ],
        [ 0.96, 0.80, 0.53, 0.26, 0.09, 0.02 ],
        [ 0.97, 0.86, 0.62, 0.35, 0.14, 0.04, 0.01 ],
        [ 0.98, 0.90, 0.70, 0.44, 0.21, 0.08, 0.02 ],
        [ 0.99, 0.92, 0.77, 0.53, 0.29, 0.12, 0.04, 0.01 ],
        [ 0.99, 0.95, 0.82, 0.61, 0.37, 0.18, 0.07, 0.02 ],
        [ 0.99, 0.96, 0.86, 0.68, 0.45, 0.24, 0.10, 0.03, 0.01 ],
        [ 1.00, 0.97, 0.89, 0.74, 0.52, 0.31, 0.15, 0.06, 0.02 ],
        [ 1.00, 0.98, 0.92, 0.79, 0.60, 0.38, 0.20, 0.09, 0.03, 0.01 ],
        [ 1.00, 0.99, 0.94, 0.83, 0.66, 0.45, 0.26, 0.13, 0.05, 0.02 ],
        [ 1.00, 0.99, 0.96, 0.87, 0.72, 0.52, 0.33, 0.17, 0.08, 0.03, 0.01 ],
        [ 1.00, 0.99, 0.97, 0.90, 0.77, 0.59, 0.39, 0.22, 0.11, 0.04, 0.01 ],
        [ 1.00, 1.00, 0.98, 0.92, 0.81, 0.65, 0.46, 0.28, 0.15, 0.06, 0.02, 0.01 ],
        [ 1.00, 1.00, 0.98, 0.94, 0.85, 0.70, 0.52, 0.34, 0.19, 0.09, 0.04, 0.01 ],
        [ 1.00, 1.00, 0.99, 0.95, 0.88, 0.75, 0.58, 0.40, 0.24, 0.12, 0.06, 0.02, 0.01 ],
        [ 1.00, 1.00, 0.99, 0.96, 0.90, 0.79, 0.64, 0.46, 0.29, 0.16, 0.08, 0.03, 0.01 ],
        [ 1.00, 1.00, 0.99, 0.97, 0.92, 0.83, 0.69, 0.52, 0.35, 0.21, 0.11, 0.05, 0.02, 0.01 ],
        [ 1.00, 1.00, 1.00, 0.98, 0.94, 0.86, 0.74, 0.58, 0.41, 0.25, 0.14, 0.07, 0.03, 0.01 ],
        [ 1.00, 1.00, 1.00, 0.99, 0.95, 0.89, 0.78, 0.63, 0.46, 0.30, 0.18, 0.09, 0.04, 0.02, 0.01 ]
    ];

    SimulatedPlayer.lookupProbability = function(
        opponentDiceCount,
        estimatedEyesCount,
        wildcardEnabled
    ) {
        var probability,
            probabilityTable,
            probabilityTableIndex,
            probabilityList,
            probabilityListIndex;

        if (estimatedEyesCount > 0) {
            probabilityTable = (
                wildcardEnabled
                    ? SimulatedPlayer.wildcardProbabilityTable
                    : SimulatedPlayer.probabilityTable
            );

            // Default to zero if a probability cannot be found
            probability = 0;
            probabilityTableIndex = (opponentDiceCount - 1);

            if ((probabilityTableIndex >= 0)
                    && (probabilityTableIndex < probabilityTable.length)) {
                probabilityList = probabilityTable[probabilityTableIndex];
                probabilityListIndex = (estimatedEyesCount - 1);

                ((probabilityListIndex < probabilityList.length)
                    && (probability = probabilityList[probabilityListIndex]));
            }

        } else {
            // Empty conditions are considered true
            probability = 1;
        }

        return probability;
    };

    // Need some method to reduce the estimate by taking the previous eyes into account!
    // Probably best to do that with the earlier method!

    SimulatedPlayer.prototype.getDiceCount = function() {
        // Return the number of dice in hand
        return this.diceCount;
    };

    SimulatedPlayer.prototype.discardDice = function() {
        if (this.diceCount > 0) {
            this.previousEyesList = null;
            this.diceCount--;
        }
    };

    SimulatedPlayer.prototype.rollDice = function(eyesCallback) {
        var selfReference = this,
            eyesList = [],
            eyes,
            diceIndex;

        for (diceIndex = 0; (diceIndex < this.diceCount); diceIndex++) {
            // Randomly generate a number of eyes
            eyes = (Math.floor((Math.random() * 6)) + 1);
            eyesList.push(eyes);
        }

        // Invoke the eyes callback in the next cycle
        windowReference.setTimeout(function() {
            selfReference.previousEyesList = eyesList.slice();
            eyesCallback.call(null, eyesList);
        });
    };

    SimulatedPlayer.prototype.estimateEyes = function(
        estimatedEyesList,
        opponentList,
        wildcardEnabled,
        eyesCallback
    ) {
        var estimatedEyesCount = estimatedEyesList.length,
            estimatedEyesGroups,
            estimatedEyesIndex,
            estimatedEyes;

        if (estimatedEyesCount) {
            // Count the number of dice for each number of eyes
            estimatedEyesGroups = [ 0, 0, 0, 0, 0, 0 ];

            for (estimatedEyesIndex = 0;
                    (estimatedEyesIndex < estimatedEyesCount);
                    estimatedEyesIndex++) {
                estimatedEyes = estimatedEyesList[estimatedEyesIndex];
                estimatedEyesGroups[(estimatedEyes - 1)]++;
            }
        }

        // First up eyes counts, where possible, because those are "free"
        //
    };

    SimulatedPlayer.prototype.evaluateEstimate = function(
        estimatedEyesList,
        opponentList,
        wildcardEnabled,
        verdictCallback
    ) {
        var opponentDiceCount,
            opponentCount,
            opponentIndex,
            matchedEyesCount,
            previousEyesList,
            previousEyesCount,
            previousEyesIndex,
            previousEyes,
            estimatedEyesCount,
            estimatedEyesIndex,
            estimatedEyes,
            estimateProbability;

        if (this.diceCount < 1) {
            throw new Error('Player must have at least one dice');
        }

        opponentCount = opponentList.length;
        opponentDiceCount = 0;

        // Calculate the total number of dice in the opponents' hands
        for (opponentIndex = 0; (opponentIndex < opponentCount); opponentIndex++) {
            opponentDiceCount += opponentList[opponentIndex].getDiceCount();
        }

        if (opponentDiceCount < 1) {
            throw new Error('Opponents must have at least one dice');
        }

        estimatedEyesCount = estimatedEyesList.length;

        if (this.previousEyesList !== null) {
            matchedEyesCount = 0;

            /* The built-in comparison method is used
                (instead of a numeric comparison method)
                because the eyes list contains only single digits
                and, for single digits, the character point-based sort
                will result in the same sorted list */
            previousEyesList = this.previousEyesList.slice().sort();
            previousEyesCount = previousEyesList.length;
            previousEyesIndex = (previousEyesCount - 1);

            estimatedEyesList = estimatedEyesList.slice().sort();
            estimatedEyesIndex = (estimatedEyesCount - 1);

            /* The lists are compared in reverse so that the ones (the wildcards)
                amongst the previous eyes are encountered last,
                at which point they can be substituted for any of the estimated eyes
                (based upon http://stackoverflow.com/a/1885660) */
            while ((previousEyesIndex > 0) && (estimatedEyesIndex > 0)) {
                previousEyes = previousEyesList[previousEyesIndex];
                estimatedEyes = estimatedEyesList[estimatedEyesIndex];

                if ((previousEyes === estimatedEyes)
                        || (wildcardEnabled && (previousEyes === 1))) {
                    previousEyesIndex--;
                    estimatedEyesIndex--;
                    matchedEyesCount++;

                } else if (previousEyes > estimatedEyes) {
                    previousEyesIndex--;
                } else {
                    estimatedEyesIndex--;
                }
            }

            /* Subtract the number of matched eyes
                from the number of estimated eyes
                because these eyes are known and should therefore
                not be factored into the probability estimate */
            estimatedEyesCount -= matchedEyesCount;
            ((estimatedEyesCount < 0) && (estimatedEyesCount = 0));

            /* If the the number of unmatched dice
                (out of the previously rolled dice)
                exceeds the number of dice whose value is unknown,
                then the estimate is certainly invalid */
            if ((previousEyesCount - matchedEyesCount) > estimatedEyesCount) {
                /* Invoke the callback "with disbelief"
                    and return to prevent the probability from being estimated */
                windowReference.setTimeout(verdictCallback.bind(null, false));
                return;
            }
        }

        estimateProbability = SimulatedPlayer.lookupProbability(
            opponentDiceCount,
            estimatedEyesCount,
            wildcardEnabled
        );

        windowReference.setTimeout(verdictCallback.bind(null,
            (Math.random() < estimateProbability)));
    };

    function Game(console, players) {
        this.console = console;
        this.players = players;

        // Limits: allow a maximum of five dice per player, and a maximum of six players (max 25 dice in game, outside of own hand)
    };

    //

    var consoleNode = documentReference.querySelector('.console');

    if (consoleNode) {
        // Begin examples
        var consoleEmulator = new Console(consoleNode, 72, 18, 72),
            game = new Game(consoleEmulator, []),
            localPlayer = new LocalPlayer(consoleEmulator, 'Joran', 5),
            simulatedPlayer = new SimulatedPlayer('Chan', 5);

        simulatedPlayer.rollDice(function(eyes) {});

        localPlayer.rollDice(function(eyes) {
            simulatedPlayer.evaluateEstimate(eyes, [ localPlayer ], true, function(verdict) {
                console.log(verdict);
            });
        });

    }


})(window, document);
