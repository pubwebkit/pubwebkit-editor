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
 * @fileoverview Represent class to store line offset information.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.LineOffsetInfo');


/**
 * Store line offset information.
 * @constructor
 */
pwk.LineOffsetInfo = function() {

  /**
   * @type {number}
   * @private
   */
  this.lineIndex;

  /**
   * @type {pwk.Line}
   * @private
   */
  this.line;

  /**
   * @type {number}
   * @private
   */
  this.lineOffset;

  /**
   * @type {number}
   * @private
   */
  this.nodeOffset;

  /**
   * @type {number}
   * @private
   */
  this.lineLength;

  /**
   * @type {number}
   * @private
   */
  this.linkedNodeOffset;
};


/**
 * Get line index.
 * @return {number}
 */
pwk.LineOffsetInfo.prototype.getLineIndex = function() {
  return this.lineIndex;
};


/**
 * Set line index.
 * @param value Line index value.
 */
pwk.LineOffsetInfo.prototype.setLineIndex = function(value) {
  this.lineIndex = value;
};


/**
 * Get line instance {@code pwk.Line}.
 * @return {pwk.Line}
 */
pwk.LineOffsetInfo.prototype.getLine = function() {
  return this.line;
};


/**
 * Set line.
 * @param {pwk.Line} line Line instance.
 */
pwk.LineOffsetInfo.prototype.setLine = function(line) {
  return this.line = line;
};


/**
 * Get line offset.
 * @return {number}
 */
pwk.LineOffsetInfo.prototype.getLineOffset = function() {
  return this.lineOffset;
};


/**
 * Set line offset.
 * @param {number} value Line offset value.
 */
pwk.LineOffsetInfo.prototype.setLineOffset = function(value) {
  this.lineOffset = value;
};


/**
 * Get node offset.
 * @return {number}
 */
pwk.LineOffsetInfo.prototype.getNodeOffset = function() {
  return this.nodeOffset;
};


/**
 * Set node offset.
 * @param {number} value Node offset value.
 */
pwk.LineOffsetInfo.prototype.setNodeOffset = function(value) {
  this.nodeOffset = value;
};


/**
 * Get line length.
 * @return {number}
 */
pwk.LineOffsetInfo.prototype.getLineLength = function() {
  return this.lineLength;
};


/**
 * Set line length.
 * @param {number} value Line length value.
 */
pwk.LineOffsetInfo.prototype.setLineLength = function(value) {
  this.lineLength = value;
};


/**
 * Current offset pointing to the end of line?
 * @return {boolean}
 */
pwk.LineOffsetInfo.prototype.isEndOfLine = function() {
  return this.lineOffset > 0 ?
    this.lineLength == this.lineOffset :
    ((this.lineLength - 1) == 0)
};


/**
 * Get linked node offset.
 * @return {number}
 */
pwk.LineOffsetInfo.prototype.getLinkedNodeOffset = function() {
  return this.linkedNodeOffset;
};


/**
 * Set node offset.
 * @param {number} value Linked node offset value.
 */
pwk.LineOffsetInfo.prototype.setLinkedNodeOffset = function(value) {
  this.linkedNodeOffset = value;
};
