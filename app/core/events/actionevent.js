goog.provide('app.core.events.ActionEvent');

goog.require('goog.events.Event');
goog.require('app.core.types.ActionFilterContext');


/**
 * A base class for controller actions events.
 * @param {app.core.types.ActionFilterContext} actionFilterContext Current filter context
 * @param {string|!goog.events.EventId} type Event Type.
 * @param {Function} resolve Promise resolver function.
 * @param {Object=} opt_target Reference to the object that is the target of
 *     this event. It has to implement the {@code EventTarget} interface
 *     declared at {@link http://developer.mozilla.org/en/DOM/EventTarget}.
 * @extends {goog.events.Event}
 * @constructor
 */
app.core.events.ActionEvent = function(actionFilterContext, type, resolve, opt_target) {
    goog.events.Event.call(this, type, opt_target);

    /**
     * @type {app.core.types.ActionFilterContext}
     * @private
     */
    this.actionFilterContext_ = actionFilterContext;

    /**
     * @type {Function}
     * @private
     */
    this.promiseResolve_ = resolve;
};
goog.inherits(app.core.events.ActionEvent, goog.events.Event);


/**
 * @return {app.core.types.ActionFilterContext}
 */
app.core.events.ActionEvent.prototype.getContext = function() {
    return this.actionFilterContext_;
};

/**
 * Resolve promise
 */
app.core.events.ActionEvent.prototype.resolvePromise = function() {
    if(goog.isFunction(this.promiseResolve_)) {
        this.promiseResolve_();
    }
};
