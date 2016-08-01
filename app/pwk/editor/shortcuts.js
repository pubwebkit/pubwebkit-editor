//
// Pubwebkit editor is powerful editor to create your ebook in various styles.
// It's includes: Cover Designer, Template Editor, Community Snippets and more...
// Also, it's a part of www.pubwebkit.com portal.
// Copyright (C) 2016 Dmytro Antonenko
//
// This file is part of Pubwebkit editor
//
// Pubwebkit editor is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License as published by the Free
// Software Foundation, version 3
//
// Pubwebkit editor is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE.
//
// See the GNU Affero General Public License for more details. You should have received
// a copy of the GNU General Public License along with Hatch.js. If not, see
// <http://www.gnu.org/licenses/>.
//
// Authors: Dmytro Antonenko
//

/**
 * @author Dmytro Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.Shortcuts.Default');
goog.provide('pwk.Shortcuts.MacOS');

goog.require('goog.events.KeyCodes');
goog.require('goog.ui.KeyboardShortcutHandler');

/**
 * Get command button for current OS
 * @type {goog.ui.KeyboardShortcutHandler.Modifiers}
 */
pwk.Shortcuts.CMD_BUTTON = (function(){
    if(goog.userAgent.MAC) {
        return goog.ui.KeyboardShortcutHandler.Modifiers.META;
    } else {
        return goog.ui.KeyboardShortcutHandler.Modifiers.CTRL;
    }
})();

/**
 * Default editor shortcuts.
 * @enum {Array}
 */
pwk.Shortcuts.Default = {
    SAVE : ['Save', goog.events.KeyCodes.S, pwk.Shortcuts.CMD_BUTTON],
    SELECT_ALL : ['Select_All', goog.events.KeyCodes.A, pwk.Shortcuts.CMD_BUTTON]
};
