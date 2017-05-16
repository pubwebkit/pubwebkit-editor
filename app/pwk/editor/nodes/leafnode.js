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
 * @fileoverview TODO: add description
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.LeafNode');

goog.require('goog.dom.Range');
goog.require('goog.dom.classlist');
goog.require('goog.events.Event');
goog.require('pwk.Line');
goog.require('pwk.LineOffsetInfo');
goog.require('pwk.Node');
goog.require('pwk.NodeAttribute');
goog.require('pwk.NodeAttributeTypes');
goog.require('pwk.NodeContentChangedEvent');
goog.require('pwk.primitives.NodeSelectionRange');
goog.require('pwk.ui.NodeFormatter');

/**
 * @param {pwk.NodeTypes} type Type of node.
 * @param {pwk.Document} doc Parent document object.
 * @param {string|pwk.Line=} opt_content Content text or line.
 * @constructor
 * @extends {pwk.Node}
 */
pwk.LeafNode = function(type, doc, opt_content) {
  pwk.LeafNode.base(this, 'constructor', type, doc);

  /**
   * @type {Array.<pwk.Line>}
   * @private
   */
  this.lines_ = goog.isString(opt_content) || !goog.isDefAndNotNull(opt_content)
                    ? [new pwk.Line(opt_content || '')]
                    : [opt_content];

  /**
   * @type {Array}
   * @private
   */
  this.rangeOffsetInfoCache_ = [];

  /**
   * @type {pwk.PageSettings}
   * @private
   */
  this.pageSettings_ = pwk.PageSettings.getInstance();

  /**
   * @type {pwk.LeafNode}
   * @private
   */
  this.previousLinkedNode_;

  /**
   * @type {pwk.LeafNode}
   * @private
   */
  this.nextLinkedNode_;

  /**
   * @type {?pwk.primitives.NodeSelectionRange}
   * @private
   */
  this.nodeSelectionRange_;

  /**
   * @type {boolean}
   * @private
   */
  this.isSelected_ = false;
};
goog.inherits(pwk.LeafNode, pwk.Node);

/** @inheritDoc */
pwk.LeafNode.prototype.createDom = function() {
  pwk.LeafNode.base(this, 'createDom');

  var element = this.getElement();
  var lines = this.lines_;
  var linesLength = lines.length;

  element.setAttribute('id', this.getId());

  while (linesLength--) {
    this.renderLine_(lines[linesLength], 0);
  }
};

/** @inheritDoc */
pwk.LeafNode.prototype.enterDocument = function() {
  pwk.LeafNode.base(this, 'enterDocument');

  // Initialize events
  this.listen(pwk.Node.EventType.ATTRIBUTES_CHANGED, this.renderNode_, false,
              this);
  this.listen(pwk.LeafNode.EventType.CONTENT_CHANGED,
              this.onLineContentChangedHandler_, false, this);

  if (this.getAttributes().length > 0) {
    this.dispatchEvent(pwk.Node.EventType.ATTRIBUTES_CHANGED);
  }

  if (this.getLength() > 0) {
    this.dispatchEvent(new pwk.NodeContentChangedEvent(this.getFirstLine()));
  }
};

/**
 * @inheritDoc
 */
pwk.LeafNode.prototype.getPreviousLinkedNode = function() {
  return this.previousLinkedNode_;
};

/**
 * @inheritDoc
 * @return {?pwk.LeafNode}
 */
pwk.LeafNode.prototype.getNextLinkedNode = function() {
  return this.nextLinkedNode_;
};

/**
 * Is current node a topmost of all linked nodes?
 * @return {boolean}
 */
pwk.LeafNode.prototype.isRootLinkedNode = function() {
  return !goog.isDefAndNotNull(this.previousLinkedNode_);
};

/** @inheritDoc */
pwk.LeafNode.prototype.setPreviousLinkedNode = function(node) {
  this.previousLinkedNode_ = /** @type {pwk.LeafNode} */ (node);
  if (node.getNextLinkedNode() != this) {
    node.setNextLinkedNode(this);
  }
};

/** @inheritDoc */
pwk.LeafNode.prototype.setNextLinkedNode = function(node) {
  this.nextLinkedNode_ = /** @type {pwk.LeafNode} */ (node);
  if (node.getPreviousLinkedNode() != this) {
    node.setPreviousLinkedNode(this);
  }
};

/**
 * Unlink topmost linked node
 */
pwk.LeafNode.prototype.unlinkPreviousLinkedNode = function() {
  var previousLinkedNode = this.previousLinkedNode_;
  this.previousLinkedNode_ = null;

  if (previousLinkedNode != null &&
      previousLinkedNode.getNextLinkedNode() != null) {
    previousLinkedNode.unlinkNextLinkedNode();
  }
  this.clearRangeInfoForOffsetCache();
};

/**
 * Unlink linked node below
 */
pwk.LeafNode.prototype.unlinkNextLinkedNode = function() {
  var nextLinkedNode = this.nextLinkedNode_;
  this.nextLinkedNode_ = null;

  if (nextLinkedNode != null &&
      nextLinkedNode.getPreviousLinkedNode() != null) {
    nextLinkedNode.unlinkPreviousLinkedNode();
  }
  this.clearRangeInfoForOffsetCache();
};

/**
 * @param {pwk.Line} line Line object to insert.
 * @param {boolean} render Is required render lines?
 * @param {number=} opt_i The index at which to insert the object.
 */
