'use strict';

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

Loader.frames = [
    '(•   ) ',
    '( •  ) ',
    '(  • ) ',
    '(   •) ',
    '(  • ) ',
    '( •  ) '
];

Loader.prototype.enable = function(frameDuration) {
    var selfReference, frameIndex, loaderFrame;

    if (this.loaderInterval === null) {
        /* Prepend the initial frame
            (subsequent frames are replaced over it) */
        frameIndex = 0;
        loaderFrame = this.loaderFrames[frameIndex];
        this.output.prependText(loaderFrame);

        this.loaderInterval = window.setInterval((function() {
            // Loop the animation
            ((++frameIndex >= this.loaderFrames.length) && (frameIndex = 0));
            loaderFrame = this.loaderFrames[frameIndex];
            this.output.replaceText(loaderFrame, 0, loaderFrame.length);
        }).bind(this), frameDuration);
    }
};

Loader.prototype.disable = function() {
    if (this.loaderInterval !== null) {
        window.clearInterval(this.loaderInterval);
        this.loaderInterval = null;
        this.output.replaceText('', 0, this.loaderFrames[0].length);
    }
};
