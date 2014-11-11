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


/**
 * The multistep() function accepts three arguments: an array of functions to execute, an array of arguments to pass
 * into each function when it executes, and a callback function to call when the process is complete.
 * @param {Array.<function()>} steps
 * @param {Array=} args
 * @param {function()=} callback
 * @param {Object=} opt_scope
 */
pwk.multistep = function(steps, args, callback, opt_scope) {
    var tasks = steps.concat(); //clone the array

    setTimeout( function() {

        //execute the next task
        var task = tasks.shift();
        task.apply(opt_scope, args || []);
            //determine if there's more
            if (tasks.length > 0) {
                setTimeout(arguments.callee, 25);
            } else {
                if(callback != null) {
                    callback.call(opt_scope);
                }
            }
    }, 25);
};

// Export
goog.exportSymbol('pwk.Init', pwk.init);