pwk.LeafNode.prototype.insertLine = function(line, render, opt_i) {
  var i = goog.isDefAndNotNull(opt_i) ? opt_i : this.lines_.length;
  goog.array.insertAt(this.lines_, line, i);

  if (render) {
    this.renderLine_(line, i);
  }
};

/**
 * Render line.
 * @param {pwk.Line} line Line object to insert.
 * @param {number} index 0-based index at which the new child component is to be
 *    added; must be between 0 and the current child count (inclusive).
 * @private
 */
pwk.LeafNode.prototype.renderLine_ = function(line, index) {
  this.addChildAt(line, index, true);
  pwk.ui.NodeFormatter.applyNodeAttributes(this.getAttributes(), line);
};

/**
 * *
 * @param {Array.<pwk.Line>} lines Lines to insert.
 * @param {boolean} render Is required render lines?
 * @param {number=} opt_i The index at which to insert the object.
 */
pwk.LeafNode.prototype.insertLines = function(lines, render, opt_i) {
  goog.array.forEach(lines, function(line, index) {
    this.insertLine(line, render,
                    goog.isDefAndNotNull(opt_i) ? opt_i + index : undefined);
  }, this);
};

/** @inheritDoc */
pwk.LeafNode.prototype.disposeInternal = function() {
  pwk.LeafNode.base(this, 'disposeInternal');

  var lines = this.lines_;
  var linesLen = lines.length;

  // Dispose of all Disposable objects owned by this class.
  while (linesLen--) {
    goog.dispose(lines[linesLen]);
  }

  this.clearRangeInfoForOffsetCache();

  // Unlink previous and next linked nodes
  this.unlinkPreviousLinkedNode();
  this.unlinkNextLinkedNode();

  // Remove references
  delete this.lines_;
};

/**
 * Get concatenated lines of all linked nodes
 * @return {Array.<pwk.Line>}
 * @private
 */
pwk.LeafNode.prototype.getLinesOfAllLinkedNodes_ = function() {
  var lines = [];
  var previousLinkedNode = this.previousLinkedNode_;
  var nextLinkedNode = this.nextLinkedNode_;

  while (goog.isDefAndNotNull(previousLinkedNode)) {
    lines = goog.array.concat(previousLinkedNode.getLines(), lines);
    previousLinkedNode = previousLinkedNode.getPreviousLinkedNode();
  }

  lines = goog.array.concat(lines, this.getLines());

  while (goog.isDefAndNotNull(nextLinkedNode)) {
    lines = goog.array.concat(lines, nextLinkedNode.getLines());
    nextLinkedNode = nextLinkedNode.getNextLinkedNode();
  }

  return lines;
};

/**
 * Get line range information for specific offset at the node.
 * @param {number} nodeOffset Text range offset (summary for all lines)
 * @return {?pwk.LineOffsetInfo}
 */
pwk.LeafNode.prototype.getRangeInfoForOffset = function(nodeOffset) {

  // Looking into cache
  var cacheData = this.rangeOffsetInfoCache_[nodeOffset];
  if (goog.isDefAndNotNull(cacheData)) {
    return cacheData;
  }

  var lines = this.lines_;
  var lineLength;
  var line;
  var rangeInfo = new pwk.LineOffsetInfo();

  if (nodeOffset == 0) {
    line = lines[0];

    rangeInfo.setLine(line);
    rangeInfo.setLineIndex(0);
    rangeInfo.setLineOffset(0);
    rangeInfo.setNodeOffset(0);
    rangeInfo.setLineLength(line.getLength());
    rangeInfo.setLinkedNodeOffset(this.getOffsetForLinkedNodes_(line, 0));

    this.rangeOffsetInfoCache_[0] = rangeInfo;
    return rangeInfo;
  }

  var lengthSummary = 0;
  var linesCount = lines.length;

  for (var i = 0; i < linesCount; i++) {
    line = lines[i];
    lineLength = line.getLength();
    lengthSummary += lineLength;

    if (lengthSummary >= nodeOffset) {
      var lineOffset = lineLength - (lengthSummary - nodeOffset);

      rangeInfo.setLine(line);
      rangeInfo.setLineIndex(i);
      rangeInfo.setLineOffset(lineOffset);
      rangeInfo.setNodeOffset(nodeOffset);
      rangeInfo.setLineLength(lineLength);
      rangeInfo.setLinkedNodeOffset(
          this.getOffsetForLinkedNodes_(line, lineOffset));

      this.rangeOffsetInfoCache_[nodeOffset] = rangeInfo;
      return rangeInfo;
    }
  }

  return null;
};

/**
 * Get line range information for specific offset based on all linked nodes.
 * @param {number} nodeOffset Text range offset (summary for all lines)
 * @return {?pwk.LineOffsetInfo}
 */
