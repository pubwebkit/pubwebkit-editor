/**
 * @fileoverview The core class of the application.
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('app.Core');

goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('pwk.EditorContainer');
goog.require('pwk.Editor');


/**
 * The base class.
 * This class will be exported as the main entry point.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
app.Core = function() {
    goog.base(this);
};
goog.inherits(app.Core, goog.events.EventTarget);


/**
 * Kicks off the library.
 */
app.Core.prototype.init = function() {

    this.dispatchEvent( app.Core.EventType.INIT );

    var editor = new pwk.Editor()
      , container = new pwk.EditorContainer();

    container.addChild(editor, true);
    container.render();
};


/**
 * Events triggered by core
 * @enum {string}
 */
app.Core.EventType = {
    INIT: goog.events.getUniqueId('init')
};
