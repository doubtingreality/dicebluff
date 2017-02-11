'use strict';

function Statistics() {
    // Container for static methods
}

Statistics.randomNormal = function() {
    /* Sample a random value from the normal distribution
        using the Box-Muller transform
        (taken from http://stackoverflow.com/a/36481059) */
    var randomUniformOne = (1 - Math.random()),
        randomUniformTwo = (1 - Math.random());

    return (Math.sqrt((-2 * Math.log(randomUniformOne)))
        * Math.cos((2 * Math.PI * randomUniformTwo)));
};
