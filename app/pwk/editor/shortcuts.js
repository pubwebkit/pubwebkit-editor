/**
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.Shortcuts.Default');
goog.provide('pwk.Shortcuts.MacOS');

goog.require('goog.events.KeyCodes');
goog.require('goog.ui.KeyboardShortcutHandler');


/**
 * Default editor shortcuts.
 * @enum {Array}
 */
pwk.Shortcuts.Default = {
    SAVE : ['Save', goog.events.KeyCodes.S, goog.ui.KeyboardShortcutHandler.Modifiers.CTRL],
    SELECT_ALL : ['Select_All', goog.events.KeyCodes.A, goog.ui.KeyboardShortcutHandler.Modifiers.CTRL]
};


/**
 * Global editor shortcuts.
 * @enum {Array}
 */
pwk.Shortcuts.MacOS = {
    SAVE : ['Save', goog.events.KeyCodes.S, goog.ui.KeyboardShortcutHandler.Modifiers.META],
    SELECT_ALL : ['Select_All', goog.events.KeyCodes.A, goog.ui.KeyboardShortcutHandler.Modifiers.META]
};


