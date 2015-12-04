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

goog.provide('pwk.LeafNode');
goog.provide('pwk.LeafNode.NodeContentChangedEvent');


goog.require('pwk.Node');
goog.require('pwk.NodeAttribute');
goog.require('pwk.NodeAttributeTypes');
goog.require('pwk.NodeFormatter');
goog.require('pwk.Line');
goog.require('pwk.primitives.NodeSelectionRange');
goog.require('goog.dom.Range');
goog.require('goog.dom.classlist');


/**
 * @param {pwk.NodeTypes} type Type of node.
 * @param {pwk.Document} doc Parent document object.
 * @param {string|pwk.Line=} opt_content Content text or line.
 *
 * @constructor
 * @extends {pwk.Node}
 */
pwk.LeafNode = function(type, doc, opt_content) {
    goog.base(this, type, doc);

    /**
     * @type {Array.<pwk.Line>}
     * @private
     */
    this.lines_ = goog.isString(opt_content) || !goog.isDefAndNotNull(opt_content) ? [new pwk.Line(opt_content || '')] : [opt_content];


    /**
     * @type {Array}
     * @private
     */
    this.rangeInfoForOffsetCache_ = [];


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
    this.setElementInternal(this.dom_.createElement('div'));

    var element = this.getElement();
    // adjust dom element
    element.setAttribute('id', this.getId());
    goog.dom.classlist.add(element, this.CSS_CLASS);

    var lines = this.lines_
      , linesLength = lines.length
      , loopLine;

    while(linesLength--) {
        loopLine = lines[linesLength];
        this.addChildAt(loopLine, 0, true);
        pwk.NodeFormatter.applyNodeAttributes(this.getAttributes(), loopLine); // apply node attributes
    }
};


/** @inheritDoc */
pwk.LeafNode.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');

    // Initialize events
    this.listen(pwk.Node.EventType.ATTRIBUTES_CHANGED, this.renderNode_, false, this);
    this.listen(pwk.LeafNode.EventType.CONTENT_CHANGED, this.onLineContentChangedHandler_, false, this);

    if(this.getAttributes().length > 0) {
        this.dispatchEvent(pwk.Node.EventType.ATTRIBUTES_CHANGED);
    }


    if(this.getLength() > 0) {
        this.dispatchEvent(new pwk.LeafNode.NodeContentChangedEvent(this.getFirstLine()));
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
    this.previousLinkedNode_ = /** @type {pwk.LeafNode} */(node);
    if(node.getNextLinkedNode() != this) {
        node.setNextLinkedNode(this);
    }
};


/** @inheritDoc */
pwk.LeafNode.prototype.setNextLinkedNode = function(node) {
    this.nextLinkedNode_ = /** @type {pwk.LeafNode} */(node);
    if(node.getPreviousLinkedNode() != this) {
        node.setPreviousLinkedNode(this);
    }
};


/**
 * Unlink topmost linked node
 */
