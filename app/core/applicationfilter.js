goog.provide('app.core.ApplicationFilter');


/**
 * Application filter.
 * @interface
 */
app.core.ApplicationFilter = function() {};

/**
 * Called when an application start initialization.
 * @param {goog.events.Event} e
 */
app.core.ApplicationFilter.prototype.onApplicationStart = goog.nullFunction;


/**
 * Called when an application end initialization.
 * @param {goog.events.Event} e
 */
app.core.ApplicationFilter.prototype.onApplicationRun = goog.nullFunction;


/**
 * Called when an application launched.
 * @param {goog.events.Event} e
 */
app.core.ApplicationFilter.prototype.onApplicationLoaded = goog.nullFunction;
