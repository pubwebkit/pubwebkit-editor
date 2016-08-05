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

goog.provide('app.core.events.ActionEvent');

goog.require('app.core.types.ActionFilterContext');
goog.require('goog.events.Event');



/**
 * A base class for controller actions events.
 * @param {app.core.types.ActionFilterContext} actionFilterContext Current
 *    filter context.
 * @param {string|!goog.events.EventId} type Event Type.
 * @param {Function} resolve Promise resolver function.
 * @param {Object=} opt_target Reference to the object that is the target of
 *    this event. It has to implement the {@code EventTarget} interface
 *    declared at {@link http://developer.mozilla.org/en/DOM/EventTarget}.
 * @extends {goog.events.Event}
 * @constructor
 */
app.core.events.ActionEvent = function(actionFilterContext, type, resolve,
                                       opt_target) {
  goog.events.Event.call(this, type, opt_target);

  /**
   * @type {app.core.types.ActionFilterContext}
   * @private
   */
  this.actionFilterContext_ = actionFilterContext;

  /**
   * @type {Function}
   * @private
   */
  this.promiseResolve_ = resolve;
};
goog.inherits(app.core.events.ActionEvent, goog.events.Event);


/**
 * @return {app.core.types.ActionFilterContext}
 */
app.core.events.ActionEvent.prototype.getContext = function() {
  return this.actionFilterContext_;
};


/**
 * Resolve promise
 */
app.core.events.ActionEvent.prototype.resolvePromise = function() {
  if (goog.isFunction(this.promiseResolve_)) {
    this.promiseResolve_();
  }
};
