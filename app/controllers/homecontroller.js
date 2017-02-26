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

goog.provide('app.controllers.HomeController');

goog.require('app.core.Controller');
goog.require('pwk.Editor');
goog.require('pwk.EditorContainer');

/**
 * @constructor
 * @extends {app.core.Controller}
 */
app.controllers.HomeController = function() {
  app.controllers.HomeController.base(this, 'constructor', 'HomeController');
};
goog.inherits(app.controllers.HomeController, app.core.Controller);

/**
 * index action
 * @param {app.core.Request} request
 * @param {app.core.Response} response
 */
app.controllers.HomeController.prototype.index = function(request, response) {
  var editor = new pwk.Editor();
  var container = new pwk.EditorContainer();

  container.addChild(editor, true);
  container.render(document.body);
};

goog.exportProperty(app.controllers.HomeController.prototype, 'index',
                    app.controllers.HomeController.prototype.index);
