//
// Pubwebkit editor is powerful editor to create your ebook in various styles.
// It's includes: Cover Designer, Template Editor, Community Snippets and more...
// Also, it's a part of www.pubwebkit.com portal.
// Copyright (C) 2016 Dmytro Antonenko
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
// Authors: Dmytro Antonenko
//

/**
 * @fileoverview
 * @author Dmytro Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.primitives.ClientRectRange');

/**
 * @param {number=} opt_width
 * @param {number=} opt_height
 * @param {number=} opt_top
 * @param {number=} opt_left
 * @constructor
 */
pwk.primitives.ClientRectRange = function(opt_width, opt_height, opt_top, opt_left) {

    /**
     * @type {number}
     * @public
     */
    this.width = opt_width ? opt_width : 0;

    /**
     * @type {number}
     * @public
     */
    this.height = opt_height ? opt_height : 0;

    /**
     * @type {number}
     * @public
     */
    this.left = opt_left ? opt_left : 0;

    /**
     * @type {number}
     * @public
     */
    this.top = opt_top ? opt_top : 0;
};
