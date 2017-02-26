//
// Pubwebkit editor is powerful editor to create your ebook in various styles.
// It's includes: Cover Designer, Template Editor, Community Snippets and more.
// Also, it's a part of www.pubwebkit.com portal.
// Copyright (C) 2016 Dmytro Antonenko
//
// This file is part of Pubwebkit editor
//
// Pubwebkit editor is free software: you can redistribute it and/or modify it
// under  the terms of the GNU Affero General Public License as published by the
// Free Software Foundation, version 3
//
// Pubwebkit editor is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// See the GNU Affero General Public License for more details. You should have
// received a copy of the GNU General Public License along with Hatch.js. If
// not, see <http://www.gnu.org/licenses/>.
//
// Authors: Dmytro Antonenko
//

goog.provide('app.controllers.HelloController');

goog.require('app.core.Controller');
    goog.require('pwk.Editor');
goog.require('pwk.EditorContainer');

/**
 * @constructor
 * @extends {app.core.Controller}
 */
app.controllers.HelloController = function() {
      goog.base(this, 'HelloController');
};

goog.inherits(app.controllers.HelloController, app.core.Controller);


/**
 * index action
 * @param {app.core.Request} request
 * @param {app.core.Response} response
 */
app.controllers.HelloController.prototype.index = function(request, response) {
  console.log('Hello');
};

goog.exportProperty(app.controllers.HelloController.prototype, 'index',
    app.controllers.HelloController.prototype.index);
