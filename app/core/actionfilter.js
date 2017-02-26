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

/**
 * @fileoverview The action filter is a class with specific events that you can
 *    apply to a controller action or an entire controller that modifies the way
 *    in which the action is executed.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('app.core.ActionFilter');

/**
 * Action filter.
 * @interface
 */
app.core.ActionFilter = function() {};

/**
 * Controller that will be processed by this filter.
 * @return {string|RegExp}
 */
app.core.ActionFilter.prototype.getController = goog.abstractMethod;

/**
 * Action that will be processed by this filter.
 * @return {string|RegExp}
 */
app.core.ActionFilter.prototype.getAction = goog.abstractMethod;

/**
 * Called when an unhandled exception occurs in the action.
 * @param {app.core.events.ActionExceptionEvent} e
 */
app.core.ActionFilter.prototype.onException = goog.nullFunction;

/**
 * Called before the action method is invoked.
 * @param {app.core.events.ActionEvent} e
 */
app.core.ActionFilter.prototype.onActionExecuting = goog.nullFunction;

/**
 * Called after the action method is invoked.
 * @param {app.core.events.ActionEvent} e
 */
app.core.ActionFilter.prototype.onActionExecuted = goog.nullFunction;