pwk.LeafNode.prototype.getRangeInfoByLinkedNodesOffset = function(nodeOffset) {
  var lines = this.getLinesOfAllLinkedNodes_();
  var lineLength;
  var line;
  var rangeInfo = new pwk.LineOffsetInfo();

  if (nodeOffset == 0) {
    line = lines[0];

    rangeInfo.setLine(line);
    rangeInfo.setLineIndex(0);
    rangeInfo.setLineOffset(0);
    rangeInfo.setNodeOffset(0);
    rangeInfo.setLineLength(line.getLength());
    rangeInfo.setLinkedNodeOffset(nodeOffset);

    return rangeInfo;
  }

  var lengthSummary = 0;
  var linesCount = lines.length;

  for (var i = 0; i < linesCount; i++) {
    line = lines[i];
    lineLength = line.getLength();
    lengthSummary += lineLength;

    if (lengthSummary >= nodeOffset) {
      var lineOffset = lineLength - (lengthSummary - nodeOffset);

      rangeInfo.setLine(line);
      rangeInfo.setLineIndex(i);
      rangeInfo.setLineOffset(lineOffset);
      rangeInfo.setNodeOffset(
          line.getParentNode().getOffsetByLineOffset(line, lineOffset));
      rangeInfo.setLineLength(lineLength);
      rangeInfo.setLinkedNodeOffset(nodeOffset);

      return rangeInfo;
    }
  }

  return null;
};

/**
 * Get node offset regarding specified line offset.
 * @param {pwk.Line} line
 * @param {number} lineOffset
 * @return {number}
 * @override
 */
pwk.LeafNode.prototype.getOffsetByLineOffset = function(line, lineOffset) {
  var lines = this.lines_;
  var index = this.indexOfLine(line);
  var linesCount = lines.length;
  var lengthSummary = 0;
  var i = 0;
  var loopLine;

  while (i < linesCount) {
    loopLine = lines[i];
    if (i == index) {
      lengthSummary += lineOffset;
      break;
    } else {
      lengthSummary += loopLine.getLength();
    }
    i++;
  }

  return lengthSummary;
};

/**
 * Get offset of linked nodes for line offset.
 * @param {pwk.Line} line
 * @param {number} lineOffset
 * @return {number}
 * @private
 */
pwk.LeafNode.prototype.getOffsetForLinkedNodes_ = function(line, lineOffset) {
  var lines = this.getLinesOfAllLinkedNodes_();
  var index = goog.array.indexOf(lines, line);
  var linesCount = lines.length;
  var lengthSummary = 0;
  var i = 0;
  var loopLine;

  while (i < linesCount) {
    loopLine = lines[i];
    if (i == index) {
      lengthSummary += lineOffset;
      break;
    } else {
      lengthSummary += loopLine.getLength();
    }
    i++;
  }

  return lengthSummary;
};

/**
 * @inheritDoc
 */
pwk.LeafNode.prototype.getLength = function() {
  var length = 0;
  var lines = this.lines_;
  var lineLength = lines.length;

  while (lineLength--) {
    length += lines[lineLength].getLength();
  }

  return length;
};

/**
 * Get concatenated lines text.
 * @return {string}
 */
pwk.LeafNode.prototype.getText = function() {
  var text = '';
  var lines = this.lines_;
  var lineLength = lines.length;

  while (lineLength--) {
    text = lines[lineLength].getText() + text;
  }

  return text;
};

/**
 * @inheritDoc
 */
pwk.LeafNode.prototype.getFirstLine = function() {
  // TODO: Move to the pwk.Node as abstract
  return this.lines_[0];
};

/**
 * @inheritDoc
 */
pwk.LeafNode.prototype.getLastLine = function() {
  return this.lines_[this.lines_.length - 1];
};

/**
 * Returns the line at the given index, or null if the index is out of bounds.
 * @param {number} index 0-based index.
 * @param {boolean=} opt_isIncludeLinesFromLinkedNodes
 * @return {?pwk.Line}
 */
pwk.LeafNode.prototype.getLineAt = function(index,
                                            opt_isIncludeLinesFromLinkedNodes) {
  if (opt_isIncludeLinesFromLinkedNodes) {
    return this.getLinesOfAllLinkedNodes_()[index] || null;
  } else {
    return this.lines_[index] || null;
  }
};

/**
 * Returns array of lines of current node.
 * @return {Array.<pwk.Line>}
 */
pwk.LeafNode.prototype.getLines = function() { return this.lines_; };

/**
 * Get lines count.
 * @return {number}
 */
pwk.LeafNode.prototype.getLinesCount = function() {
  return this.lines_.length;
};

/**
 * Removes the given line from this node, returns and disposes of it.  Throws an
 * error if the argument is invalid or if the specified line isn't found in the
 * node.
 * @param {pwk.Line} line
 * @return {pwk.Line}
 */
pwk.LeafNode.prototype.removeLine = function(line) {
  goog.array.remove(this.lines_, line);
  var removedLine = /** @type {pwk.Line} */ (this.removeChild(line, true));
  if (removedLine) {
    goog.dispose(removedLine);
    // Clear cache for offsets range information
    this.clearRangeInfoForOffsetCache();
  }
  return removedLine;
};

/**
 * Do the same as {@link pwk.LeafNode#removeLine}, but without object
 * disposing.
 * @param {pwk.Line} line
 * @return {pwk.Line}
 */
pwk.LeafNode.prototype.unlinkLine = function(line) {
  goog.array.remove(this.lines_, line);
  if (this.indexOfChild(line) != -1) {
    this.removeChild(line, true);
  }
  return line;
};

/**
 * Returns the 0-based index of the given line component, or -1 if no such
 * node is found.
 * @param {pwk.Line?} line The line component.
 * @return {number} 0-based index of the line component; -1 if not found.
 */
pwk.LeafNode.prototype.indexOfLine = function(line) {
  return (this.lines_ && line) ? goog.array.indexOf(this.lines_, line) : -1;
};

/**
 * Insert value to the end of node or to the specific position, based on
 * provided offset.
 * @param {string} value
 * @param {number=} opt_offset Offset inside node, whole all lines
 */
