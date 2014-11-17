goog.provide('app.core.types.ActionFilterContext');

/**
 * @param {app.core.Request} request
 * @param {app.core.Response} response
 * @constructor
 */
app.core.types.ActionFilterContext = function(request, response) {

    /**
     * @type {app.core.Request}
     * @private
     */
    this.request_ = request;

    /**
     * @type {app.core.Response}
     * @private
     */
    this.response_ = response;
};


/**
 * @return {app.core.Request}
 */
app.core.types.ActionFilterContext.prototype.getRequest = function() {
    return this.request_;
};


/**
 * @return {app.core.Response}
 */
app.core.types.ActionFilterContext.prototype.getResponse = function() {
    return this.response_;
};
