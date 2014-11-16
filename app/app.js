/**
 * @fileoverview Main file to initialize and prepare Pwk.Editor
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk');

goog.require('goog.dom');
goog.require('pwk.EditorContainer');
goog.require('pwk.Editor');


/**
 * Initialize PWK Editor
 *
 * @param {Object=} configuration Settings for initialize Rich Editor
 */
pwk.init = function(configuration) {
    var defaultConfig = {
    };

    // Merge settings
    goog.object.extend(defaultConfig, configuration || {});

    var editor = new pwk.Editor()
      , container = new pwk.EditorContainer();

    container.addChild(editor, true);
    container.render();
};


// Export
goog.exportSymbol('pwk.Init', pwk.init);
