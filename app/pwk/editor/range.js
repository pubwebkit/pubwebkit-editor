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
 * @fileoverview This object is used in various places to indicate a region
 * within the editor.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.Range');

goog.require('goog.events.EventTarget');



/**
 * @param {pwk.Line} startLine
 * @param {number} startNodeOffset
 * @param {pwk.Line} endLine
 * @param {number} endNodeOffset
 * @param {boolean=} opt_isStartOfStartLine
 * @param {boolean=} opt_isStartOfEndLine
 * @constructor
 * @extends {goog.events.EventTarget}
 */
pwk.Range = function(startLine,
                     startNodeOffset,
                     endLine,
                     endNodeOffset,
                     opt_isStartOfStartLine,
                     opt_isStartOfEndLine) {
  goog.events.EventTarget.call(this);

  /**
   * @type {pwk.Line}
   * @private
   */
  this.startLine_ = startLine;

  /**
   * @type {pwk.Line}
   * @private
   */
  this.endLine_ = endLine;

  /**
   * @type {pwk.LeafNode}
   * @private
   */
  this.startNode_ = startLine.getParentNode();

  /**
   * @type {pwk.LeafNode}
   * @private
   */
  this.endNode_ = endLine.getParentNode();

  /**
   * @type {number}
   * @private
   */
  this.startNodeOffset_ = startNodeOffset;

  /**
   * @type {number}
   * @private
   */
  this.endNodeOffset_ = endNodeOffset;

  /**
   * @type {?pwk.LineOffsetInfo}
   * @private
   */
  this.startLineRangeInfo_ =
      this.startNode_.getRangeInfoForOffset(startNodeOffset);

  /**
   * @type {?pwk.LineOffsetInfo}
   * @private
   */
  this.endLineRangeInfo_ = this.endNode_.getRangeInfoForOffset(endNodeOffset);

  /**
   * @type {number}
   * @private
   */
  this.startLineOffset_ = opt_isStartOfStartLine ?
      0 :
      this.startLineRangeInfo_.getLineOffset();

  /**
   * @type {number}
   * @private
   */
  this.endLineOffset_ = opt_isStartOfEndLine ?
      0 :
      this.endLineRangeInfo_.getLineOffset();

  /**
   * @type {boolean}
   * @private
   */
  this.isStartOfStartLine_ = !!opt_isStartOfStartLine;

  /**
   * @type {boolean}
   * @private
   */
  this.isStartOfEndLine_ = !!opt_isStartOfEndLine;

};
goog.inherits(pwk.Range, goog.events.EventTarget);


/**
 * @return {boolean}
 */
pwk.Range.prototype.isStartOfStartLine = function() {
  return this.isStartOfStartLine_;
};


/**
 * @return {boolean}
 */
pwk.Range.prototype.isStartOfEndLine = function() {
  return this.isStartOfEndLine_;
};


/**
 * @return {pwk.Line}
 */
pwk.Range.prototype.getStartLine = function() {
  return this.startLine_;
};


/**
 * @return {pwk.Line}
 */
pwk.Range.prototype.getEndLine = function() {
  return this.endLine_;
};


/**
 * @return {pwk.LeafNode}
 */
pwk.Range.prototype.getStartNode = function() {
  return this.startNode_;
};


/**
 * @return {pwk.LeafNode}
 */
pwk.Range.prototype.getEndNode = function() {
  return this.endNode_;
};


/**
 * @return {number}
 */
pwk.Range.prototype.getStartNodeOffset = function() {
  return this.startNodeOffset_;
};


/**
 * @return {number}
 */
pwk.Range.prototype.getEndNodeOffset = function() {
  return this.endNodeOffset_;
};


/**
 * @return {number}
 */
pwk.Range.prototype.getStartLineOffset = function() {
  return this.startLineOffset_;
};


/**
 * @return {number}
 */
pwk.Range.prototype.getEndLineOffset = function() {
  return this.endLineOffset_;
};


/**
 * @return {?pwk.LineOffsetInfo}
 */
pwk.Range.prototype.getStartLineRangeInfo = function() {
  return this.startLineRangeInfo_;
};


