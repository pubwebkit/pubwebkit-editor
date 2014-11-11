/**
 * @fileoverview The default Module that all classes extend.
 *
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */


goog.provide('app.Module');

goog.require('goog.events.EventTarget');
/**
 * The basic Module class
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.Module = function() {
  goog.base(this);
};

goog.inherits(app.Module, goog.events.EventTarget);

