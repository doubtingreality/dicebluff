;(function(windowReference, documentReference) {
	'use strict';
	
	var consoleNode = documentReference.querySelector('.console');
	
	(consoleNode && attachConsole(consoleNode));
		
	function attachConsole(consoleNode) {
		var socketReference = io(),
			outputCount = 0,
			promptNode = consoleNode.querySelector('.prompt');
		
		socketReference.on('connect', function() {
			//
		});
		
		socketReference.on('disconnect', function() {
			//
		});
		
		consoleNode.addEventListener('click', function(event) {
			if (promptNode !== documentReference.activeElement) {
				event.preventDefault();
				promptNode.focus();
			}
		});

		consoleNode.addEventListener('touchstart', function(event) {
			if (promptNode !== documentReference.activeElement) {
				event.preventDefault();
				promptNode.focus();
			}
		});

		promptNode.addEventListener('keypress', function(event) {
			// Enter
			if (13 === event.which) {
				// Prevent line break
				event.preventDefault();
				flushPrompt();
			}
		});
		
		function enablePrompt() {
			// Show and enable the prompt
			promptNode.hidden = false;
			promptNode.contentEditable = true;
		}
		
		function disablePrompt() {
			// Hide and disable the prompt
			promptNode.hidden = true;
			promptNode.contentEditable = false;
		}
		
		function flushPrompt() {
			var promptContent;
			
			/* Store and clear the prompt contents
				before appending them to the output */
			promptContent = promptNode.textContent;
			promptNode.textContent = '';
			
			return appendOutput(promptContent, true);
		}
		
		function appendOutput(output, fromPrompt) {
			var outputNodes = consoleNode.getElementsByClassName('output'),
				stageOutputNode = documentReference.createElement('div'),
				stageOutputIdentifier = outputCount++,
				pruneLimit = Math.max(0, (outputNodes.length - 50)),
				pruneIndex;
			
			/* Remove output elements
				which exceed the maximum number of permitted elements */
			for (pruneIndex = 0; (pruneIndex < pruneLimit); pruneIndex++) {
				consoleNode.removeChild(outputNodes[pruneIndex]);
			}
			
			stageOutputNode.classList.add('output');
			stageOutputNode.dataset.outputIdentifier = stageOutputIdentifier;
			(fromPrompt && stageOutputNode.classList.add('from-prompt'));
			stageOutputNode.textContent = output;
			
			/* Insert the element before the prompt
				(and thereby below all other output)
				and scroll the console to the bottom */
			consoleNode.insertBefore(stageOutputNode, promptNode);
			consoleNode.scrollTop = consoleNode.scrollHeight;
			
			return stageOutputIdentifier;
		}
		
		function replaceOutput(lineOffset, output, fromPrompt) {
			//
		}
	}
})(window, document);
