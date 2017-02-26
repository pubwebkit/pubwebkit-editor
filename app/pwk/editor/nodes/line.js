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
 * @fileoverview Represents the line of node content.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.Line');

goog.require('goog.dom.classlist');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('pwk.LineContent');
goog.require('pwk.layer.SelectionOverlay');

/**
 *
 * @param {string=} opt_text Text content
 * @extends {goog.ui.Component}
 * @constructor
 */
pwk.Line = function(opt_text) {
  goog.base(this);

  /**
   * @type {pwk.LineContent}
   * @private
   */
  this.content_ = new pwk.LineContent(opt_text);

  /**
   * @type {pwk.layer.SelectionOverlay}
   * @private
   */
  this.selectionOverlay_;

  /**
   * @type {?{start:number, end:number}}
   */
  this.selectionOffsets_;

};
goog.inherits(pwk.Line, goog.ui.Component);

/** @inheritDoc */
pwk.Line.prototype.createDom = function() {
  var element = goog.dom.createElement('div');

  // Create element and apply classes
  this.setElementInternal(element);
  element.setAttribute('id', this.getId());
  goog.dom.classlist.add(element, pwk.Line.CSS_CLASS);

  // Add content as child
  this.addChild(this.content_, true);
};

/** @inheritDoc */
pwk.Line.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');

  goog.dispose(this.content_);
  goog.dispose(this.selectionOverlay_);

  delete this.content_;
  delete this.selectionOverlay_;
  delete this.selectionOffsets_;
};

/**
 * Get line content
 * @return {string}
 */
pwk.Line.prototype.getText = function() { return this.content_.getText(); };

/**
 * Get line content with normalized whitespaces
 * @return {string}
 */
pwk.Line.prototype.getNormalizedText = function() {
  return this.content_.getNormalizedText();
};

/**
 * Get content length
 * @return {number}
 */
pwk.Line.prototype.getLength = function() { return this.content_.getLength(); };

/**
 * Get content width
 * @param {boolean} isOnlyPrintableContent
 * @return {number}
 */
pwk.Line.prototype.getWidth = function(isOnlyPrintableContent) {
  return this.content_.getWidth(isOnlyPrintableContent);
};

/**
 * Get line height
 * @return {number}
 */
pwk.Line.prototype.getHeight = function() {
  return goog.style.getSize(this.getContentElement()).height;
};

/**
 * Get index inside node.
 * @return {number}
 */
pwk.Line.prototype.getIndex = function() {
  return this.getParentNode().indexOfLine(this);
};

/**
 * Removes the last text node from the content and returns its value.
 * @return {string} The value of the popped text node.
 */
pwk.Line.prototype.pop = function() { return this.content_.pop(); };

/**
 * Removes latest text nodes, separated by space/tab, from the content and
 *    returns their values.
 * @return {string} The values of the popped text nodes.
 */
pwk.Line.prototype.popLastWord = function() {
  return this.content_.popLastWord();
};

/**
 * Insert a single value.
 * @param {string} value Content value, used as single value of TextNode
 * @param {number=} opt_offset
 */
pwk.Line.prototype.insertValue = function(value, opt_offset) {
  this.content_.insertValue(value, opt_offset);

  this.dispatchEvent(new pwk.NodeContentChangedEvent(this));
};

/**
 * Set the text
 * @param {string} text
 * @param {number=} opt_offset
 */
pwk.Line.prototype.insertText = function(text, opt_offset) {
  this.content_.insertText(text, opt_offset);

  this.dispatchEvent(new pwk.NodeContentChangedEvent(this));
};

/**
 * @param {number} offset
 * @return {Node?}
 */
pwk.Line.prototype.getTextNodeAtOffset = function(offset) {
  return this.content_.getTextNodeAtOffset(offset);
};

/**
 * @param {number} offset
 * @return {string}
 */
pwk.Line.prototype.getTextNodeValueAtOffset = function(offset) {
  return this.content_.getTextNodeValueAtOffset(offset);
};

/**
 * @return {pwk.LineContent}
 */
pwk.Line.prototype.getContent = function() { return this.content_; };

/**
 * @param {number} startOffset
 * @param {number=} opt_endOffset
 * @return {string} Сutted text
 */
pwk.Line.prototype.cut = function(startOffset, opt_endOffset) {
  return this.content_.cut(startOffset, opt_endOffset);
};

/**
 * Get parent leaf node
 * @return {pwk.LeafNode}
 */
pwk.Line.prototype.getParentNode = function() {
  return /** @type {pwk.LeafNode} */ (this.getParent());
};

/**
 * Make selection for line content by provided offsets.
 * @param {number=} opt_startOffset
 * @param {number=} opt_endOffset
 */
pwk.Line.prototype.select = function(opt_startOffset, opt_endOffset) {

  // Remove previous selection, if exist
  if (goog.isDefAndNotNull(this.selectionOverlay_)) {
    this.removeChild(this.selectionOverlay_, true);
    goog.dispose(this.selectionOverlay_);
  }

  var googStyle = goog.style;
  var el = this.getElement();
  var elSize = googStyle.getSize(el);
  var elPageOffset = googStyle.getPageOffset(el);
  var clientRectRange;

  if (this.getLength() == 0) {
    clientRectRange =
        new pwk.primitives.ClientRectRange(10, elSize.height, 0, 0);
  } else {
    var lineContentClientRect = this.content_.getBoundingClientRectForOffset(
        opt_startOffset, opt_endOffset);
    clientRectRange = new pwk.primitives.ClientRectRange(
        lineContentClientRect.width, elSize.height, 0,
        lineContentClientRect.left - elPageOffset.x);
  }

  this.selectionOffsets_ = {
    start : goog.isDefAndNotNull(opt_startOffset) ? opt_startOffset : 0,
    end : goog.isDefAndNotNull(opt_endOffset) ? opt_endOffset : this.getLength()
  };

  this.selectionOverlay_ = new pwk.layer.SelectionOverlay(clientRectRange);
  this.addChildAt(this.selectionOverlay_, 0, true);
};

/**
 * Remove selection overlay from the line.
 */
pwk.Line.prototype.unselect = function() {
  if (this.selectionOverlay_) {
    this.removeChild(this.selectionOverlay_);
    goog.dispose(this.selectionOverlay_);
    delete this.selectionOverlay_;
    this.selectionOffsets_ = null;
  }
};

/**
 * To determine whether selected line completely.
 * @return {boolean}
 */
pwk.Line.prototype.isSelectedEntirely = function() {
  if (goog.isDefAndNotNull(this.selectionOffsets_)) {
    return this.selectionOffsets_.start == 0 &&
           this.selectionOffsets_.end == this.getLength();
  }
  return false;
};

/**
 * Remove selected content.
 * @return {{start:number, end:number}|Object<string,string>|null}
 */
pwk.Line.prototype.removeSelection = function() {
  var result = this.selectionOffsets_ != null
                   ? goog.object.clone(this.selectionOffsets_)
                   : null;

  if (goog.isDefAndNotNull(this.selectionOffsets_)) {
    this.content_.removeAt(this.selectionOffsets_.start,
                           this.selectionOffsets_.end);
    this.unselect();
  }

  return result;
};

/**
 * Component default css class.
 * @type {string}
 */
pwk.Line.CSS_CLASS = 'pwk-line';