pwk.LeafNode.prototype.insertValue = function(value, opt_offset) {
  var rangeInfo = this.getRangeInfoForOffset(opt_offset || 0);
  rangeInfo.getLine().insertValue(value, opt_offset);
};

/**
 * Insert text to the end of node or to the specific position, based on provided
 * offset.
 * @param {string} text
 * @param {number=} opt_offset Offset inside node, whole all lines
 */
pwk.LeafNode.prototype.insertText = function(text, opt_offset) {
  var rangeInfo = this.getRangeInfoForOffset(opt_offset || 0);
  rangeInfo.getLine().insertText(text, opt_offset);
};

/** @private */
pwk.LeafNode.prototype.renderNode_ = function() {
  goog.array.forEach(this.lines_, function(line) {
    pwk.ui.NodeFormatter.applyNodeAttributes(this.getAttributes(), line);
  }, this);
};

/** @inheritDoc */
pwk.LeafNode.prototype.isSplittable = function() { return true; };

/** @inheritDoc */
pwk.LeafNode.prototype.splitToBottom = function(offset) {
  var rangeInfo = this.getRangeInfoForOffset(offset);
  var parentNodeLength = rangeInfo.getLine().getParentNode().getLength();
  var nextLinkedNode = this.nextLinkedNode_;

  // If this is end of the node and exist linked node,
  // then just unlink next linked node and return it
  if (offset == parentNodeLength && goog.isDefAndNotNull(nextLinkedNode)) {

    this.unlinkNextLinkedNode();

    return nextLinkedNode;
  } else {

    var lines = this.lines_;
    var linesLength = lines.length;
    var content = rangeInfo.getLine().cut(rangeInfo.getLineOffset());
    var startLineIndexToMove = rangeInfo.getLineIndex() + 1;
    var linesCountToMove = linesLength - startLineIndexToMove;
    var newNode;

    if (content.length > 0 || linesCountToMove == 0) {
      newNode = new pwk.LeafNode(this.getType(), this.getDocument(), content);
    } else {
      newNode = new pwk.LeafNode(this.getType(), this.getDocument(),
                                 this.unlinkLine(lines[startLineIndexToMove]));
      linesCountToMove--;
    }

    // If node have the next linked node, assign it to the new node.
    if (offset > 0 && goog.isDefAndNotNull(nextLinkedNode)) {
      this.unlinkNextLinkedNode();
      newNode.setNextLinkedNode(nextLinkedNode);
    }

    while (linesCountToMove--) {
      newNode.insertLine(this.unlinkLine(lines[startLineIndexToMove]), false);
    }

    return newNode;
  }
};

/** @inheritDoc */
pwk.LeafNode.prototype.splitToTop = function(offset, linkNode) {
  var rangeInfo = this.getRangeInfoForOffset(offset);
  var previousLinkedNode = this.previousLinkedNode_;

  if (offset == 0 && goog.isDefAndNotNull(previousLinkedNode)) {
    this.unlinkPreviousLinkedNode();

    return previousLinkedNode;
  } else {

    var lines = this.lines_;
    var content = rangeInfo.getLine().cut(rangeInfo.getLineOffset());
    var lineIndex = rangeInfo.getLineIndex();

    var newLineContent =
        content.length > 0 ? content : this.unlinkLine(lines[lineIndex]);
    var newNode =
        new pwk.LeafNode(this.getType(), this.getDocument(), newLineContent);

    while (lineIndex--) {
      newNode.insertLine(this.unlinkLine(lines[lineIndex]), false, 0);
    }

    if (goog.isDefAndNotNull(previousLinkedNode)) {
      this.unlinkPreviousLinkedNode();
      newNode.setPreviousLinkedNode(previousLinkedNode);
    }

    if (linkNode) {
      newNode.setNextLinkedNode(this);
    }

    return newNode;
  }
};

/** @inheritDoc */
pwk.LeafNode.prototype.splitByHeight = function(height) {
  /**
   * @type {pwk.Line}
   */
  var dividingLine;
  var calculatedHeight = 0;

  if (this.lines_) {
    goog.array.every(this.lines_, function(line) {
      var lineHeight = line.getHeight();

      if ((lineHeight + calculatedHeight) < height) {
        calculatedHeight += lineHeight;
        dividingLine = line;
        return true;
      } else {
        return false;
      }
    });
  }

  if (dividingLine != null) {
    var offset =
        this.getOffsetByLineOffset(dividingLine, dividingLine.getLength());
    return this.splitToTop(offset, true);
  } else {
    return null;
  }
};

/**
 * Clear cache for offsets range information.
 * @param {pwk.LeafNode=} opt_callerNode
 * @public
 */
pwk.LeafNode.prototype.clearRangeInfoForOffsetCache = function(opt_callerNode) {
  goog.array.clear(this.rangeOffsetInfoCache_);

  var prevLinkedNode = this.previousLinkedNode_;
  var nextLinkedNode = this.nextLinkedNode_;

  // Clearing for linked nodes
  if (prevLinkedNode != null) {
    if (opt_callerNode == null ||
        opt_callerNode.getId() != prevLinkedNode.getId()) {
      prevLinkedNode.clearRangeInfoForOffsetCache(this);
    }
  }

  if (nextLinkedNode != null) {
    if (opt_callerNode == null ||
        opt_callerNode.getId() != nextLinkedNode.getId()) {
      nextLinkedNode.clearRangeInfoForOffsetCache(this);
    }
  }
};

