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
 * @fileoverview Used to represent selection range for node.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.primitives.NodeSelectionRange');

/**
 * @param {pwk.Line} startLine
 * @param {number} startLineOffset
 * @param {pwk.Line} endLine
 * @param {number} endLineOffset
 * @constructor
 */
pwk.primitives.NodeSelectionRange = function(startLine, startLineOffset,
                                             endLine, endLineOffset) {
  /**
   * @type {pwk.Line}
   * @public
   */
  this.startLine = startLine;

  /**
   * @type {number}
   * @public
   */
  this.startLineOffset = startLineOffset;

  /**
   * @type {pwk.Line}
   * @public
   */
  this.endLine = endLine;

  /**
   * @type {number}
   * @public
   */
  this.endLineOffset = endLineOffset;
};

/**
 * @return {boolean}
 */
pwk.primitives.NodeSelectionRange.prototype.isCollapsed = function() {
  return this.startLine === this.endLine &&
         this.startLineOffset === this.endLineOffset;
};

/**
 * Compare two NodeSelectionRange objects.
 * @param {pwk.primitives.NodeSelectionRange} otherNodeSelectionRange
 * @return {boolean}
 */
pwk.primitives.NodeSelectionRange.prototype.equals = function(
    otherNodeSelectionRange) {
  return (otherNodeSelectionRange.startLine == this.startLine &&
          otherNodeSelectionRange.endLine == this.endLine &&
          otherNodeSelectionRange.startLineOffset == this.startLineOffset &&
          otherNodeSelectionRange.endLineOffset == this.endLineOffset);
};
