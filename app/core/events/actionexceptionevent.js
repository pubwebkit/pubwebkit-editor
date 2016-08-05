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

goog.provide('app.core.events.ActionExceptionEvent');

goog.require('app.core.events.ActionEvent');



/**
 * @param {app.core.types.ActionFilterContext} actionFilterContext Current
 *    filter context
 * @param {app.core.Application} app
 * @param {Error} err
 * @extends {app.core.events.ActionEvent}
 * @constructor
 */
app.core.events.ActionExceptionEvent = function(actionFilterContext, app, err) {
  app.core.events.ActionEvent.call(
      this, actionFilterContext,
      app.core.Application.EventType.ACTIONEXCEPTION, goog.nullFunction, app);

  /**
   * @type {Error}
   * @private
   */
  this.error_ = err;
};
goog.inherits(app.core.events.ActionExceptionEvent,
    app.core.events.ActionEvent);


/**
 * @return {Error}
 */
app.core.events.ActionExceptionEvent.prototype.getError = function() {
  return this.error_;
};