/**
 * @param {pwk.NodeContentChangedEvent} e
 * @private
 */
pwk.LeafNode.prototype.onLineContentChangedHandler_ = function(e) {
  // Clear cache for offsets range information
  this.clearRangeInfoForOffsetCache();

  // Normalize node contents in lines
  this.normalizeLines(e.lastUpdatedLine);
};

/**
 * Normalization of the contents on the lines.
 * @param {pwk.Line} lastUpdatedLine
 */
pwk.LeafNode.prototype.normalizeLines = function(lastUpdatedLine) {
  // TODO: Try to improve performance in this place if it's possible.

  var length;
  var doc = this.getDocument();
  var prevLinkedNode = this.previousLinkedNode_;
  var nextLinkedNode = this.nextLinkedNode_;
  var currentNodePageIndex = doc.indexOfPageByNodeId(this.getId());

  // Check if some of linked node situated on the same page and merge it.
  if (prevLinkedNode != null &&
      currentNodePageIndex == prevLinkedNode.getParentPageIndex()) {
    length = prevLinkedNode.getLinesCount();

    while (length--) {
      this.insertLine(
          prevLinkedNode.unlinkLine(prevLinkedNode.getLineAt(length)), true, 0);
    }

    doc.removeNode(prevLinkedNode);
    this.previousLinkedNode_ = null;
  }

  if (nextLinkedNode != null &&
      currentNodePageIndex == nextLinkedNode.getParentPageIndex()) {
    length = nextLinkedNode.getLinesCount();

    while (length--) {
      this.insertLine(nextLinkedNode.unlinkLine(nextLinkedNode.getLineAt(0)),
                      true);
    }

    doc.removeNode(nextLinkedNode);
    this.nextLinkedNode_ = null;
  }

  // Checking the width of node content and splitting it if it wider than page
  // content or parent node if it's child node.
  var parentContentWidth = this.isChild() ? this.getParent().getSize().width
                                          : this.pageSettings_.getInnerWidth();

  // Move text from the line below, if it's possible
  lastUpdatedLine =
      this.normalizeBackward_(lastUpdatedLine, parentContentWidth);

  if (lastUpdatedLine != null) {
    // Move text to the line below, if it's required
    this.normalizeForward_(lastUpdatedLine, parentContentWidth);
  }
};

/**
 * @param {pwk.Line} lastUpdatedLine
 * @param {number} parentContentWidth
 * @return {pwk.Line}
 * @private
 */
pwk.LeafNode.prototype.normalizeBackward_ = function(lastUpdatedLine,
                                                     parentContentWidth) {
  var googArray = goog.array;
  var lines = this.getLinesOfAllLinkedNodes_();
  var lastUpdateLineIndex = googArray.indexOf(lines, lastUpdatedLine);
  var lineAbove = lines[lastUpdateLineIndex - 1];

  if (goog.isDefAndNotNull(lineAbove)) { // Is first line?
    var googString = goog.string;
    var lineAboveContent = lineAbove.getContent();
    var lastUpdatedLineContent = lastUpdatedLine.getContent();
    var loopsCount = 0;
    var isSpace = false;
    var lineBelowLength;
    var contentToMoveInfo;
    var calculatedAboveWidth;
    var lastWord;

    do {
      if (contentToMoveInfo != null) { // Skip this case for first time

        lineAboveContent.insertText(contentToMoveInfo.text,
                                    lineAboveContent.getLength());

        if (!isSpace) {
          lastUpdatedLineContent.removeAt(0, 1);
        } else {
          lastUpdatedLineContent.removeFirstWord();
        }

        lineBelowLength = lastUpdatedLineContent.getLength();
        if (lineBelowLength == 0) {
          lastUpdatedLine.getParentNode().removeLine(lastUpdatedLine);
          lastUpdatedLine = lines[lastUpdateLineIndex + 1];
          if (goog.isDefAndNotNull(lastUpdatedLine)) {
            lastUpdatedLineContent = lastUpdatedLine.getContent();
          } else {
            // No line below? Exit...
            return null;
          }
        }
      }

      lastWord = lineAboveContent.getTextNodeValueAtOffset(
          lineAboveContent.getLength() - 1);
      // Check, if line above did not contains spaces
      isSpace = googString.isSpace(googString.normalizeWhitespace(lastWord));
      contentToMoveInfo =
          !isSpace ? lastUpdatedLineContent.getContentInfoForOffset(0, 1)
                   : lastUpdatedLineContent.getFirstWordInfo();

      calculatedAboveWidth =
          lineAbove.getWidth(false) + contentToMoveInfo.width;

      loopsCount++;
    } while (calculatedAboveWidth < parentContentWidth);

    if (loopsCount > 1) {
      lastUpdateLineIndex = googArray.indexOf(lines, lastUpdatedLine);
      var lineBelow = lines[lastUpdateLineIndex + 1];
      if (lineBelow != null) {
        return this.normalizeBackward_(lineBelow, parentContentWidth);
      }
    }
  }

  return lastUpdatedLine;
};

/**
 * @param {pwk.Line} lastUpdatedLine
 * @param {number} parentContentWidth
 * @private
 */
