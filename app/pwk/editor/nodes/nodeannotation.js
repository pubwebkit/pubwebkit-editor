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
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.NodeAnnotation');


/**
 * @param {string} type
 * @param {{start: number, end: number}} range
 * @constructor
 */
pwk.NodeAnnotation = function(type, range) {

    /**
     * Type of current annotation.
     *
     * @type {string}
     * @private
     */
    this.type_ = type;

    /**
     * Range offset.
     * @type {{start: number, end: number}}
     * @private
     */
    this.range_ = range;


    /**
     * @type {string}
     * @private
     */
    this.data_;
};

/**
 * Get current annotation type.
 * @return {string}
 */
pwk.NodeAnnotation.prototype.getType = function() {
    return this.type_;
};


/**
 * @return {{start: number, end: number}}
 */
pwk.NodeAnnotation.prototype.getRangeOffset = function() {
    return this.range_;
};


/**
 * @return {string}
 */
pwk.NodeAnnotation.prototype.getData = function() {
    return this.data_;
};
