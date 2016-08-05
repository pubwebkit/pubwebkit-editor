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

goog.provide('app.core.ApplicationFilter');


/**
 * Application filter.
 * @interface
 */
app.core.ApplicationFilter = function() {};

/**
 * Called when an application start initialization.
 * @param {goog.events.Event} e
 */
app.core.ApplicationFilter.prototype.onApplicationStart = goog.nullFunction;


/**
 * Called when an application end initialization.
 * @param {goog.events.Event} e
 */
app.core.ApplicationFilter.prototype.onApplicationRun = goog.nullFunction;


/**
 * Called when an application launched.
 * @param {goog.events.Event} e
 */
app.core.ApplicationFilter.prototype.onApplicationLoaded = goog.nullFunction;