pwk.LeafNode.prototype.normalizeForward_ = function(lastUpdatedLine,
                                                    parentContentWidth) {
  var lineContentWidth = lastUpdatedLine.getWidth(true);
  var lastUpdatedLineBelow;

  if (lineContentWidth > parentContentWidth) {
    var googString = goog.string;
    var googArray = goog.array;
    var lines = this.getLinesOfAllLinkedNodes_();
    var lastUpdateLineIndex = googArray.indexOf(lines, lastUpdatedLine);
    var lastUpdatedLineContent = lastUpdatedLine.getContent();
    var isLastLine = !goog.isDefAndNotNull(lines[lastUpdateLineIndex + 1]);
    var lastUpdatedLineContentLength = lastUpdatedLineContent.getLength();
    var firstSpaceIndex =
        googString.trimRight(googString.normalizeWhitespace(
                                 lastUpdatedLineContent.getText()))
            .indexOf(' ');
    var lastUpdatedContentText = '';
    var contentToMove = '';
    var lastUpdatedModifiedLineContentLength = 0;
    var lastSpaceIndex;
    var lineParentNode;

    if (firstSpaceIndex != -1 && (lineContentWidth >= parentContentWidth * 2)) {
      var prevContentToMove;
      var prevLastUpdatedModifiedLineContentLength;

      do {
        prevContentToMove = contentToMove;
        prevLastUpdatedModifiedLineContentLength =
            lastUpdatedModifiedLineContentLength;

        contentToMove = lastUpdatedLineContent.copy(
            lastUpdatedContentText.length + firstSpaceIndex + 1);
        lastUpdatedContentText = lastUpdatedLineContent.copy(
            0, lastUpdatedLineContentLength - contentToMove.length);
        lastUpdatedModifiedLineContentLength = lastUpdatedContentText.length;

        lineContentWidth =
            lastUpdatedLineContent.getContentInfoForOffset(
                                       0, lastUpdatedModifiedLineContentLength)
                .width;
        firstSpaceIndex =
            googString.trimRight(googString.normalizeWhitespace(contentToMove))
                .indexOf(' ');

      } while (lineContentWidth < parentContentWidth && firstSpaceIndex != -1);

      contentToMove = prevContentToMove;
      lastUpdatedModifiedLineContentLength =
          prevLastUpdatedModifiedLineContentLength;
    } else {
      var tempWord;
      lastUpdatedContentText = lastUpdatedLineContent.getText();
      lastUpdatedModifiedLineContentLength = lastUpdatedContentText.length;

      do {
        lastSpaceIndex =
            googString.trimRight(googString.normalizeWhitespace(
                                     lastUpdatedContentText)).lastIndexOf(' ');

        // If remains big text only, then move last character only
        if (lastSpaceIndex != -1) {
          contentToMove =
              lastUpdatedLineContent.copy(
                  lastSpaceIndex + 1, lastUpdatedModifiedLineContentLength) +
              contentToMove;

          lastUpdatedContentText = lastUpdatedLineContent.copy(
              0, lastUpdatedLineContentLength - contentToMove.length);
          lastUpdatedModifiedLineContentLength = lastUpdatedContentText.length;
        } else {

          do {
            tempWord = googString.normalizeWhitespace(
                lastUpdatedLineContent
                    .getTextNodeAtOffset(lastUpdatedModifiedLineContentLength -
                                         1)
                    .data);
            contentToMove = tempWord + contentToMove;
            lastUpdatedContentText = lastUpdatedLineContent.copy(
                0, lastUpdatedLineContentLength - contentToMove.length);
            lastUpdatedModifiedLineContentLength--;
          } while (googString.isSpace(tempWord));
        }

        lineContentWidth =
            lastUpdatedLineContent.getContentInfoForOffset(
                                       0, lastUpdatedModifiedLineContentLength)
                .width;

      } while (lineContentWidth > parentContentWidth);
    }

    lastUpdatedLineContent.removeAt(lastUpdatedModifiedLineContentLength);

    if (isLastLine) {
      lastUpdatedLineBelow = new pwk.Line(contentToMove);
      lineParentNode = lastUpdatedLine.getParentNode();
      googArray.insert(lineParentNode.getLines(), lastUpdatedLineBelow);
      lineParentNode.addChild(lastUpdatedLineBelow, true);
      pwk.ui.NodeFormatter.applyNodeAttributes(
          this.getAttributes(),
          lastUpdatedLineBelow); // apply node attributes
    } else {
      lastUpdatedLineBelow = lines[lastUpdateLineIndex + 1];
      lastUpdatedLineBelow.getContent().insertText(contentToMove, 0);
    }
  }

  if (lastUpdatedLineBelow != null) {
    this.normalizeForward_(lastUpdatedLineBelow, parentContentWidth);
  }
};

/**
 * Make selection for node content by range
 * @param {pwk.primitives.NodeSelectionRange=} opt_nodeSelectionRange
 * @override
 */
