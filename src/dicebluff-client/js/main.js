;(function(windowReference, documentReference) {
	'use strict';
	
	var consoleNode = documentReference.querySelector('.console');
	
	(consoleNode && attachConsole(consoleNode));
		
	function attachConsole(consoleNode) {
		var socketReference = io(),
			outputCount = 0,
			outputList = [],
			outputLookup = {},
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
			var outputNode = documentReference.createElement('div'),
				outputIdentifier = outputCount++,
				outputEntry,
				historyLimit = Math.max(0, (outputList.length - 50)),
				historyIndex,
				historyEntry;
			
			/* Remove output elements
				which exceed the maximum number of permitted elements */
			for (historyIndex = 0;
				 	(historyIndex < historyLimit);
				 	historyIndex++) {
				historyEntry = outputList[historyIndex];
				
				((outputLookup.hasOwnProperty(historyEntry.id))
					&& (delete outputLookup[historyEntry.id]));
				
				(consoleNode.contains(historyEntry.node)
					&& consoleNode.removeChild(historyEntry.node));
			}

			// Track the output node
			outputEntry = {
				id: outputIdentifier,
				node: outputNode
			};
			
			outputNode.classList.add('output');
			(fromPrompt && outputNode.classList.add('from-prompt'));
			outputNode.textContent = (output || '');
			
			outputList.push(outputEntry);
			outputLookup[outputIdentifier] = outputEntry;
			
			/* Insert the element before the prompt
				(and thereby below all other output)
				and scroll the console to the bottom */
			consoleNode.insertBefore(outputNode, promptNode);
			consoleNode.scrollTop = consoleNode.scrollHeight;
			
			return outputIdentifier;
		}
		
		function replaceOutput(lineOffset, output, fromPrompt) {
			//
		}
	}
})(window, document);
