;(function(windowReference, documentReference) {
	'use strict';
	
	var spinnerFrames = [
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
		
		function appendOutputMultiple(output, fromPrompt) {
			var outputLength = output.length, outputIndex;
			
			for (outputIndex = 0; (outputIndex < outputLength); outputIndex++) {
				appendOutput(output[outputIndex], fromPrompt);
			}
		}
		
		function replaceOutput(outputIdentifier,
				output, fromPrompt, fromPosition, toPosition) {
			
			var outputEntry,
				outputNode,
				outputText,
				beforeOutputText,
				afterOutputText;
			
			if (outputLookup.hasOwnProperty(outputIdentifier)) {
				outputEntry = outputLookup[outputIdentifier];
				outputNode = outputEntry.node;
				
				if (fromPrompt !== outputNode.classList.contains('from-prompt')) {
					outputNode.classList.toggle('from-prompt');
				}
				
				output = (output || '');
				
				if (typeof fromPosition !== 'undefined') {
					((typeof toPosition === 'undefined')
						&& (toPosition = (fromPosition + (output.length - 1))));
					
					outputText = outputNode.textContent;
					beforeOutputText = outputText.slice(0,
						Math.max((fromPosition - 1), 0));
					afterOutputText = outputText.slice(
						Math.max((toPosition + 1), 0));
					
					outputNode.textContent = (beforeOutputText
						+ output
						+ afterOutputText);
					
				} else {
					outputNode.textContent = output;
				}
			}
		}
		
		function replaceOutputMultiple(outputIdentifierOffset,
				output, fromPrompt, fromPosition, toPosition) {
			
			var outputLength = output.length,
				outputIndex;
			
			for (outputIndex = 0;
				 	(outputIndex < outputLength);
				 	outputIndex++) {
				// Replace each (partial) line
				replaceOutput(
					(outputIdentifierOffset + outputIndex),
					output[outputIndex],
					fromPrompt,
					fromPosition,
					toPosition
				);
			}
		}
		
		function createSpinner(outputIdentifier) {
			var spinnerFrameCount = spinnerFrames.length,
				spinnerFrameIndex = 0,
				spinnerInterval;
			
			function firstFrame() {
				replaceOutput(outputIdentifier,
					spinnerFrames[spinnerFrameIndex++], false, 0, -1); // Insert
				((spinnerFrameIndex >= spinnerFrameCount)
					&& (spinnerFrameIndex = 0));
			}
			
			function nextFrame() {
				if (typeof outputLookup[outputIdentifier] !== 'undefined') {
					replaceOutput(outputIdentifier,
					spinnerFrames[spinnerFrameIndex++], false, 0); // Override
					((spinnerFrameIndex >= spinnerFrameCount)
						&& (spinnerFrameIndex = 0));
					
				} else {
					// Remove the spinner if the output does not exist
					destroySpinner(outputIdentifier, spinnerInterval);
				}
			}

			// Setup animation
			firstFrame();
			spinnerInterval = windowReference.setInterval(nextFrame, 150);
			return spinnerInterval;
		}
		
		function destroySpinner(outputIdentifier, spinnerInterval) {
			windowReference.clearInterval(spinnerInterval);
			replaceOutput(outputIdentifier, null, false, 0,
				(spinnerFrames[0].length - 1));
		}
		
		//
		
		appendOutput('Waiting for socket...', false);
		createSpinner(0);
		
		
		
		//
		
		
	}
})(window, document);
