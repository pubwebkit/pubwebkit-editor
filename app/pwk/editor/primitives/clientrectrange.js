/**
 * @fileoverview
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.primitives.ClientRectRange');

/**
 * @param {number=} opt_width
 * @param {number=} opt_height
 * @param {number=} opt_top
 * @param {number=} opt_left
 * @constructor
 */
pwk.primitives.ClientRectRange = function(opt_width, opt_height, opt_top, opt_left) {

    /**
     * @type {number}
     * @public
     */
    this.width = opt_width ? opt_width : 0;

    /**
     * @type {number}
     * @public
     */
    this.height = opt_height ? opt_height : 0;

    /**
     * @type {number}
     * @public
     */
    this.left = opt_left ? opt_left : 0;

    /**
     * @type {number}
     * @public
     */
    this.top = opt_top ? opt_top : 0;
};
