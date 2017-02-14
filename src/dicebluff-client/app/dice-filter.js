'use strict';

function DiceFilter() {
    // Container for static methods
}

DiceFilter.matchEyes = function(
    filterEyesList,
    targetEyesList,
    wildcardPermitted,
    matchedEyesList, // Parameter is populated by this method (if not equal to null)
    unmatchedEyesList // Parameter is populated by this method (if not equal to null)
) {
    var pushMatchedEyes,
        pushUnmatchedEyes,
        filterEyesCount,
        filterEyesIndex,
        filterEyes,
        targetEyesCount,
        targetEyesIndex,
        targetEyes,
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
    filterEyesList = filterEyesList.slice().sort();
    filterEyesCount = filterEyesList.length;
    filterEyesIndex = (filterEyesCount - 1);

    targetEyesList = targetEyesList.slice().sort();
    targetEyesCount = targetEyesList.length;
    targetEyesIndex = (targetEyesCount - 1);

    wildcardOffset = 0;
    matchedEyesCount = 0;

    /* The lists are compared in reverse so that the wildcards
        amongst the filter eyes are encountered last
        (based on http://stackoverflow.com/a/1885660) */
    while ((filterEyesIndex >= wildcardOffset) && (targetEyesIndex >= 0)) {
        filterEyes = filterEyesList[filterEyesIndex];
        targetEyes = targetEyesList[targetEyesIndex];

        if (filterEyes === targetEyes) {
            /* Count the matched eyes
                and (optionally) push the matched eyes */
            matchedEyesCount++;
            (pushMatchedEyes && matchedEyesList.push(filterEyes));
            filterEyesIndex--;
            targetEyesIndex--;

        } else if (wildcardPermitted && (filterEyesList[wildcardOffset] === 1)) {
            /* Count the matched eyes
                and (optionally) push the matched wildcard */
            matchedEyesCount++;
            (pushMatchedEyes && matchedEyesList.push(1));
            targetEyesIndex--;
            wildcardOffset++;

        } else if (filterEyes > targetEyes) {
            // (Optionally) push the unmatched eyes
            (pushUnmatchedEyes && unmatchedEyesList.push(filterEyes));
            filterEyesIndex--;

        } else {
            targetEyesIndex--;
        }
    }

    // (Optionally) push the remainder of unmatched eyes
    if (pushUnmatchedEyes) {
        while (filterEyesIndex >= wildcardOffset) {
            filterEyes = filterEyesList[filterEyesIndex];
            unmatchedEyesList.push(filterEyes);
            filterEyesIndex--;
        }
    }

    return matchedEyesCount;
};
