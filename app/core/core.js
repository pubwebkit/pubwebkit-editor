//
// Pubwebkit editor is powerful editor to create your ebook in various styles.
// It's includes: Cover Designer, Template Editor, Community Snippets and more...
// Also, it's a part of www.pubwebkit.com portal.
// Copyright (C) 2014 Dmitry Antonenko
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
// Authors: Dmitry Antonenko
//

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
    this.dispatchEvent(app.Core.EventType.INIT );

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
