'use strict';

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

    document.addEventListener('DOMContentLoaded', function() {
        // Focus on the prompt when the page has loaded
        (this.promptEnabled && selfReference.focusPrompt());
    });

    function handleConsoleClick(event) {
        // TODO: Prevent this from working when we are dragging
        if (selfReference.promptNode !== document.activeElement) {
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
    var outputNode = document.createElement('div'), output;

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
    window.setTimeout((function() {
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
        window.setTimeout(
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
        range = document.createRange();
        range.selectNodeContents(this.promptNode);
        range.collapse(false);

        selection = document.getSelection();
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

        window.setTimeout(inputCallback.bind(null, promptContent));
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
            document.removeEventListener('keypress', handleKeypress, false);
            keyCallback.call(null);
        }
    }

    document.addEventListener('keypress', handleKeypress, false);
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
