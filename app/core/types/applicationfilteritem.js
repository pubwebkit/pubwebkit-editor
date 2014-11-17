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

goog.provide('app.core.types.ApplicationFilterItem');


/**
 * @param {!app.core.ApplicationFilter|T} filter
 * @param {number=} order
 * @constructor
 * @template T
 */
app.core.types.ApplicationFilterItem = function(filter, order) {

    /**
     * @type {!app.core.ApplicationFilter|T}
     * @private
     */
    this.filter_ = filter;

    /**
     * @type {number}
     * @private
     */
    this.order_ = goog.isDefAndNotNull(order) ? order : 0;
};


/**
 * @return {!app.core.ApplicationFilter|T}
 */
app.core.types.ApplicationFilterItem.prototype.getFilter = function() {
    return this.filter_;
};


/**
 * @return {number}
 */
app.core.types.ApplicationFilterItem.prototype.getOrder = function() {
    return this.order_;
};
