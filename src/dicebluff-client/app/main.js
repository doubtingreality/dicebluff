;(function(windowReference, documentReference) {
    'use strict';

    var consoleNode = documentReference.querySelector('.console'),
        console = new Console(consoleNode, 72, 18, (18 * 10)),
        localPlayer = new LocalPlayer(console);

    localPlayer.evaluateClaim(40, [ 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4 ], [ 1, 2, 3 ], true, function() {});
})(window, document);
