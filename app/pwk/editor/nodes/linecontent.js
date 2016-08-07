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
 * @fileoverview Represents the content of line component.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.LineContent');

goog.require('goog.dom.classlist');
goog.require('goog.ui.Component');
goog.require('pwk.NodeAnnotation');
goog.require('pwk.primitives.ClientRectRange');



/**
 * @param {string=} opt_text
 * @extends {goog.ui.Component}
 * @constructor
 */
pwk.LineContent = function(opt_text) {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.text_ = opt_text || '';

  /**
   * @type {Array.<pwk.NodeAnnotation>}
   * @private
   */
  this.annotations_ = [];
};
goog.inherits(pwk.LineContent, goog.ui.Component);


/** @inheritDoc */
pwk.LineContent.prototype.createDom = function() {
  // Create element and apply classes
  this.setElementInternal(goog.dom.createElement('span'));
  goog.dom.classlist.add(this.getElement(), pwk.LineContent.CSS_CLASS);

  if (this.text_.length) {
    var textValue = this.text_;
    this.text_ = '';
    this.insertText(textValue);
  }
};


/** @inheritDoc */
pwk.LineContent.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
};


/** @inheritDoc */
pwk.LineContent.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');

  // Remove annotations
  for (var i = 0; i < this.annotations_.length; i++) {
    goog.array.removeAt(this.annotations_, i);
  }

  delete this.annotations_;
  delete this.text_;
};


/**
 * Insert or set text for current line content.
 * @param {string} text
 * @param {number=} opt_offset
 */
pwk.LineContent.prototype.insertText = function(text, opt_offset) {
  if (text && text.length > 0) {
    let el = this.getElement();
    let fragment = document.createDocumentFragment();
    let fragmentFirstChild;
    let textLength;

    fragment.appendChild(el.cloneNode(true));
    fragmentFirstChild = /** @type {Element} */(fragment.firstChild);
    textLength = goog.string.normalizeWhitespace(text).length;

    if (goog.isDefAndNotNull(opt_offset)) {
      while (textLength--) {
        this.insertValue(text[textLength], opt_offset, fragmentFirstChild);
      }
    } else {
      while (textLength--) {
        this.insertValue(text[textLength], 0, fragmentFirstChild);
      }
    }

    goog.dom.replaceNode(fragmentFirstChild, el);
    this.setElementInternal(fragmentFirstChild);
  }

};


/**
 * Insert a single value.
 * @param {string} value Content value, used as single value of TextNode
 * @param {number=} opt_offset
 * @param {Node|Element=} opt_parent
 */
pwk.LineContent.prototype.insertValue = function(value, opt_offset,
                                                 opt_parent) {
  let text = this.text_;
  let parent = opt_parent || this.getElement();
  let offset = opt_offset || 0;
  let textNode;

  textNode = document.createTextNode(value);
  parent.insertBefore(textNode, parent.childNodes[offset] || null);

  // Update indexes
  this.text_ =
      text.substr(0, offset) + textNode.nodeValue + text.substr(offset);
};


/**
 * @return {string}
 */
pwk.LineContent.prototype.getText = function() {
  return this.text_;
};


/**
 * @return {string}
 */
pwk.LineContent.prototype.getNormalizedText = function() {
  return goog.string.normalizeWhitespace(this.text_);
};


/**
 * Removes the last text node from the content and returns its value.
 * @return {string} The value of the popped text node.
 */
pwk.LineContent.prototype.pop = function() {
  let el = this.getElement();
  let lastChild = el.lastChild;
  let nodeValue = lastChild.nodeValue;
  let text = this.text_;

  lastChild.parentNode.removeChild(lastChild);

  this.text_ = text.slice(0, this.getNormalizedText().length - 1);

  // TODO: Update annotations required

  return nodeValue;
};


/**
 * Remove latest text nodes, word, separated by space/tab from the content and
 * return their value.
 * @return {string} Merged values of the popped text nodes.
 */
pwk.LineContent.prototype.popLastWord = function() {
  let googString = goog.string;
  let el = this.getElement();
  let text = this.text_;
  let normalizedText = this.getNormalizedText();
  let spaceIndex = googString.trimRight(normalizedText).lastIndexOf(' ');
  let offset = spaceIndex != -1 ? spaceIndex + 1 : 0;
  let gRange =
      goog.dom.Range.createFromNodes(el, offset, el, normalizedText.length);
  let value = text.slice(offset);

  gRange.removeContents();

  // TODO: Update annotations required

  this.text_ = text.slice(0, offset);

  return value;
};


/**
 * Remove first text nodes, word, separated by space/tab from the content and
 * return their value.
 * @return {string}
 */
pwk.LineContent.prototype.popFirstWord = function() {
  let googString = goog.string;
  let el = this.getElement();
  let text = this.text_;
  let normalizedText = this.getNormalizedText();
  let spaceIndex = normalizedText.indexOf(' ');
  let offset = spaceIndex != -1 ? spaceIndex + 1 : text.length;

  if (spaceIndex == 0) {
    let trimedText = googString.trimLeft(normalizedText);
    let firstCharIndex = text.indexOf(trimedText[0]);
    offset = normalizedText.indexOf(' ', firstCharIndex);
  }

  while (googString.isSpace(normalizedText[offset])) {
    offset++;
  }

  let gRange = goog.dom.Range.createFromNodes(el, 0, el, offset);
  let value = text.slice(0, offset);

  gRange.removeContents();

  // TODO: Update annotations required

  this.text_ = text.slice(offset);

  return value;
};


