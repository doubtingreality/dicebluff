'use strict';

function DiceFilter() {
    // Container for static methods
}

DiceFilter.matchEyes = function(
    targetEyesList,
    filterEyesList,
    wildcardPermitted,
    matchedEyesList, // Parameter is populated by this method (if not equal to null)
    unmatchedEyesList // Parameter is populated by this method (if not equal to null)
) {
    var pushMatchedEyes,
        pushUnmatchedEyes,
        targetEyesCount,
        targetEyesIndex,
        targetEyes,
        filterEyesCount,
        filterEyesIndex,
        filterEyes,
        wildcardOffset,
        matchedEyesCount;

    pushMatchedEyes = (matchedEyesList !== null);
    pushUnmatchedEyes = (unmatchedEyesList !== null);

    /* Duplicate and sort the lists.
        The built-in comparison method is used
        (instead of a numeric comparison method)
        because the eyes list contains only single digits
        and, for single digits, the character point-based sort
        will result in the same sorted list */
    targetEyesList = targetEyesList.slice().sort();
    targetEyesCount = targetEyesList.length;
    targetEyesIndex = (targetEyesCount - 1);

    filterEyesList = filterEyesList.slice().sort();
    filterEyesCount = filterEyesList.length;
    filterEyesIndex = (filterEyesCount - 1);

    wildcardOffset = 0;
    matchedEyesCount = 0;

    /* The lists are compared in reverse so that the wildcards
        amongst the filter eyes are encountered last
        (based on http://stackoverflow.com/a/1885660) */
    while ((targetEyesIndex >= 0) && (filterEyesIndex >= wildcardOffset)) {
        targetEyes = targetEyesList[targetEyesIndex];
        filterEyes = filterEyesList[filterEyesIndex];

        if (targetEyes === filterEyes) {
            /* Count the matched eyes
                and (optionally) push the matched eyes */
            matchedEyesCount++;
            (pushMatchedEyes && matchedEyesList.push(targetEyes));

            targetEyesIndex--;
            filterEyesIndex--;

        } else if (wildcardPermitted && (filterEyesList[wildcardOffset] === 1)) {
            /* Count the matched eyes
                and (optionally) push the matched eyes */
            matchedEyesCount++;
            (pushMatchedEyes && matchedEyesList.push(targetEyes));

            targetEyesIndex--;
            wildcardOffset++;

        } else if (targetEyes > filterEyes) {
            // (Optionally) push the unmatched eyes
            (pushUnmatchedEyes && unmatchedEyesList.push(targetEyes));
            targetEyesIndex--;

        } else {
            filterEyesIndex--;
        }
    }

    // (Optionally) push the remainder of unmatched eyes
    if (pushUnmatchedEyes) {
        while (targetEyesIndex >= 0) {
            targetEyes = targetEyesList[targetEyesIndex];
            unmatchedEyesList.push(targetEyes);
            targetEyesIndex--;
        }
    }

    return matchedEyesCount;
};