/**
 * @return {?pwk.LineOffsetInfo}
 */
pwk.Range.prototype.getEndLineRangeInfo = function() {
  return this.endLineRangeInfo_;
};


/**
 * @param {pwk.Line} line
 * @param {number} nodeOffset
 * @param {boolean=} opt_isStartOfLine
 */
pwk.Range.prototype.setStartPosition = function(line, nodeOffset,
                                                opt_isStartOfLine) {
  this.startNode_ = line.getParentNode();
  this.startLine_ = line;

  var rangeInfo = this.startNode_.getRangeInfoForOffset(nodeOffset);
  if (rangeInfo == null) {
    throw new Error('Passed incorrect offset!');
  }
  this.startNodeOffset_ = nodeOffset;
  this.startLineOffset_ = opt_isStartOfLine ? 0 : rangeInfo.getLineOffset();
  this.startLineRangeInfo_ = rangeInfo;
};


/**
 * @param {pwk.Line} line
 * @param {number} nodeOffset
 * @param {boolean=} opt_isStartOfLine
 */
pwk.Range.prototype.setEndPosition = function(line, nodeOffset,
                                              opt_isStartOfLine) {
  this.endNode_ = line.getParentNode();
  this.endLine_ = line;

  var rangeInfo = this.endNode_.getRangeInfoForOffset(nodeOffset);
  if (rangeInfo == null) {
    throw new Error('Passed incorrect offset!');
  }
  this.endNodeOffset_ = nodeOffset;
  this.endLineOffset_ = opt_isStartOfLine ? 0 : rangeInfo.getLineOffset();
  this.endLineRangeInfo_ = rangeInfo;
};


/**
 * @return {boolean}
 */
pwk.Range.prototype.isCollapsed = function() {
  return this.startLine_ === this.endLine_ &&
      this.startNodeOffset_ === this.endNodeOffset_;
};


/**
 * @return {boolean} Whether the selection is reversed.
 */
pwk.Range.prototype.isReversed = function() {
  if (this.startLine_ === this.endLine_) { // if it's selection inside one line
    return this.startNodeOffset_ > this.endNodeOffset_;
  } else if (this.startNode_ === this.endNode_) {
    return this.startLine_.getIndex() > this.endLine_.getIndex();
  } else {
    return this.startNode_.getIndex() > this.endNode_.getIndex();
  }
};


/**
 * Collapses the range to one of its boundary points.
 * @param {boolean} toStart Whether to collapse.
 */
pwk.Range.prototype.collapse = function(toStart) {
  toStart = !!(toStart ^ this.isReversed());

  if (toStart) {
    this.setEndPosition(this.startLine_, this.startNodeOffset_);
  } else {
    this.setStartPosition(this.endLine_, this.endNodeOffset_);
  }
};


/**
 * @param {pwk.Line} startLine
 * @param {number} startNodeOffset
 * @param {pwk.Line} endLine
 * @param {number} endNodeOffset
 * @param {boolean=} opt_isStartOfStartLine
 * @param {boolean=} opt_isStartOfEndLine
 *
 * @return {pwk.Range}
 */
pwk.Range.createFromNodes = function(startLine,
                                     startNodeOffset,
                                     endLine,
                                     endNodeOffset,
                                     opt_isStartOfStartLine,
                                     opt_isStartOfEndLine) {
  return new pwk.Range(startLine, startNodeOffset, endLine, endNodeOffset,
      opt_isStartOfStartLine, opt_isStartOfEndLine);
};


/**
 * @param {pwk.Range} range1
 * @param {pwk.Range} range2
 * @return {boolean}
 */
pwk.Range.equal = function(range1, range2) {
  return (
      range1.getStartLine() == range2.getStartLine() &&
      range1.getStartNodeOffset() == range2.getStartNodeOffset() &&
      range1.getEndLine() == range2.getEndLine() &&
      range1.getEndNodeOffset() == range2.getEndNodeOffset() &&
      range1.isStartOfStartLine() == range2.isStartOfStartLine() &&
      range1.isStartOfEndLine() == range2.isStartOfEndLine()
  );
};
