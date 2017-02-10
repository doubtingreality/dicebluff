'use strict';

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
    var textNode = document.createTextNode(outputText);
    this.outputNode.appendChild(textNode);
};

Output.prototype.prependText = function(outputText) {
    var textNode = document.createTextNode(outputText);

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