pwk.LeafNode.prototype.unlinkPreviousLinkedNode = function() {
    var previousLinkedNode = this.previousLinkedNode_;
    this.previousLinkedNode_ = null;

    if(previousLinkedNode != null && previousLinkedNode.getNextLinkedNode() != null) {
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

    if(nextLinkedNode != null && nextLinkedNode.getPreviousLinkedNode() != null) {
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
    if(render) {
        this.addChildAt(line, i, true);
        pwk.NodeFormatter.applyNodeAttributes(this.getAttributes(), line); // apply node attributes
    }
};


/**
 * *
 * @param {Array.<pwk.Line>} lines Lines to insert.
 * @param {boolean} render Is required render lines?
 * @param {number=} opt_i The index at which to insert the object.
 */
pwk.LeafNode.prototype.insertLines = function(lines, render, opt_i) {
    goog.array.forEach(lines, function(line, index) {
        this.insertLine(line, render, goog.isDefAndNotNull(opt_i) ? opt_i + index : undefined);
    }, this);
};


/** @inheritDoc */
pwk.LeafNode.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    var lines = this.lines_
      , linesLen = lines.length;

    // Dispose of all Disposable objects owned by this class.
    while(linesLen--) {
        goog.dispose(lines[linesLen]);
    }

    this.clearRangeInfoForOffsetCache();

    // Unlink previous and next linked nodes
    this.unlinkPreviousLinkedNode();
    this.unlinkNextLinkedNode();

    // Remove references
    delete this.lines_;

    this.document_ = null;
};


/**
 * Get concatenated lines of all linked nodes
 * @return {Array.<pwk.Line>}
 * @private
 */
pwk.LeafNode.prototype.getLinesOfAllLinkedNodes_ = function() {
    var lines = []
      , previousLinkedNode = this.previousLinkedNode_
      , nextLinkedNode = this.nextLinkedNode_;

    while(goog.isDefAndNotNull(previousLinkedNode)) {
        lines = goog.array.concat(previousLinkedNode.getLines(), lines);
        previousLinkedNode = previousLinkedNode.getPreviousLinkedNode();
    }

    lines = goog.array.concat(lines, this.getLines());

    while(goog.isDefAndNotNull(nextLinkedNode)) {
        lines = goog.array.concat(lines, nextLinkedNode.getLines());
        nextLinkedNode = nextLinkedNode.getNextLinkedNode();
    }

    return lines;
};

/**
 * Get line range information for specific offset at the node.
 * @param {number} offset Text range offset (summary for all lines)
 * @return {{lineIndex: number, line: pwk.Line, lineOffset: number, lineLength: number, nodeOffset: number, isEndOfLine: boolean, linkedNodeOffset: number}|null}
 */
pwk.LeafNode.prototype.getRangeInfoForOffset = function(offset) {
    // Looking into cache
    var cacheData = this.rangeInfoForOffsetCache_[offset];
    if(goog.isDefAndNotNull(cacheData)) {
        return cacheData;
    }

    var lines = this.lines_
      , lineLength
      , line
      , rangeInfo;

    if(offset == 0) {
        line = lines[0];
        lineLength = line.getLength();
        rangeInfo = {
            lineIndex: 0,
            line: line,
            lineOffset: 0,
            nodeOffset: 0,
            lineLength: lineLength,
            isEndOfLine: ((lineLength - 1) == 0),
            linkedNodeOffset: this.getOffsetForLinkedNodes_(line, 0)
        };

        this.rangeInfoForOffsetCache_[0] = rangeInfo;
        return rangeInfo;
    }

    var lengthSummary = 0
      , linesCount = lines.length;

    for(var i = 0; i < linesCount; i++) {
        line = lines[i];
        lineLength = line.getLength();
        lengthSummary += lineLength;

        if(lengthSummary >= offset) {
            var lineOffset = lineLength - (lengthSummary - offset);
            rangeInfo = {
                lineIndex: i,
                line: line,
                lineOffset: lineOffset,
                nodeOffset: offset,
                lineLength : lineLength,
                isEndOfLine: lineLength == lineOffset,
                linkedNodeOffset: this.getOffsetForLinkedNodes_(line, lineOffset)
            };

            this.rangeInfoForOffsetCache_[offset] = rangeInfo;
            return rangeInfo;
        }
    }

    return null;
};

/**
 * Get line range information for specific offset based on all linked nodes.
 * @param offset
 * @return {{lineIndex: number, line: pwk.Line, lineOffset: number, lineLength: number, nodeOffset: number, isEndOfLine: boolean, linkedNodeOffset: number}|null}
 */
pwk.LeafNode.prototype.getRangeInfoByLinkedNodesOffset = function(offset) {
    var lines = this.getLinesOfAllLinkedNodes_()
      , lineLength
      , line
      , rangeInfo;

    if(offset == 0) {
        line = lines[0];
        lineLength = line.getLength();
        rangeInfo = {
            lineIndex: 0,
            line: line,
            lineOffset: 0,
            nodeOffset: 0,
            lineLength: lineLength,
            isEndOfLine: ((lineLength - 1) == 0),
            linkedNodeOffset: offset
        };

        return rangeInfo;
    }

    var lengthSummary = 0
      , linesCount = lines.length;

    for(var i = 0; i < linesCount; i++) {
        line = lines[i];
        lineLength = line.getLength();
        lengthSummary += lineLength;

        if(lengthSummary >= offset) {
            var lineOffset = lineLength - (lengthSummary - offset);
            rangeInfo = {
                lineIndex: i,
                line: line,
                lineOffset: lineOffset,
                nodeOffset: line.getParentNode().getOffsetByLineOffset(line, lineOffset),
                lineLength : lineLength,
                isEndOfLine: lineLength == lineOffset,
                linkedNodeOffset: offset
            };

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
 */
pwk.LeafNode.prototype.getOffsetByLineOffset = function(line, lineOffset) {
    var lines = this.lines_
      , index = this.indexOfLine(line)
      , linesCount = lines.length
      , lengthSummary = 0
      , i = 0
      , loopLine;

    while(i < linesCount) {
        loopLine = lines[i];
        if(i == index) {
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
 * @param line
 * @param lineOffset
 * @returns {number}
 * @private
 */
pwk.LeafNode.prototype.getOffsetForLinkedNodes_ = function(line, lineOffset) {
    var lines = this.getLinesOfAllLinkedNodes_()
      , index = goog.array.indexOf(lines, line)
      , linesCount = lines.length
      , lengthSummary = 0
      , i = 0
      , loopLine;

    while(i < linesCount) {
        loopLine = lines[i];
        if(i == index) {
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
    var length = 0
      , lines = this.lines_
      , lineLength = lines.length;

    while(lineLength--) {
        length += lines[lineLength].getLength();
    }

    return length;
};


/**
 * Get concatenated lines text
 * @return {string}
 */
pwk.LeafNode.prototype.getText = function() {
    var text = ''
      , lines = this.lines_
      , lineLength = lines.length;

    while(lineLength--) {
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
pwk.LeafNode.prototype.getLineAt = function(index, opt_isIncludeLinesFromLinkedNodes) {
    if(opt_isIncludeLinesFromLinkedNodes) {
        return this.getLinesOfAllLinkedNodes_()[index] || null;
    } else {
        return this.lines_[index] || null;
    }
};


/**
 * Returns array of lines of current node.
 * @return {Array.<pwk.Line>}
 */
pwk.LeafNode.prototype.getLines = function() {
    return this.lines_;
};


/**
 * Get lines count
 * @return {number}
 */
pwk.LeafNode.prototype.getLinesCount = function() {
    return this.lines_.length;
};


/**
 * Removes the given line from this node, returns and disposes of it.  Throws an error
 * if the argument is invalid or if the specified line isn't found in the
 * node.
 * @param {pwk.Line} line
 * @return {pwk.Line}
 */
pwk.LeafNode.prototype.removeLine = function(line) {
    goog.array.remove(this.lines_, line);
    var removedLine = /** @type {pwk.Line} */(this.removeChild(line, true));
    if(removedLine) {
        goog.dispose(removedLine);
        // Clear cache for offsets range information
        this.clearRangeInfoForOffsetCache();
    }
    return removedLine;
};


/**
 * Do the same as {@code pwk.LeafNode.prototype.removeLine}, but without object disposing
 * @param {pwk.Line} line
 * @return {pwk.Line}
 */
pwk.LeafNode.prototype.unlinkLine = function(line) {
    goog.array.remove(this.lines_, line);
    return /** @type {pwk.Line} */(this.removeChild(line, true));
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
 * Insert value to the end of node or to the specific position, based on provided offset.
 * @param {string} value
 * @param {number=} opt_offset Offset inside node, whole all lines
 */
pwk.LeafNode.prototype.insertValue = function(value, opt_offset) {
    var rangeInfo = this.getRangeInfoForOffset(opt_offset || 0);
    rangeInfo.line.insertValue(value, opt_offset);
};


/**
 * Insert text to the end of node or to the specific position, based on provided offset.
 * @param {string} text
 * @param {number=} opt_offset Offset inside node, whole all lines
 */
pwk.LeafNode.prototype.insertText = function(text, opt_offset) {
    var rangeInfo = this.getRangeInfoForOffset(opt_offset || 0);
    rangeInfo.line.insertText(text, /** @type {number} */(opt_offset));
};


/**
 * @private
 */
pwk.LeafNode.prototype.renderNode_ = function() {
    goog.array.forEach(this.lines_, function(line) {
        pwk.NodeFormatter.applyNodeAttributes(this.getAttributes(), line);
    }, this);
};


/**
 * @inheritDoc
 */
pwk.LeafNode.prototype.isSplittable = function() {
    return true;
};


/**
 * @param {number} offset Node offset, 0-based index.
 * @return {pwk.LeafNode} Returns new node or next linked node, in case if offset is end of the current node and next exist linked node.
 */
pwk.LeafNode.prototype.split = function(offset) {

    var rangeInfo = this.getRangeInfoForOffset(offset)
      , parentNodeLength = rangeInfo.line.getParentNode().getLength();


    // If this is end of the node and exist linked node,
    // then just unlink next linked node and return it
    if(offset == parentNodeLength && goog.isDefAndNotNull(this.nextLinkedNode_)) {

        var linkedNode = this.nextLinkedNode_;
        this.nextLinkedNode_ = null;

        return linkedNode;
    } else {

        var lines = this.lines_
          , linesLen = lines.length
          , content = rangeInfo.line.cut(rangeInfo.lineOffset)
          , startLineIndexToMove = rangeInfo.lineIndex + 1
          , linesCountToMove = linesLen - startLineIndexToMove
          , newNode;

        if(content.length > 0 || linesCountToMove == 0) {
            newNode = new pwk.LeafNode(this.getType(), this.document_, content)
        } else {
            newNode = new pwk.LeafNode(this.getType(), this.document_, this.unlinkLine(lines[startLineIndexToMove]))
            linesCountToMove--;
        }

        // If node have the next linked node, assign it to the new node.
        if(offset > 0 && goog.isDefAndNotNull(this.nextLinkedNode_)) {
            newNode.setNextLinkedNode(this.nextLinkedNode_);
            this.nextLinkedNode_ = null;
        }

        while (linesCountToMove--) {
            newNode.insertLine(this.unlinkLine(lines[startLineIndexToMove]), false);
        }

        return newNode;
    }
};


/**
 * Clear cache for offsets range information.
 * @param {pwk.LeafNode=} opt_callerNode
 * @public
 */
pwk.LeafNode.prototype.clearRangeInfoForOffsetCache = function(opt_callerNode) {
    goog.array.clear(this.rangeInfoForOffsetCache_);

    var prevLinkedNode = this.previousLinkedNode_
      , nextLinkedNode = this.nextLinkedNode_;

    // Clearing for linked nodes
    if(prevLinkedNode != null) {
        if(opt_callerNode == null || opt_callerNode.getId() != prevLinkedNode.getId()) {
            prevLinkedNode.clearRangeInfoForOffsetCache(this);
        }
    }

    if(nextLinkedNode != null) {
        if(opt_callerNode == null || opt_callerNode.getId() != nextLinkedNode.getId()) {
            nextLinkedNode.clearRangeInfoForOffsetCache(this);
        }
    }
};


/**
 * @param {pwk.LeafNode.NodeContentChangedEvent} e
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

    var pagination = this.document_.getPagination()
      , prevLinkedNode = this.previousLinkedNode_
      , nextLinkedNode = this.nextLinkedNode_
      , doc = this.document_
      , currentNodePageId = pagination.getPageIndexByNodeId(this.getId())
      , length;

    // Check if some of linked node situated on the same page and merge it.
    if(prevLinkedNode != null && currentNodePageId == pagination.getPageIndexByNodeId(prevLinkedNode.getId())) {
        length = prevLinkedNode.getLinesCount();

        while(length--) {
            this.insertLine(prevLinkedNode.unlinkLine(prevLinkedNode.getLineAt(length)), true, 0);
        }

        doc.removeNode(prevLinkedNode);
        this.previousLinkedNode_ = null;
    }

    if(nextLinkedNode != null && currentNodePageId == pagination.getPageIndexByNodeId(nextLinkedNode.getId())) {
        length = nextLinkedNode.getLinesCount();

        while(length--) {
            this.insertLine(nextLinkedNode.unlinkLine(nextLinkedNode.getLineAt(0)), true);
        }

        doc.removeNode(nextLinkedNode);
        this.nextLinkedNode_ = null;
    }

    // Checking the width of node content and splitting it if it wider than page content or parent node if it's child node.
    var parentContentWidth = this.isChild() ? this.getParent().getSize().width : this.pageSettings_.getInnerWidth();

    // Move text from the line below, if it's possible
    lastUpdatedLine = this.normalizeBackward_(lastUpdatedLine, parentContentWidth);

    if(lastUpdatedLine != null) {
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
pwk.LeafNode.prototype.normalizeBackward_ = function(lastUpdatedLine, parentContentWidth) {
    var googArray = goog.array
      , lines = this.getLinesOfAllLinkedNodes_()
      , lastUpdateLineIndex = googArray.indexOf(lines, lastUpdatedLine)
      , lineAbove = lines[lastUpdateLineIndex - 1];

    if(goog.isDefAndNotNull(lineAbove)) { // Is first line?
        var googString = goog.string
          , lineAboveContent = lineAbove.getContent()
          , lastUpdatedLineContent = lastUpdatedLine.getContent()
          , loopsCount = 0
          , isSpace = false
          , lineBelowLength
          , contentToMoveInfo
          , calculatedAboveWidth
          , lastWord;

        do {
            if(contentToMoveInfo != null) { // Skip this case for first time

                lineAboveContent.insertText(contentToMoveInfo.text, lineAboveContent.getLength());

                if(!isSpace) {
                    lastUpdatedLineContent.removeAt(0, 1);
                } else {
                    lastUpdatedLineContent.removeFirstWord();
                }

                lineBelowLength = lastUpdatedLineContent.getLength();
                if(lineBelowLength == 0) {
                    lastUpdatedLine.getParentNode().removeLine(lastUpdatedLine);
                    lastUpdatedLine = lines[lastUpdateLineIndex + 1];
                    if(goog.isDefAndNotNull(lastUpdatedLine)) {
                        lastUpdatedLineContent = lastUpdatedLine.getContent();
                    } else {
                        // No line below? Exit...
                        return null;
                    }
                }
            }

            lastWord = lineAboveContent.getTextNodeValueAtOffset(lineAboveContent.getLength() - 1);
            isSpace = googString.isSpace(googString.normalizeWhitespace(lastWord)); // Check, if line above did not contains spaces
            contentToMoveInfo = !isSpace ? lastUpdatedLineContent.getContentInfoForOffset(0, 1) : lastUpdatedLineContent.getFirstWordInfo();

            calculatedAboveWidth = lineAbove.getWidth(false) + contentToMoveInfo.width;

            loopsCount++;
        } while(calculatedAboveWidth < parentContentWidth);

        if(loopsCount > 1) {
            lastUpdateLineIndex = googArray.indexOf(lines, lastUpdatedLine);
            var lineBelow = lines[lastUpdateLineIndex + 1];
            if(lineBelow != null) {
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
pwk.LeafNode.prototype.normalizeForward_ = function(lastUpdatedLine, parentContentWidth) {
    var lineContentWidth = lastUpdatedLine.getWidth(true)
      , lastUpdatedLineBelow;

    if(lineContentWidth > parentContentWidth) {
        var googString = goog.string
          , googArray = goog.array
          , lines = this.getLinesOfAllLinkedNodes_()
          , lastUpdateLineIndex = googArray.indexOf(lines, lastUpdatedLine)
          , lastUpdatedLineContent = lastUpdatedLine.getContent()
          , isLastLine = !goog.isDefAndNotNull(lines[lastUpdateLineIndex + 1])
          , lastUpdatedLineContentLength = lastUpdatedLineContent.getLength()
          , firstSpaceIndex = googString.trimRight(googString.normalizeWhitespace(lastUpdatedLineContent.getText())).indexOf(' ')
          , lastUpdatedContentText = ''
          , contentToMove = ''
          , lastUpdatedModifiedLineContentLength = 0
          , lastSpaceIndex
          , lineParentNode;

        if (firstSpaceIndex != -1 && (lineContentWidth >= parentContentWidth * 2)) {
            var prevContentToMove
              , prevLastUpdatedModifiedLineContentLength;

            do {
                prevContentToMove = contentToMove;
                prevLastUpdatedModifiedLineContentLength = lastUpdatedModifiedLineContentLength;

                contentToMove = lastUpdatedLineContent.copy(lastUpdatedContentText.length + firstSpaceIndex + 1);
                lastUpdatedContentText = lastUpdatedLineContent.copy(0, lastUpdatedLineContentLength - contentToMove.length);
                lastUpdatedModifiedLineContentLength = lastUpdatedContentText.length;

                lineContentWidth = lastUpdatedLineContent.getContentInfoForOffset(0, lastUpdatedModifiedLineContentLength).width;
                firstSpaceIndex = googString.trimRight(googString.normalizeWhitespace(contentToMove)).indexOf(' ');

            } while (lineContentWidth < parentContentWidth && firstSpaceIndex != -1);

            contentToMove = prevContentToMove;
            lastUpdatedModifiedLineContentLength = prevLastUpdatedModifiedLineContentLength;
        }
        else {
            var tempWord;
            lastUpdatedContentText = lastUpdatedLineContent.getText();
            lastUpdatedModifiedLineContentLength = lastUpdatedContentText.length

            do {
                lastSpaceIndex = googString.trimRight(googString.normalizeWhitespace(lastUpdatedContentText)).lastIndexOf(' ');

                // If remains big text only, then move last character only
                if (lastSpaceIndex != -1) {
                    contentToMove = lastUpdatedLineContent.copy(lastSpaceIndex + 1, lastUpdatedModifiedLineContentLength) + contentToMove;

                    lastUpdatedContentText = lastUpdatedLineContent.copy(0, lastUpdatedLineContentLength - contentToMove.length);
                    lastUpdatedModifiedLineContentLength = lastUpdatedContentText.length;
                } else {

                    do {
                        tempWord = googString.normalizeWhitespace(lastUpdatedLineContent.getTextNodeAtOffset(lastUpdatedModifiedLineContentLength - 1).data);
                        contentToMove = tempWord + contentToMove;
                        lastUpdatedContentText = lastUpdatedLineContent.copy(0, lastUpdatedLineContentLength - contentToMove.length);
                        lastUpdatedModifiedLineContentLength--;
                    } while (googString.isSpace(tempWord));
                }

                lineContentWidth = lastUpdatedLineContent.getContentInfoForOffset(0, lastUpdatedModifiedLineContentLength).width;

            } while (lineContentWidth > parentContentWidth);
        }

        lastUpdatedLineContent.removeAt(lastUpdatedModifiedLineContentLength);

        if(isLastLine) {
            lastUpdatedLineBelow = new pwk.Line(contentToMove);
            lineParentNode = lastUpdatedLine.getParentNode();
            googArray.insert(lineParentNode.getLines(), lastUpdatedLineBelow);
            lineParentNode.addChild(lastUpdatedLineBelow, true);
            pwk.NodeFormatter.applyNodeAttributes(this.getAttributes(), lastUpdatedLineBelow); // apply node attributes
        } else {
            lastUpdatedLineBelow = lines[lastUpdateLineIndex + 1];
            lastUpdatedLineBelow.getContent().insertText(contentToMove, 0);
        }
    }

    if(lastUpdatedLineBelow != null) {
        this.normalizeForward_(lastUpdatedLineBelow, parentContentWidth);
    }
};


/**
 * Make selection for node content by range
 * @param {pwk.primitives.NodeSelectionRange=} opt_nodeSelectionRange
 * @override
 */
pwk.LeafNode.prototype.select = function(opt_nodeSelectionRange) {
    // NOTE: Call select method for each line (exclude lines from linked node, add this functionality in future if required)

    if(this.isSelected_) {
        if(!goog.isDefAndNotNull(opt_nodeSelectionRange) && !goog.isDefAndNotNull(this.nodeSelectionRange_)) {
            // Whole node already selected, exit.
            return;
        }

        if(goog.isDefAndNotNull(opt_nodeSelectionRange) &&
           goog.isDefAndNotNull(this.nodeSelectionRange_) &&
           opt_nodeSelectionRange.equals(this.nodeSelectionRange_)) {
            // The same range already selected, exit.
            return;
        }
    }

    // Select all node content or only provided range?
    if(goog.isDefAndNotNull(opt_nodeSelectionRange)) {

        var lines = this.lines_
          , linesLength = lines.length
          , startlineIndex = goog.array.indexOf(lines, opt_nodeSelectionRange.startLine)
          , endLineIndex = goog.array.indexOf(lines, opt_nodeSelectionRange.endLine)
          , isSelectionInsideSingleLine = opt_nodeSelectionRange.startLine == opt_nodeSelectionRange.endLine;

        for(var i = 0; i < linesLength; i++) {
            if(i == startlineIndex) {
                if(isSelectionInsideSingleLine) {
                    lines[i].select(opt_nodeSelectionRange.startLineOffset, opt_nodeSelectionRange.endLineOffset);
                    break;
                } else {
                    lines[i].select(opt_nodeSelectionRange.startLineOffset);
                }
            }
            else if(i == endLineIndex) {
                if(!isSelectionInsideSingleLine) {
                    lines[i].select(0, opt_nodeSelectionRange.endLineOffset);
                }
                break;
            } else if(i > startlineIndex) {
                lines[i].select();
            }
        }

    } else { // Select all
        goog.array.forEach(this.lines_, function(line) {
            line.select();
        });
    }

    this.isSelected_ = true;
    this.nodeSelectionRange_ = opt_nodeSelectionRange || null;
};


/**
 * Remove selection from node
 */
pwk.LeafNode.prototype.unselect = function() {
    var lines = this.lines_;

    goog.array.forEach(lines, function(line) {
        line.unselect();
    });

    // Cleanup variables
    this.isSelected_ = false;
    this.nodeSelectionRange_ = null;
};


/**
 * @inheritDoc
 * @param {boolean=} opt_isBack
 */
pwk.LeafNode.prototype.removeSelection = function(opt_isBack) {
    // Actions:
    //  - update selection range
    //  - remove
    //  - unselect
    var nodeSelectionRange = this.nodeSelectionRange_
      , pwkDocument = /** @type {pwk.Document} */(this.document_)
      , pwkSelection = pwkDocument.getSelection()
      , selectionRange = pwkSelection.getRange()
      , isReversed = selectionRange.isReversed()
      , topSelectionRangeNode = isReversed ? selectionRange.getEndNode() : selectionRange.getStartNode()
      , bottomSelectionRangeNode = isReversed ? selectionRange.getStartNode() : selectionRange.getEndNode()
      , isNodeSelectedEntirely = this.isSelectedEntirely_();

    if(nodeSelectionRange.isCollapsed() && goog.isDefAndNotNull(opt_isBack)) {
        //TODO: Process "Delete" / "Backspace" buttons

    } else {
        var isRangeUpdateRequired = true; // Required to mark if range has been updated and no more update required

        // Update selection range
        // Move start/end position to the next/previous node
        // NOTE: Check if it's could be moved to base pwk.Node class
        // TODO: Refactoring required!

        if(topSelectionRangeNode === this && bottomSelectionRangeNode !== this || // Case 1: it's topmost selected node
           topSelectionRangeNode === this && bottomSelectionRangeNode === this // Case 2: it's single selected node and below exist other node that could be selected
                                          && isNodeSelectedEntirely
                                          && pwkDocument.indexOfNode(topSelectionRangeNode) < pwkDocument.getNodeCount() - 1) {

            var bottommostNode = /** @type {pwk.Node} */(pwkDocument.getNodeAt(pwkDocument.indexOfNode(topSelectionRangeNode) + 1));
            if(isReversed) {
                selectionRange.setEndPosition(bottommostNode.getFirstLine(), 0, true);
            } else {
                selectionRange.setStartPosition(bottommostNode.getFirstLine(), 0, true);
            }

            isRangeUpdateRequired = false;

        } else if(topSelectionRangeNode !== this && bottomSelectionRangeNode === this || // Case 1: it's bottommost selected node
                  topSelectionRangeNode === this && bottomSelectionRangeNode === this // Case 2: it's single selected node and above exist other node that could be selected
                                                 && isNodeSelectedEntirely
                                                 && pwkDocument.indexOfNode(bottomSelectionRangeNode) > 0) {

            var topmostNode = /** @type {pwk.Node} */(pwkDocument.getNodeAt(pwkDocument.indexOfNode(bottomSelectionRangeNode) - 1))
              , lastLine = /** @type {pwk.Line} */(topmostNode.getLastLine())
              , lastLineOffset = topmostNode.getOffsetByLineOffset(lastLine, lastLine.getLength());

            if(isReversed) {
                selectionRange.setStartPosition(lastLine, lastLineOffset, false);
            } else {
                selectionRange.setEndPosition(lastLine, lastLineOffset, false);
            }
            isRangeUpdateRequired = false;
        }

        // Remove node from document entirely
        if(isNodeSelectedEntirely) {
            pwkDocument.removeNode(this);
            if(topSelectionRangeNode === this && bottomSelectionRangeNode === this) {
                isRangeUpdateRequired = true;
            } else {
                return;
            }

        } else {
            var startLineIndex = this.indexOfLine(nodeSelectionRange.startLine)
              , endLineIndex = this.indexOfLine(nodeSelectionRange.endLine)
              , loopLine;

            // Remove selected node content
            // Cases:
            // 1. Selection could be on single line only
            // 2. Selected could be entire line
            // 3. Cursor could be located on the latest position without selection any word
            for(var i = startLineIndex; i <= endLineIndex; i++) {
                loopLine = this.lines_[i];
                if(loopLine.isSelectedEntirely()) {

                    // Remove line from node.
                    this.removeLine(loopLine);
                    endLineIndex--;
                    i--;
                } else {
                    var selectionOffsets = this.lines_[i].removeSelection();

                    // TODO: Update selection range. Move start/end position to the end position of the selection range of current line
                    if(isRangeUpdateRequired && selectionOffsets) {
                        var nodeOffset = this.getOffsetByLineOffset(loopLine, selectionOffsets.start);
                        if(isReversed) {
                            selectionRange.setEndPosition(loopLine, nodeOffset, false);
                        } else {
                            selectionRange.setStartPosition(loopLine, nodeOffset, false);
                        }
                    }
                }
            }

            if(startLineIndex + 1 in this.lines_) {
                this.dispatchEvent(new pwk.LeafNode.NodeContentChangedEvent(this.lines_[startLineIndex + 1]));
            }

        }

        if(isRangeUpdateRequired) {
            // Update selection by updated range
            var updateRangeInfo;
            if(isReversed) {
                updateRangeInfo = selectionRange.getEndNode().getRangeInfoForOffset(selectionRange.getEndNodeOffset())
                selectionRange.setStartPosition(updateRangeInfo.line, selectionRange.getEndNodeOffset());

                if(selectionRange.getStartNode() == selectionRange.getEndNode() && !isNodeSelectedEntirely) {
                    updateRangeInfo = selectionRange.getStartNode().getRangeInfoForOffset(selectionRange.getStartNodeOffset())
                    selectionRange.setEndPosition(updateRangeInfo.line, selectionRange.getStartNodeOffset());
                }
            } else {
                updateRangeInfo = selectionRange.getStartNode().getRangeInfoForOffset(selectionRange.getStartNodeOffset())
                selectionRange.setEndPosition(updateRangeInfo.line, selectionRange.getStartNodeOffset());

                if(selectionRange.getStartNode() == selectionRange.getEndNode() && !isNodeSelectedEntirely) {
                    updateRangeInfo = selectionRange.getEndNode().getRangeInfoForOffset(selectionRange.getEndNodeOffset())
                    selectionRange.setStartPosition(updateRangeInfo.line, selectionRange.getEndNodeOffset());
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
    if(goog.isDefAndNotNull(this.nodeSelectionRange_)) {
        return this.indexOfLine(this.nodeSelectionRange_.startLine) === 0
            && this.nodeSelectionRange_.startLineOffset === 0
            && this.indexOfLine(this.nodeSelectionRange_.endLine) == this.lines_.length - 1
            && this.nodeSelectionRange_.endLineOffset === this.nodeSelectionRange_.endLine.getLength();
    }
    return false;
};


/** @inheritDoc */
pwk.LeafNode.prototype.addChildAt = function(child, index, opt_render) {
    goog.base(this, 'addChildAt', child, index, opt_render);
    this.dispatchEvent(pwk.Document.EventType.FILLING_CHANGE);
};


/**
 * Component default css class.
 * @type {string}
 */
pwk.LeafNode.prototype.CSS_CLASS = 'pwk-leafnode';


/**
 * @enum {string}
 */
pwk.LeafNode.EventType = {
    CONTENT_CHANGED: goog.events.getUniqueId('node_content_changed')
};


/**
 * @param {pwk.Line} line
 * @extends {goog.events.Event}
 * @constructor
 */
pwk.LeafNode.NodeContentChangedEvent = function(line) {
    goog.events.Event.call(this, pwk.LeafNode.EventType.CONTENT_CHANGED, line);

    /**
     * @type {pwk.Line}
     */
    this.lastUpdatedLine = line;
};
goog.inherits(pwk.LeafNode.NodeContentChangedEvent, goog.events.Event);