pwk.LeafNode.prototype.select = function(opt_nodeSelectionRange) {
  // NOTE: Call select method for each line (exclude lines from linked node,
  // add this functionality in future if required)
  // TODO: Review performance and try to improve it for selection functionality.

  if (this.isSelected_) {
    if (!goog.isDefAndNotNull(opt_nodeSelectionRange) &&
        !goog.isDefAndNotNull(this.nodeSelectionRange_)) {
      // Whole node already selected, exit.
      return;
    }

    if (goog.isDefAndNotNull(opt_nodeSelectionRange) &&
        goog.isDefAndNotNull(this.nodeSelectionRange_) &&
        opt_nodeSelectionRange.equals(this.nodeSelectionRange_)) {
      // The same range already selected, exit.
      return;
    }
  }

  // Select all node content or only provided range?
  if (goog.isDefAndNotNull(opt_nodeSelectionRange)) {

    var lines = this.lines_;
    var linesLength = lines.length;
    var startLineIndex =
        goog.array.indexOf(lines, opt_nodeSelectionRange.startLine);
    var endLineIndex =
        goog.array.indexOf(lines, opt_nodeSelectionRange.endLine);
    var isSelectionInsideSingleLine =
        opt_nodeSelectionRange.startLine == opt_nodeSelectionRange.endLine;

    for (var i = 0; i < linesLength; i++) {
      if (i == startLineIndex) {
        if (isSelectionInsideSingleLine) {
          lines[i].select(opt_nodeSelectionRange.startLineOffset,
                          opt_nodeSelectionRange.endLineOffset);
          break;
        } else {
          lines[i].select(opt_nodeSelectionRange.startLineOffset);
        }
      } else if (i == endLineIndex) {
        if (!isSelectionInsideSingleLine) {
          lines[i].select(0, opt_nodeSelectionRange.endLineOffset);
        }
        break;
      } else if (i > startLineIndex) {
        lines[i].select();
      }
    }
    this.nodeSelectionRange_ = opt_nodeSelectionRange;

  } else { // Select all
    goog.array.forEach(this.lines_, function(line) { line.select(); });

    this.nodeSelectionRange_ = new pwk.primitives.NodeSelectionRange(
        this.getFirstLine(), 0, this.getLastLine(),
        this.getLastLine().getLength());
  }

  this.isSelected_ = true;
};

/**
 * Remove selection from node
 */
pwk.LeafNode.prototype.unselect = function() {
  var lines = this.lines_;

  goog.array.forEach(lines, function(line) { line.unselect(); });

  // Cleanup variables
  this.isSelected_ = false;
  this.nodeSelectionRange_ = null;
};

/**
 * @inheritDoc
 */
