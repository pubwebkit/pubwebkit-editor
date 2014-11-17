goog.provide('app.core.types.ActionFilterItem');

goog.require('app.core.types.ApplicationFilterItem');

/**
 * @param {!app.core.ActionFilter} filter
 * @param {string|RegExp=} route Route to watch for.
 * @param {number=} order
 * @constructor
 * @extends {app.core.types.ApplicationFilterItem}
 */
app.core.types.ActionFilterItem = function(filter, route, order) {
    goog.base(this, filter, order);


    /**
     * @type {string|RegExp}
     * @private
     */
    this.route_ = goog.isDefAndNotNull(route) ? route : '';
};
goog.inherits(app.core.types.ActionFilterItem, app.core.types.ApplicationFilterItem);


/**
 * @return {string|RegExp}
 */
app.core.types.ActionFilterItem.prototype.getRoute = function() {
    return this.route_;
};
