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

goog.provide('app.core.types.ActionFilterItem');

goog.require('app.core.ActionFilter');
goog.require('app.core.types.ApplicationFilterItem');

/**
 * @param {!app.core.ActionFilter} filter
 * @param {string|RegExp=} opt_route Route to watch for.
 * @param {number=} opt_order
 * @constructor
 * @extends {app.core.types.ApplicationFilterItem}
 */
app.core.types.ActionFilterItem = function(filter, opt_route, opt_order) {
  app.core.types.ActionFilterItem.base(this, 'constructor', filter, opt_order);

  /**
   * @type {string|RegExp}
   * @private
   */
  this.route_ = goog.isDefAndNotNull(opt_route) ? opt_route : '';
};
goog.inherits(app.core.types.ActionFilterItem,
              app.core.types.ApplicationFilterItem);

/**
 * @return {string|RegExp}
 */
app.core.types.ActionFilterItem.prototype.getRoute = function() {
  return this.route_;
};