/**
 * Remove first word from the content and return it.
 */
pwk.LineContent.prototype.removeFirstWord = function() {
  let googString = goog.string;
  let el = this.getElement();
  let text = this.text_;
  let normalizedText = this.getNormalizedText();
  let spaceIndex = normalizedText.indexOf(' ');
  let offset = spaceIndex != -1 ? spaceIndex + 1 : text.length;

  if (spaceIndex == 0) {
    let trimedText = googString.trimLeft(normalizedText);
    let firstCharIndex = text.indexOf(trimedText[0]);
    offset = normalizedText.indexOf(' ', firstCharIndex);
  }

  while (googString.isSpace(normalizedText[offset])) {
    offset++;
  }

  let gRange = goog.dom.Range.createFromNodes(el, 0, el, offset);

  gRange.removeContents();

  // TODO: Update annotations required

  this.text_ = text.slice(offset);
};


/**
 * Returns first word.
 * @return {string}
 */
pwk.LineContent.prototype.copyFirstWord = function() {
  let googString = goog.string;
  let text = this.text_;
  let normalizedText = this.getNormalizedText();
  let spaceIndex = normalizedText.indexOf(' ');
  let offset = spaceIndex != -1 ? spaceIndex + 1 : normalizedText.length;

  if (spaceIndex == 0) {
    let trimedText = googString.trimLeft(normalizedText);
    let firstCharIndex = text.indexOf(trimedText[0]);
    offset = normalizedText.indexOf(' ', firstCharIndex);
  }

  while (googString.isSpace(normalizedText[offset])) {
    offset++;
  }

  return text.slice(0, offset);
};


/**
 * Returns the last text node value.
 * @return {string} The value of the popped text node.
 */
pwk.LineContent.prototype.getLastTextNodeValue = function() {
  return this.getElement().lastChild.nodeValue;
};


/**
 * Returns first character, without deleting it
 * @return {string}
 */
pwk.LineContent.prototype.copyFirstChar = function() {
  return this.text_.slice(0, 1);
};


/**
 * @param {number} startOffset
 * @param {number=} opt_endOffset
 * @return {string}
 */
pwk.LineContent.prototype.cut = function(startOffset, opt_endOffset) {
  let el = this.getElement();
  let text = this.text_;
  let normalizedText = this.getNormalizedText();
  let endOffset = opt_endOffset || normalizedText.length;
  let gRange = goog.dom.Range.createFromNodes(el, startOffset, el, endOffset);
  let value = text.slice(startOffset, endOffset);

  gRange.removeContents();

  this.text_ = text.slice(0, startOffset) + text.slice(endOffset);

  return value;
};


/**
 * @param {number} startOffset
 * @param {number=} opt_endOffset
 * @return {string}
 */
pwk.LineContent.prototype.copy = function(startOffset, opt_endOffset) {
  let text = this.text_;
  let normalizedText = this.getNormalizedText();
  let endOffset = opt_endOffset || normalizedText.length;

  return text.slice(startOffset, endOffset);
};


/**
 * @param {number} startOffset
 * @param {number=} opt_endOffset
 */
pwk.LineContent.prototype.removeAt = function(startOffset, opt_endOffset) {
  let el = this.getElement();
  let text = this.text_;
  let normalizedText = this.getNormalizedText();
  let endOffset = opt_endOffset || normalizedText.length;
  let gRange = goog.dom.Range.createFromNodes(el, startOffset, el, endOffset);

  gRange.removeContents();

  this.text_ = text.slice(0, startOffset) + text.slice(endOffset);
};


/**
 * @return {number}
 */
pwk.LineContent.prototype.getLength = function() {
  return this.getNormalizedText().length;
};


/**
 * @param {number} offset
 * @return {Node?}
 */
pwk.LineContent.prototype.getTextNodeAtOffset = function(offset) {
  return this.getElement().childNodes[offset] || null;
};


/**
 * @param {number} offset
 * @return {string}
 */
pwk.LineContent.prototype.getTextNodeValueAtOffset = function(offset) {
  var textNode = this.getElement().childNodes[offset];
  return textNode != null ? textNode.nodeValue : '';
};


/**
 * Get width of printable content
 * @param {boolean} isOnlyPrintableContent
 * @return {number}
 */
