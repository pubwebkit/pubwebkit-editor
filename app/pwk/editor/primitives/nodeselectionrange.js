/**
 * @fileoverview
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.primitives.NodeSelectionRange');


/**
 * @param {pwk.Line} startLine
 * @param {number} startLineOffset
 * @param {pwk.Line} endLine
 * @param {number} endLineOffset
 * @constructor
 */
pwk.primitives.NodeSelectionRange = function(startLine, startLineOffset, endLine, endLineOffset) {

    /**
     * @type {pwk.Line}
     * @public
     */
    this.startLine = startLine;


    /**
     * @type {number}
     * @public
     */
    this.startLineOffset = startLineOffset;


    /**
     * @type {pwk.Line}
     * @public
     */
    this.endLine = endLine;


    /**
     * @type {number}
     * @public
     */
    this.endLineOffset = endLineOffset;
};


/**
 * @return {boolean}
 */
pwk.primitives.NodeSelectionRange.prototype.isCollapsed = function () {
    return this.startLine === this.endLine && this.startLineOffset === this.endLineOffset;
};


/**
 * @param {pwk.primitives.NodeSelectionRange} otherNodeSelectionRange
 * @return {boolean}
 */
pwk.primitives.NodeSelectionRange.prototype.equals = function(otherNodeSelectionRange) {
    return (otherNodeSelectionRange.startLine == this.startLine &&
            otherNodeSelectionRange.endLine == this.endLine &&
            otherNodeSelectionRange.startLineOffset == this.startLineOffset &&
            otherNodeSelectionRange.endLineOffset == this.endLineOffset);
};