/**
 * @fileoverview The action filter is a class with specific events that you can apply to a controller action or an entire
 * controller that modifies the way in which the action is executed.
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('app.core.ActionFilter');


/**
 * Action filter.
 * @interface
 */
app.core.ActionFilter = function() {};

/**
 * Controller that will be processed by this filter.
 * @return {string|RegExp}
 */
app.core.ActionFilter.prototype.getController = goog.abstractMethod;

/**
 * Action that will be processed by this filter.
 * @return {string|RegExp}
 */
app.core.ActionFilter.prototype.getAction = goog.abstractMethod;

/**
 * Called when an unhandled exception occurs in the action.
 * @param {app.core.events.ActionExceptionEvent} e
 */
app.core.ActionFilter.prototype.onException = goog.nullFunction;

/**
 * Called before the action method is invoked.
 * @param {app.core.events.ActionEvent} e
 */
app.core.ActionFilter.prototype.onActionExecuting = goog.nullFunction;


/**
 * Called after the action method is invoked.
 * @param {app.core.events.ActionEvent} e
 */
app.core.ActionFilter.prototype.onActionExecuted = goog.nullFunction;
