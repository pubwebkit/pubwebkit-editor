/**
 * @fileoverview Main file to initialize and prepare Pwk.Editor
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('app');

goog.require('app.Core');
goog.require('app.exports');

window.onload = function() {
    // Run application
    (new app.Core()).init();
};
