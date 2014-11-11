/**
 * @fileoverview Utilities for element styles.
 *
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.utils.style');

goog.require('goog.style');

/**
 * Convert Points to Pixels
 * @param {string} pt
 * @return {string}
 */
pwk.utils.style.PointsToPixels = function(pt) {
    return pt.replace(/([0-9]+)pt/g, function(match, group0) {
        return Math.round(parseInt(group0, 10) * 96 / 72) + "px";
    })
};

