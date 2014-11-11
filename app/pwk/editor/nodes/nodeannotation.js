/**
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.NodeAnnotation');


/**
 * @param {string} type
 * @param {{start: number, end: number}} range
 * @constructor
 */
pwk.NodeAnnotation = function(type, range) {

    /**
     * Type of current annotation.
     *
     * @type {string}
     * @private
     */
    this.type_ = type;

    /**
     * Range offset.
     * @type {{start: number, end: number}}
     * @private
     */
    this.range_ = range;


    /**
     * @type {string}
     * @private
     */
    this.data_;
};

/**
 * Get current annotation type.
 * @return {string}
 */
pwk.NodeAnnotation.prototype.getType = function() {
    return this.type_;
};


/**
 * @return {{start: number, end: number}}
 */
pwk.NodeAnnotation.prototype.getRangeOffset = function() {
    return this.range_;
};


/**
 * @return {string}
 */
pwk.NodeAnnotation.prototype.getData = function() {
    return this.data_;
};