pwk.LeafNode.prototype.removeSelection = function(opt_isBack) {
  var nodeSelectionRange = this.nodeSelectionRange_;
  var pwkDocument = this.getDocument();
  var pwkSelection = pwkDocument.getSelection();
  var selectionRange = pwkSelection.getRange();
  var isReversed = selectionRange.isReversed();
  var topSelectionRangeNode =
      isReversed ? selectionRange.getEndNode() : selectionRange.getStartNode();
  var bottomSelectionRangeNode =
      isReversed ? selectionRange.getStartNode() : selectionRange.getEndNode();
  var isNodeSelectedEntirely = this.isSelectedEntirely_();
  var isSelectionInsideThisNodeOnly =
      topSelectionRangeNode === bottomSelectionRangeNode;

  if (selectionRange.isCollapsed()) {
    var newRange;
    var nodeOffset;
    var lineToRefresh;

    if (opt_isBack) { // `Backspace` logic
      nodeOffset = selectionRange.getStartNodeOffset();

      // Cursor inside LeafNode
      if (nodeOffset > 0) {
        var newOffset = nodeOffset - 1;
        var newLineOffset = selectionRange.getStartLineOffset() - 1;

        if (newLineOffset >= 0) {
          newRange = pwk.Range.createFromNodes(
              selectionRange.getStartLine(), newOffset,
              selectionRange.getStartLine(), nodeOffset,
                  newLineOffset === 0, false);

        } else {
          var newOffsetRangeInfo =
              selectionRange.getStartNode().getRangeInfoForOffset(newOffset);

          newRange = pwk.Range.createFromNodes(
              newOffsetRangeInfo.getLine(), newOffset,
              newOffsetRangeInfo.getLine(), nodeOffset);
        }

      } else { // Cursor is at the beginning of the LeafNode

        var previousLinkedNode =
            selectionRange.getStartNode().getPreviousLinkedNode();

        // If there is a previous linked node, let's select the last character
        // and remove it.
        if (previousLinkedNode) {
          nodeOffset = previousLinkedNode.getLength();
          var lastLine = previousLinkedNode.getLastLine();

          newRange = pwk.Range.createFromNodes(lastLine, nodeOffset, lastLine,
              nodeOffset);
        }
      }

    } else { // `Delete` logic

    }

    if (newRange) {
      pwkSelection.selectDocument(newRange);
      pwkDocument.deleteSelection(opt_isBack);
    }

  } else {

    if (isNodeSelectedEntirely) {
      // Update selection range & remove node from document entirely

      if (topSelectionRangeNode === this || bottomSelectionRangeNode === this) {

        var lastNodeIndex = pwkDocument.getNodeCount() - 1;
        var nodeIndex = pwkDocument.indexOfNode(this);

        if (nodeIndex < lastNodeIndex) {

          if (bottomSelectionRangeNode === this &&
              !isSelectionInsideThisNodeOnly) {
            selectionRange.collapse(true);

          } else {
            var bottommostNode =
                /** @type {pwk.Node} */
                (pwkDocument.getNodeAt(pwkDocument.indexOfNode(this) + 1));

            if (isReversed) {
              selectionRange.setEndPosition(bottommostNode.getFirstLine(), 0,
                                            true);
              if (isSelectionInsideThisNodeOnly) {
                selectionRange.setStartPosition(bottommostNode.getFirstLine(),
                                                0, true);
              }
            } else {
              selectionRange.setStartPosition(bottommostNode.getFirstLine(), 0,
                                              true);
              if (isSelectionInsideThisNodeOnly) {
                selectionRange.setEndPosition(bottommostNode.getFirstLine(), 0,
                                              true);
              }
            }
          }

        } else if (pwkDocument.indexOfNode(this) > 0) {

          var topmostNode =
              /** @type {pwk.Node} */
              (pwkDocument.getNodeAt(pwkDocument.indexOfNode(this) - 1));
          var lastLine = /** @type {pwk.Line} */ (topmostNode.getLastLine());
          var lastLineOffset =
              topmostNode.getOffsetByLineOffset(lastLine, lastLine.getLength());

          if (isReversed) {
            selectionRange.setStartPosition(lastLine, lastLineOffset, false);
            if (isSelectionInsideThisNodeOnly) {
              selectionRange.setEndPosition(lastLine, lastLineOffset, false);
            }
          } else {
            selectionRange.setEndPosition(lastLine, lastLineOffset, false);
            if (isSelectionInsideThisNodeOnly) {
              selectionRange.setStartPosition(lastLine, lastLineOffset, false);
            }
          }
        }
      }

      // Range updated, now we can safely remove node from document.
      pwkDocument.removeNode(this);

    } else {
      // Remove range of node and update range

      var startLineIndex = this.indexOfLine(nodeSelectionRange.startLine);
      var endLineIndex = this.indexOfLine(nodeSelectionRange.endLine);
      var nodeOffset = 0;
      var selectionOffsets;
      var line;
      var lineOffset;

      for (var i = startLineIndex; i <= endLineIndex; i++) {
        line = this.lines_[i];

        if (line.isSelectedEntirely()) {
          // Remove line from node.
          this.removeLine(line);
          endLineIndex--;
          i--;
        } else {
          selectionOffsets = line.removeSelection();
        }

        if (i == endLineIndex) {

          if (selectionOffsets && line.isInDocument()) {
            lineOffset = selectionOffsets.start;

          } else {

            if (i + 1 in this.lines_) {
              line = this.lines_[i + 1];
              lineOffset = 0;
            } else {
              line = this.lines_[i];
              lineOffset = line.getLength();
            }
          }

          nodeOffset = this.getOffsetByLineOffset(line, lineOffset);

          if (selectionOffsets &&
              !(selectionOffsets.start === 0 && selectionOffsets.end === 1) &&
              !(selectionOffsets.start === 1 && selectionOffsets.end === 0)) {
            var rangeInfo = this.getRangeInfoForOffset(nodeOffset);
            line = rangeInfo.getLine();
            lineOffset = rangeInfo.getLineOffset();
          }
        }
      }

      var nextLineInNode = this.lines_[startLineIndex + 1];
      var nextLinkedNodeLine = bottomSelectionRangeNode.getNextLinkedNode() ?
          bottomSelectionRangeNode.getNextLinkedNode().getFirstLine() :
          null;
      var lineToRefresh = nextLineInNode || nextLinkedNodeLine;

      if (lineToRefresh) {
        this.dispatchEvent(
            new pwk.NodeContentChangedEvent(lineToRefresh));
      }

      if (line) {
        if (topSelectionRangeNode === this &&
            bottomSelectionRangeNode !== this) {
          if (isReversed) {
            selectionRange.setEndPosition(line, nodeOffset, !lineOffset);
            if (isSelectionInsideThisNodeOnly) {
              selectionRange.setStartPosition(line, nodeOffset, !lineOffset);
            }
          } else {
            selectionRange.setStartPosition(line, nodeOffset, !lineOffset);
            if (isSelectionInsideThisNodeOnly) {
              selectionRange.setEndPosition(line, nodeOffset, !lineOffset);
            }
          }

        } else {
          if (isReversed) {
            selectionRange.setStartPosition(line, nodeOffset, !lineOffset);
            if (isSelectionInsideThisNodeOnly) {
              selectionRange.setEndPosition(line, nodeOffset, !lineOffset);
            }
          } else {
            selectionRange.setEndPosition(line, nodeOffset, !lineOffset);
            if (isSelectionInsideThisNodeOnly) {
              selectionRange.setStartPosition(line, nodeOffset, !lineOffset);
            }
          }
        }
      }
    }
  }

  // Cleanup variables
  this.isSelected_ = false;
  this.nodeSelectionRange_ = null;
};

/**
 * Is node selected entirely?
 * @return {boolean}
 * @private
 */
pwk.LeafNode.prototype.isSelectedEntirely_ = function() {
  if (goog.isDefAndNotNull(this.nodeSelectionRange_)) {
    return this.indexOfLine(this.nodeSelectionRange_.startLine) === 0 &&
           this.nodeSelectionRange_.startLineOffset === 0 &&
           this.indexOfLine(this.nodeSelectionRange_.endLine) ==
               this.lines_.length - 1 &&
           this.nodeSelectionRange_.endLineOffset ===
               this.nodeSelectionRange_.endLine.getLength();
  }
  return false;
};

/** @inheritDoc */
pwk.LeafNode.prototype.addChildAt = function(child, index, opt_render) {
  pwk.LeafNode.base(this, 'addChildAt', child, index, opt_render);
};

/**
 * Component default css class.
 * @type {string}
 * @override
 */
pwk.LeafNode.prototype.CSS_CLASS = goog.getCssName('pwk-leafnode');

/**
 * @enum {string}
 */
pwk.LeafNode.EventType = {
  CONTENT_CHANGED : goog.events.getUniqueId('node_content_changed')
};
