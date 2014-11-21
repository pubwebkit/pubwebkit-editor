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
 * @fileoverview Represents the content of line component.
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.LineContent');

goog.require('goog.ui.Component');
goog.require('goog.dom.classlist');
goog.require('pwk.primitives.ClientRectRange');
goog.require('pwk.NodeAnnotation');


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
     * @type {string}
     * @private
     */
    this.normalizedText_ = goog.string.normalizeWhitespace(this.text_);

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

    if(this.text_.length) {
        var textValue = this.text_;
        this.text_ = '';
        this.normalizedText_ = '';
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
    for(var i = 0; i < this.annotations_.length; i++) {
        goog.array.removeAt(this.annotations_, i);
    }

    delete this.annotations_;
    delete this.text_;
    delete this.normalizedText_;
};


/**
 * Insert or set text for current line content.
 * @param {string} text
 * @param {number=} opt_offset
 */
pwk.LineContent.prototype.insertText = function(text, opt_offset) {
    if(text && text.length > 0) {
        var el = this.getElement()
          , fragment = document.createDocumentFragment()
          , fragmentFirstChild
          , textLength;

        fragment.appendChild(el.cloneNode(true));
        fragmentFirstChild = /** @type {Element} */(fragment.firstChild);
        textLength = goog.string.normalizeWhitespace(text).length;

        if(goog.isDefAndNotNull(opt_offset)) {
            while(textLength--) {
                this.insertValue(text[textLength], opt_offset, fragmentFirstChild);
            }
        } else {
            while(textLength--) {
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
pwk.LineContent.prototype.insertValue = function(value, opt_offset, opt_parent) {
    var text = this.text_
      , parent = opt_parent || this.getElement()
      , offset = opt_offset || 0
      , textNode;

    textNode = document.createTextNode(value);
    parent.insertBefore(textNode, parent.childNodes[opt_offset] || null);

    // Update indexes
    this.text_ = text.substr(0, offset) + textNode.nodeValue + text.substr(offset);
    this.normalizedText_ = goog.string.normalizeWhitespace(this.text_);
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
    return this.normalizedText_;
};


/**
 * Removes the last text node from the content and returns its value.
 * @return {string} The value of the popped text node.
 */
pwk.LineContent.prototype.pop = function() {
    var el = this.getElement()
      , lastChild = el.lastChild
      , nodeValue = lastChild.nodeValue
      , text = this.text_;

    lastChild.parentNode.removeChild(lastChild);

    this.text_ = text.slice(0, this.normalizedText_.length - 1);
    this.normalizedText_ = goog.string.normalizeWhitespace(this.text_);

    // TODO: Update annotations required

    return nodeValue;
};


/**
 * Removes latest text nodes, separated by space/tab, from the content and returns their values.
 * @return {string} Merged values of the popped text nodes.
 */
pwk.LineContent.prototype.popLastWord = function() {
    var googString = goog.string
      , el = this.getElement()
      , text = this.text_
      , normalizedText = this.normalizedText_
      , spaceIndex = googString.trimRight(normalizedText).lastIndexOf(' ')
      , offset = spaceIndex != -1 ? spaceIndex + 1 : 0
      , gRange = goog.dom.Range.createFromNodes(el, offset, el, normalizedText.length)
      , value = text.slice(offset);

    gRange.removeContents();

    // TODO: Update annotations required

    this.text_ = text.slice(0, offset);
    this.normalizedText_ = goog.string.normalizeWhitespace(this.text_);

    return value;
};


pwk.LineContent.prototype.popFirstWord = function() {
    var googString = goog.string
      , el = this.getElement()
      , text = this.text_
      , normalizedText = this.normalizedText_
      , spaceIndex = normalizedText.indexOf(' ')
      , offset = spaceIndex != -1 ? spaceIndex + 1 : text.length;

    if(spaceIndex == 0) {
        var trimedText = googString.trimLeft(normalizedText);
        var firstCharIndex = text.indexOf(trimedText[0]);
        offset = normalizedText.indexOf(' ', firstCharIndex);
    }

    while(googString.isSpace(normalizedText[offset])) {
        offset++;
    }

    var gRange = goog.dom.Range.createFromNodes(el, 0, el, offset)
      , value = text.slice(0, offset);

    gRange.removeContents();

    // TODO: Update annotations required

    this.text_ = text.slice(offset);
    this.normalizedText_ = goog.string.normalizeWhitespace(this.text_);

    return value;
};


pwk.LineContent.prototype.removeFirstWord = function() {
    var googString = goog.string
        , el = this.getElement()
        , text = this.text_
        , normalizedText = this.normalizedText_
        , spaceIndex = normalizedText.indexOf(' ')
        , offset = spaceIndex != -1 ? spaceIndex + 1 : text.length;

    if(spaceIndex == 0) {
        var trimedText = googString.trimLeft(normalizedText);
        var firstCharIndex = text.indexOf(trimedText[0]);
        offset = normalizedText.indexOf(' ', firstCharIndex);
    }

    while(googString.isSpace(normalizedText[offset])) {
        offset++;
    }

    var gRange = goog.dom.Range.createFromNodes(el, 0, el, offset);

    gRange.removeContents();

    // TODO: Update annotations required

    this.text_ = text.slice(offset);
    this.normalizedText_ = goog.string.normalizeWhitespace(this.text_);
};

/**
 * Returns first word
 * @return {string}
 */
pwk.LineContent.prototype.copyFirstWord = function() {
    var googString = goog.string
      , text = this.text_
      , normalizedText = this.normalizedText_
      , spaceIndex = normalizedText.indexOf(' ')
      , offset = spaceIndex != -1 ? spaceIndex + 1 : normalizedText.length;

    if(spaceIndex == 0) {
        var trimedText = googString.trimLeft(normalizedText);
        var firstCharIndex = text.indexOf(trimedText[0]);
        offset = normalizedText.indexOf(' ', firstCharIndex);
    }

    while(googString.isSpace(normalizedText[offset])) {
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
    var el = this.getElement()
        , text = this.text_
        , normalizedText = this.normalizedText_
        , endOffset = opt_endOffset || normalizedText.length
        , gRange = goog.dom.Range.createFromNodes(el, startOffset, el, endOffset)
        , value = text.slice(startOffset, endOffset);

    gRange.removeContents();

    this.text_ = text.slice(0, startOffset) + text.slice(endOffset);
    this.normalizedText_ = goog.string.normalizeWhitespace(this.text_);

    return value;
};


/**
 * @param {number} startOffset
 * @param {number=} opt_endOffset
 * @return {string}
 */
pwk.LineContent.prototype.copy = function(startOffset, opt_endOffset) {
    var text = this.text_
      , normalizedText = this.normalizedText_
      , endOffset = opt_endOffset || normalizedText.length;

    return text.slice(startOffset, endOffset);
};


/**
 * @param {number} startOffset
 * @param {number=} opt_endOffset
 */
pwk.LineContent.prototype.removeAt = function(startOffset, opt_endOffset) {
    var el = this.getElement()
      , text = this.text_
      , normalizedText = this.normalizedText_
      , endOffset = opt_endOffset || normalizedText.length
      , gRange = goog.dom.Range.createFromNodes(el, startOffset, el, endOffset);

    gRange.removeContents();

    this.text_ = text.slice(0, startOffset) + text.slice(endOffset);
    this.normalizedText_ = goog.string.normalizeWhitespace(this.text_);
};


/**
 * @return {number}
 */
pwk.LineContent.prototype.getLength = function() {
    return this.normalizedText_.length;
};


/**
 * @param offset
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
    var textNode =  this.getElement().childNodes[offset];
    return textNode != null ? textNode.nodeValue : '';
};


/**
 * Get width of printable content
 * @param {boolean} isOnlyPrintableContent
 * @return {number}
 */
pwk.LineContent.prototype.getWidth = function(isOnlyPrintableContent) {
    var el = this.getElement()
      , width;

    if(isOnlyPrintableContent) {
        var lastCharIndex = goog.string.trimRight(this.normalizedText_).length;

        if(goog.userAgent.IE) {
            var textRange = document.body.createTextRange()
              , browserZoomLevel = (screen.deviceXDPI / screen.logicalXDPI);

            textRange.moveToElementText(el);
            textRange.moveStart('character', 0);
            textRange.collapse();
            textRange.moveEnd('character', lastCharIndex);

            width = textRange.boundingWidth / browserZoomLevel;

        } else {
            var range = document.createRange();

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
 * Returns a text rectangle object that encloses a group of text rectangles at specific offset.
 * @return {pwk.primitives.ClientRectRange}
 */
pwk.LineContent.prototype.getBoundingClientRectForOffset = function(opt_startOffset, opt_endOffset) {
    var el = this.getElement()
      , clientRectResult;

    opt_startOffset = goog.isDefAndNotNull(opt_startOffset) ? opt_startOffset : 0;
    opt_endOffset = goog.isDefAndNotNull(opt_endOffset) ? opt_endOffset : this.getLength();

    if(goog.userAgent.IE) {
        var textRange = document.body.createTextRange()
          , browserZoomLevel = (screen.deviceXDPI / screen.logicalXDPI);

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
        var range = document.createRange()
          , boundingClientRect;

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
 * Get text and width for content range
 * @param {number} startOffset
 * @param {number=} opt_endOffset
 * @returns {{width: number, text: string}}
 */
pwk.LineContent.prototype.getContentInfoForOffset = function(startOffset, opt_endOffset) {
    var text = this.text_
      , normalizedText = this.normalizedText_
      , endOffset = opt_endOffset || normalizedText.length
      , el = this.getElement()
      , width;

    if(goog.userAgent.IE) {
        var textRange = document.body.createTextRange()
          , browserZoomLevel = (screen.deviceXDPI / screen.logicalXDPI);

        textRange.moveToElementText(el);
        textRange.moveStart('character', startOffset);
        textRange.collapse();
        textRange.moveEnd('character', endOffset);

        width = textRange.boundingWidth / browserZoomLevel;

    } else {
        var range = document.createRange();

        range.selectNodeContents(el);
        range.setStart(el, startOffset);
        range.setEnd(el, endOffset);

        width = range.getBoundingClientRect().width;
    }

    return { width: width, text: text.slice(startOffset, endOffset) };
};


/**
 * Get first word and width
 * @returns {{width: number, text: string}}
 */
pwk.LineContent.prototype.getFirstWordInfo = function() {
    var googString = goog.string
      , text = this.text_
      , normalizedText = this.normalizedText_
      , spaceIndex = normalizedText.indexOf(' ')
      , offset = spaceIndex != -1 ? spaceIndex + 1 : normalizedText.length;

    if(spaceIndex == 0) {
        var trimedText = googString.trimLeft(normalizedText);
        var firstCharIndex = text.indexOf(trimedText[0]);
        offset = normalizedText.indexOf(' ', firstCharIndex);
    }

    while(googString.isSpace(normalizedText[offset])) {
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


pwk.LineContent.CSS_CLASS = 'pwk-line-content';
