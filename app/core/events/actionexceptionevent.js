goog.provide('app.core.events.ActionExceptionEvent');

goog.require('app.core.events.ActionEvent');


/**
 * @param {app.core.types.ActionFilterContext} actionFilterContext Current filter context
 * @param {app.core.Application} app
 * @param {Error} err
 * @extends {app.core.events.ActionEvent}
 * @constructor
 */
app.core.events.ActionExceptionEvent = function(actionFilterContext, app, err) {
    app.core.events.ActionEvent.call(this, actionFilterContext, app.core.Application.EventType.ACTIONEXCEPTION, goog.nullFunction, app);

    /**
     * @type {Error}
     * @private
     */
    this.error_ = err;
};
goog.inherits(app.core.events.ActionExceptionEvent, app.core.events.ActionEvent);


/**
 * @return {Error}
 */
app.core.events.ActionExceptionEvent.prototype.getError = function() {
    return this.error_;
};
