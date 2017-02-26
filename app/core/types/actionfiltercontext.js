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

goog.provide('app.core.types.ActionFilterContext');

/**
 * @param {app.core.Request} request
 * @param {app.core.Response} response
 * @constructor
 */
app.core.types.ActionFilterContext = function(request, response) {

  /**
   * @type {app.core.Request}
   * @private
   */
  this.request_ = request;

  /**
   * @type {app.core.Response}
   * @private
   */
  this.response_ = response;
};

/**
 * @return {app.core.Request}
 */
app.core.types.ActionFilterContext.prototype.getRequest = function() {
  return this.request_;
};

/**
 * @return {app.core.Response}
 */
app.core.types.ActionFilterContext.prototype.getResponse = function() {
  return this.response_;
};