pwk.LineContent.prototype.getWidth = function(isOnlyPrintableContent) {
  let el = this.getElement();
  let width;

  if (isOnlyPrintableContent) {
    let lastCharIndex = goog.string.trimRight(this.getNormalizedText()).length;

    if (goog.userAgent.IE) {
      let textRange = document.body.createTextRange();
      let browserZoomLevel =
          (!!navigator.userAgent.match(/Trident.*rv[ :]*11\./)) ?
              1 :
              screen.deviceXDPI / screen.logicalXDPI;

      textRange.moveToElementText(el);
      textRange.moveStart('character', 0);
      textRange.collapse();
      textRange.moveEnd('character', lastCharIndex);

      width = textRange.boundingWidth / browserZoomLevel;

    } else {
      let range = document.createRange();

      range.selectNodeContents(el);
      range.setStart(el, 0);
      range.setEnd(el, lastCharIndex);

      width = range.getBoundingClientRect().width;
    }
  } else {
    width = goog.style.getSize(el).width;
  }

  return width;
};


/**
 * Returns a text rectangle object that encloses a group of text rectangles at
 * specific offset.
 * @param {number=} opt_startOffset
 * @param {number=} opt_endOffset
 * @return {pwk.primitives.ClientRectRange}
 */
pwk.LineContent.prototype.getBoundingClientRectForOffset =
    function(opt_startOffset, opt_endOffset) {
  let el = this.getElement();
  let clientRectResult;

  opt_startOffset = goog.isDefAndNotNull(opt_startOffset) ?
      opt_startOffset :
      0;
  opt_endOffset = goog.isDefAndNotNull(opt_endOffset) ?
      opt_endOffset :
      this.getLength();

  if (goog.userAgent.IE) {
    let textRange = document.body.createTextRange();
    let browserZoomLevel =
        (!!navigator.userAgent.match(/Trident.*rv[ :]*11\./)) ?
            1 :
            screen.deviceXDPI / screen.logicalXDPI;

    textRange.moveToElementText(el);
    textRange.moveStart('character', opt_startOffset);
    textRange.collapse();
    textRange.moveEnd('character', opt_endOffset - opt_startOffset);

    clientRectResult = new pwk.primitives.ClientRectRange();
    clientRectResult.width = textRange.boundingWidth / browserZoomLevel;
    clientRectResult.height = textRange.boundingHeight / browserZoomLevel;
    clientRectResult.left = textRange.boundingLeft / browserZoomLevel;
    clientRectResult.top = textRange.boundingTop / browserZoomLevel;
  } else {
    let range = document.createRange();
    let boundingClientRect;

    range.selectNodeContents(el);
    range.setStart(el, opt_startOffset);
    range.setEnd(el, opt_endOffset);

    boundingClientRect = range.getBoundingClientRect();

    clientRectResult = new pwk.primitives.ClientRectRange();
    clientRectResult.width = boundingClientRect.width;
    clientRectResult.height = boundingClientRect.height;
    clientRectResult.top = boundingClientRect.top;
    clientRectResult.left = boundingClientRect.left;
  }

  return clientRectResult;
};


/**
 * Get text and width for content range.
 * @param {number} startOffset
 * @param {number=} opt_endOffset
 * @return {{width: number, text: string}}
 */
pwk.LineContent.prototype.getContentInfoForOffset = function(startOffset,
                                                             opt_endOffset) {
  let text = this.text_;
  let normalizedText = this.getNormalizedText();
  let endOffset = opt_endOffset || normalizedText.length;
  let el = this.getElement();
  let width;

  if (goog.userAgent.IE) {
    let textRange = document.body.createTextRange();
    let browserZoomLevel =
        (!!navigator.userAgent.match(/Trident.*rv[ :]*11\./)) ?
            1 :
            screen.deviceXDPI / screen.logicalXDPI;

    textRange.moveToElementText(el);
    textRange.moveStart('character', startOffset);
    textRange.collapse();
    textRange.moveEnd('character', endOffset);

    width = textRange.boundingWidth / browserZoomLevel;

  } else {
    let range = document.createRange();

    range.selectNodeContents(el);
    range.setStart(el, startOffset);
    range.setEnd(el, endOffset);

    width = range.getBoundingClientRect().width;
  }

  return {width: width, text: text.slice(startOffset, endOffset)};
};


/**
 * Get first word and width.
 * @return {{width: number, text: string}}
 */
pwk.LineContent.prototype.getFirstWordInfo = function() {
  let googString = goog.string;
  let text = this.text_;
  let normalizedText = this.getNormalizedText();
  let spaceIndex = normalizedText.indexOf(' ');
  let offset;

  if (spaceIndex == 0) {
    let trimedText = googString.trimLeft(normalizedText);
    let firstCharIndex = text.indexOf(trimedText[0]);
    offset = normalizedText.indexOf(' ', firstCharIndex);
  } else {
    offset = spaceIndex != -1 ? spaceIndex + 1 : normalizedText.length;
  }

  while (googString.isSpace(normalizedText[offset])) {
    offset++;
  }

  return this.getContentInfoForOffset(0, offset);
};


/**
 * @return {Array.<pwk.NodeAnnotation>}
 */
pwk.LineContent.prototype.getAnnotations = function() {
  return this.annotations_;
};


/**
 * @param {pwk.NodeAnnotation} annotation
 */
pwk.LineContent.prototype.addAnnotation = function(annotation) {
  this.annotations_.push(annotation);
};


/**
 * Component default css class.
 * @type {string}
 */
pwk.LineContent.CSS_CLASS = 'pwk-line-content';
