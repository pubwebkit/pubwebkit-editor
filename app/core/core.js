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
goog.require('app.core.Application');

goog.require('app.controllers.HomeController');


/**
 * The base class.
 * This class will be exported as the main entry point.
 * @constructor
 * @extends {app.core.Application}
 */
app.Core = function() {
    goog.base(this);
};
goog.inherits(app.Core, app.core.Application);


/**
 * Kicks off the library.
 */
app.Core.prototype.init = function() {
    // -- Application initialization -- //
    // -- Register routes -- //
    // Default route should be wrapped in {.. route definition ..}
    this.mapRoute('/home', app.controllers.HomeController); // Default route

    // -- Register application filters -- //
    //this.addApplicationFilter(new hedgehog.filters.ComponentsInitializationApplicationFilter());

    // -- Register action filters -- //
    //this.addActionFilter(new hedgehog.filters.Componen tsInitializationActionFilter(), null, 0);

    // Execute application
    this.run();
};
