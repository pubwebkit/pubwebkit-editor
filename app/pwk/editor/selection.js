/**
 * @fileoverview Represents a selected area of the document.
 * Contains the cursor position and the text selection of an edit session.
 *
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.Selection');

goog.require('goog.events.EventTarget');
goog.require('pwk.layer.Caret');
goog.require('goog.fx.dom');
goog.require('goog.fx.easing');


/**
 * @param {pwk.Document} doc
 * @extends {goog.events.EventTarget}
 * @constructor
 */
pwk.Selection = function(doc) {
    goog.events.EventTarget.call(this);

    /**
     * Document of current edit session.
     * @type {pwk.Document}
     * @private
     */
    this.document_ = doc;

    /**
     * @type {pwk.Range}
     * @private
     */
    this.range_;

    /**
     * Caret
     * @type {pwk.layer.Caret}
     * @private
     */
    this.caret_ = new pwk.layer.Caret(this.document_.getDomHelper());

    /**
     * @type {goog.math.Rect}
     * @private
     */
    this.lastModifiedBounds_;

    /**
     * @type {pwk.Range}
     * @private
     */
    this.lastModifiedRange_;

    /**
     * @type {?pwk.Selection.CaretDirection}
     * @private
     */
    this.lastModifiedBoundsDirection_;

    /**
     * @type {?pwk.Selection.CaretDirection}
     * @private
     */
    this.lastBoundsDirection_;

    /**
     * @type {Element}
     * @private
     */
    this.containerElement_;

    /**
     * @type {number}
     * @private
     */
    this.scrollToTasksCount_ = 0;

    /**
     * @type {goog.fx.dom.Scroll}
     * @private
     */
    this.scrollToRangePositionScrollInstance_;
};
goog.inherits(pwk.Selection, goog.events.EventTarget);


/**
 * Initialize selection for document.
 */
pwk.Selection.prototype.initialize = function() {
    var caret = this.caret_;

    this.document_.addChild(caret, true);
    caret.show();
    caret.listen(pwk.layer.Caret.EventType.BEFORE_UPDATE, this.caretBeforeUpdate_, false, this);
    caret.listen(pwk.layer.Caret.EventType.AFTER_UPDATE, this.caretAfterUpdate_, false, this);

    this.containerElement_ = goog.dom.getElementByClass(pwk.EditorContainer.CSS_CLASS);
};


/**
 * @param {goog.events.Event} e Event object.
 * @private
 */
pwk.Selection.prototype.caretBeforeUpdate_ = function(e) {

};


/**
 * @param {pwk.layer.Caret.AfterUpdateEvent} e Event object.
 * @private
 */
pwk.Selection.prototype.caretAfterUpdate_ = function(e) {

    if(!goog.isDefAndNotNull(this.lastModifiedBounds_) ||
        this.lastBoundsDirection_ != pwk.Selection.CaretDirection.DOWN &&
        this.lastBoundsDirection_ != pwk.Selection.CaretDirection.UP) {

        this.lastBounds_ = e.getBounds();
        this.lastModifiedBounds_ = this.lastBounds_;
        this.lastModifiedRange_ = /** @type {pwk.Range} */ (goog.object.clone(this.range_));
    }

    this.scrollToRangePosition(true);
};


/**
 * Get document caret instance
 * @returns {pwk.layer.Caret}
 */
pwk.Selection.prototype.getCaret = function() {
    return this.caret_;
};

/**
 * Scroll to range position
 * @param {boolean=} opt_isIncreaseTask
 */
pwk.Selection.prototype.scrollToRangePosition = function(opt_isIncreaseTask) {
    if(opt_isIncreaseTask === true) {
        this.scrollToTasksCount_++;
    }

    if(this.scrollToTasksCount_ > 0) {
        var scroll = this.scrollToRangePositionScrollInstance_;
        if(scroll == null || scroll.isStopped()) {

            this.scrollToTasksCount_--;

            var range = this.range_
              , element;

            if(range.isCollapsed()) {
                element = this.caret_.getElement();
            } else {
                element = range.getEndLine().getElement();
            }

            var googStyle = goog.style
              , container = this.containerElement_
              , containerHeight = googStyle.getSize(container).height
              , elementHeight = googStyle.getSize(element).height
              , y = googStyle.getContainerOffsetToScrollInto(element, container).y
              , caretClientPosition = googStyle.getClientPosition(element)
              , isTop = false
              , isBottom = false;

            if(caretClientPosition.y < 0) {
                isTop = true;
            } else if(caretClientPosition.y + elementHeight > containerHeight) {
                isBottom = true;
            }

            if(isTop || isBottom) {
                scroll = new goog.fx.dom.Scroll(container,
                                                [0, container.scrollTop],
                                                [0, isTop ? y - 60 - elementHeight : y + 60 + elementHeight],
                                                120,
                                                goog.fx.easing.easeOut);

                this.scrollToRangePositionScrollInstance_ = scroll;

                scroll.listen(goog.fx.Transition.EventType.END, goog.bind(this.scrollToRangePosition, this, false));
                scroll.play();
            } else {
                this.scrollToRangePosition(false);
            }
        }
    }
};


/**
 * Update caret from range.
 * @param {pwk.Range=} opt_range
 */
pwk.Selection.prototype.updateCaretFromRange = function(opt_range) {
    if(goog.isDefAndNotNull(opt_range)) {
        this.range_ = opt_range;
    }

    if(goog.isDefAndNotNull(this.range_)) {
        if(this.range_.isCollapsed()) {
            this.lastBoundsDirection_ = null;
            this.lastModifiedBoundsDirection_ = null;
            this.caret_.show();
            this.caret_.update(this);
        } else {
            this.updateSelectionFromRange(opt_range);
        }
    }
};


/**
 * Update selection from range.
 * @param {pwk.Range=} opt_range
 */
pwk.Selection.prototype.updateSelectionFromRange = function(opt_range) {
    // TODO: Call select() method for required nodes and pass proper parameters

    if(goog.isDefAndNotNull(opt_range)) {
        this.range_ = opt_range;
    }

};


/**
 * Get current range
 * @return {pwk.Range}
 */
pwk.Selection.prototype.getRange = function() {
    return this.range_;
};


/**
 * Set range
 * @param {pwk.Range} range
 */
pwk.Selection.prototype.setRange = function(range) {
    this.range_ = range;
};


/**
 * Move caret left
 */
pwk.Selection.prototype.moveCaretLeft = function() {
    var range = this.range_;

    this.removeSelection();

    if(range.isCollapsed()) {
        var startNodeOffset = range.getStartNodeOffset();

        if(startNodeOffset == 0) { // Move to node above
            var editorDoc = this.document_
                , startNodeIndex = editorDoc.indexOfNode(range.getStartNode())
                , prevNode = /** @type {pwk.LeafNode} */(editorDoc.getNodeAt(startNodeIndex - 1));

            if(goog.isDefAndNotNull(prevNode)) { // If node above exist, then move to the end of the last line
                var line = prevNode.getLastLine()
                    , nodeLength = prevNode.getLength();

                range.setStartPosition(line, nodeLength);
                range.setEndPosition(line, nodeLength);
            }

        } else { // Move cursor left inside node
            var newOffset = (startNodeOffset - 1)
                , rangeInfo = range.getStartNode().getRangeInfoForOffset(newOffset);

            if(range.getStartLine() != rangeInfo.line && rangeInfo.isEndOfLine) { // Move to the first position
                range.setStartPosition(range.getStartLine(), newOffset, true);
                range.setEndPosition(range.getStartLine(), newOffset, true);
            } else {
                range.setStartPosition(rangeInfo.line, newOffset);
                range.setEndPosition(rangeInfo.line, newOffset);
            }
        }
    } else {
        range.collapse(true);
    }

    this.updateCaretFromRange();
    this.lastBoundsDirection_ = pwk.Selection.CaretDirection.LEFT;
    this.lastModifiedBoundsDirection_ = pwk.Selection.CaretDirection.LEFT;
};


/**
 * Move caret right.
 * @param {boolean=} opt_isTyping If this flag is set, then caret didn't be moved to the first line position when line changed.
 */
pwk.Selection.prototype.moveCaretRight = function(opt_isTyping) {
    var range = this.range_;

    this.removeSelection();

    if(range.isCollapsed()) {
        var startOffset = range.getStartNodeOffset()
          , rangeStartNode = range.getStartNode()
          , newPositionRangeInfo = rangeStartNode.getRangeInfoForOffset(startOffset + 1)
          , newPositionLinkedRangeInfo = rangeStartNode.getRangeInfoByLinkedNodesOffset(range.getEndLineRangeInfo().linkedNodeOffset + 1)
          , editorDoc = this.document_;

        // Move to node below
        if(newPositionRangeInfo == null && newPositionLinkedRangeInfo == null) {
            var startNodeIndex = editorDoc.indexOfNode(range.getStartNode())
              , node = editorDoc.getNodeAt(startNodeIndex + 1);

            if(goog.isDefAndNotNull(node)) {
                var firstLine = node.getFirstLine();
                range.setStartPosition(firstLine, 0);
                range.setEndPosition(firstLine, 0);
            }

        } else { // Move to the right inside current node
            if(newPositionRangeInfo != null) {
                if(range.getStartLine() != newPositionRangeInfo.line && // Line changed
                    range.getStartLineRangeInfo().isEndOfLine && // Cursor has moved from last position of line above
                    newPositionRangeInfo.lineOffset == 1 &&
                    !goog.isDefAndNotNull(opt_isTyping)) { // Move caret to the start of line

                    range.setStartPosition(newPositionRangeInfo.line, startOffset, true);
                    range.setEndPosition(newPositionRangeInfo.line, startOffset, true);
                } else {
                    range.setStartPosition(newPositionLinkedRangeInfo.line, newPositionLinkedRangeInfo.nodeOffset);
                    range.setEndPosition(newPositionLinkedRangeInfo.line, newPositionLinkedRangeInfo.nodeOffset);
                }
            } else if(newPositionLinkedRangeInfo != null) {
                var isStartOfLIne = !opt_isTyping
                  , offset = newPositionLinkedRangeInfo.nodeOffset - (opt_isTyping ? 0 : 1);

                range.setStartPosition(newPositionLinkedRangeInfo.line, offset, isStartOfLIne);
                range.setEndPosition(newPositionLinkedRangeInfo.line, offset, isStartOfLIne);

            }
        }

    } else {
        range.collapse(false);
    }

    this.updateCaretFromRange();
    this.lastBoundsDirection_ = pwk.Selection.CaretDirection.RIGHT;
    this.lastModifiedBoundsDirection_ = pwk.Selection.CaretDirection.RIGHT;
};


/**
 * Move caret to end of current line
 */
pwk.Selection.prototype.moveCaretLineEnd = function() {
    var range = this.range_;

    this.removeSelection();

    if(!range.isCollapsed()) {
        range.collapse(false);
    }

    var line = range.getStartLine()
      , newOffset = line.getParentNode().getOffsetByLineOffset(line, line.getLength());

    range.setStartPosition(range.getStartLine(), newOffset);
    range.setEndPosition(range.getStartLine(), newOffset);

    this.updateCaretFromRange();
    this.lastBoundsDirection_ = pwk.Selection.CaretDirection.END;
    this.lastModifiedBoundsDirection_ = pwk.Selection.CaretDirection.END;
};


/**
 * Move caret to start of current line
 */
pwk.Selection.prototype.moveCaretLineStart = function() {
    var range = this.range_;

    this.removeSelection();

    if(!range.isCollapsed()) {
        range.collapse(true);
    }

    var newOffset = range.getStartNodeOffset() - range.getStartLineOffset();

    range.setStartPosition(range.getStartLine(), newOffset, true);
    range.setEndPosition(range.getEndLine(), newOffset, true);

    this.updateCaretFromRange();
    this.lastBoundsDirection_ = pwk.Selection.CaretDirection.HOME;
    this.lastModifiedBoundsDirection_ = pwk.Selection.CaretDirection.HOME;
};


/**
 * Move caret up.
 */
pwk.Selection.prototype.moveCaretUp = function() {
    var range = this.range_;

    this.removeSelection();

    if(!range.isCollapsed()) {
        range.collapse(true);
        this.updateCaretFromRange();
    }

    var editorDoc = this.document_
        , startLine = range.getStartLine()
        , startNode = range.getStartNode()
        , startLineIndex = startNode.indexOfLine(startLine)
        , line
        , newPositionOffset
        , lineParentNode;

    // Looking for line above
    if(startLineIndex > 0) {
        line = startNode.getLineAt(startLineIndex - 1);
    } else {
        var startNodeIndex = editorDoc.indexOfNode(startNode);
        lineParentNode = editorDoc.getNodeAt(startNodeIndex - 1);

        if(goog.isDefAndNotNull(lineParentNode)) {
            line = lineParentNode.getLastLine();
        }
    }

    // If line exist, moving caret on it
    if(goog.isDefAndNotNull(line)) { // If line above is exist

        lineParentNode = lineParentNode || line.getParentNode();

        // If current position is start of line
        if(this.lastModifiedRange_.getStartLineOffset() == 0) {
            newPositionOffset = lineParentNode.getOffsetByLineOffset(line, 0);
            range.setStartPosition(line, newPositionOffset, true);
            range.setEndPosition(line, newPositionOffset, true);

            // If last direction was to the end of line
        } else if(this.lastModifiedBoundsDirection_ == pwk.Selection.CaretDirection.END) {
            newPositionOffset = lineParentNode.getOffsetByLineOffset(line, line.getLength());
            range.setStartPosition(line, newPositionOffset);
            range.setEndPosition(line, newPositionOffset);

            // Navigating caret to the line above to the same coordinates or nearest
        } else {

            var lineLength = line.getLength()
              , lastModifiedStartLineOffset = this.lastModifiedRange_.getStartLineOffset()
              , initialOffset = lastModifiedStartLineOffset > lineLength ? lineLength : lastModifiedStartLineOffset
              , lineRange;

            newPositionOffset = lineParentNode.getOffsetByLineOffset(line, initialOffset);
            if(lastModifiedStartLineOffset == 0 && lastModifiedStartLineOffset < lineLength) {
                lineRange = pwk.Range.createFromNodes(line, newPositionOffset, line, newPositionOffset, true, true);
            } else {
                lineRange = pwk.Range.createFromNodes(line, newPositionOffset, line, newPositionOffset);
            }

            var prevNodeOffsetX = this.lastModifiedBounds_.left
              , lineBounds = this.getBoundsForRange(lineRange)
              , lineOffsetX = lineBounds.left
              , isStartOfLine = false
              , isUseLastOffset = false
              , prevLoopBoundsLeft;

            if (lineOffsetX > prevNodeOffsetX) { // If offset above is longer
                do {
                    prevLoopBoundsLeft = lineBounds.left;
                    newPositionOffset = lineRange.getStartNodeOffset() - 1;
                    isStartOfLine = (lineRange.getStartLineOffset() - 1) == 0;

                    lineRange.setStartPosition(line, newPositionOffset, isStartOfLine);
                    lineRange.setEndPosition(line, newPositionOffset, isStartOfLine);
                    lineBounds = this.getBoundsForRange(lineRange);

                    lineOffsetX = lineBounds.left;
                } while(lineOffsetX > prevNodeOffsetX);

                isUseLastOffset = !(Math.abs(prevNodeOffsetX - lineOffsetX) > Math.abs(prevNodeOffsetX - prevLoopBoundsLeft));
                newPositionOffset = isUseLastOffset ? lineRange.getStartNodeOffset() : lineRange.getStartNodeOffset() + 1;

            } else if (lineOffsetX < prevNodeOffsetX) { // If offset above is less
                do {
                    prevLoopBoundsLeft = lineBounds.left;

                    if(lineLength === lineRange.getStartLineOffset()) { break; } // Last word? Exit from loop

                    newPositionOffset = lineRange.getStartNodeOffset() + 1;

                    lineRange.setStartPosition(line, newPositionOffset);
                    lineRange.setEndPosition(line, newPositionOffset);
                    lineBounds = this.getBoundsForRange(lineRange);

                    lineOffsetX = lineBounds.left;

                } while(lineOffsetX < prevNodeOffsetX);

                isUseLastOffset = !(Math.abs(prevNodeOffsetX - lineOffsetX) > Math.abs(prevNodeOffsetX - prevLoopBoundsLeft));
                newPositionOffset = isUseLastOffset ? lineRange.getStartNodeOffset() : lineRange.getStartNodeOffset() - 1;
            }

            range.setStartPosition(line, newPositionOffset, isStartOfLine && isUseLastOffset);
            range.setEndPosition(line, newPositionOffset, isStartOfLine && isUseLastOffset);
        }
    }

    this.lastBoundsDirection_ = pwk.Selection.CaretDirection.UP;
    this.caret_.show();
    this.caret_.update(this);
};


/**
 * Move caret down
 */
pwk.Selection.prototype.moveCaretDown = function() {
    var range = this.range_;

    this.removeSelection();

    if(!range.isCollapsed()) {
        range.collapse(false);
        this.updateCaretFromRange();
    }

    var editorDoc = this.document_
        , startLine = range.getStartLine()
        , startNode = range.getStartNode()
        , startLineIndex = startNode.indexOfLine(startLine)
        , line = startNode.getLineAt(startLineIndex + 1)
        , newPositionOffset
        , lineParentNode;

    // If line below in the current node does not exist, then looking for line in node below
    if(!goog.isDefAndNotNull(line)) {
        var startNodeIndex = editorDoc.indexOfNode(startNode);
        lineParentNode = editorDoc.getNodeAt(startNodeIndex + 1);

        if(goog.isDefAndNotNull(lineParentNode)) {
            line = lineParentNode.getFirstLine();
        }
    }

    // If line below exist
    if(goog.isDefAndNotNull(line)) {
        var lastModifiedRange = this.lastModifiedRange_;

        lineParentNode = lineParentNode || line.getParentNode();

        // If current position is start of line
        if(lastModifiedRange.getStartLineOffset() == 0) {
            newPositionOffset = lineParentNode.getOffsetByLineOffset(line, 0);
            range.setStartPosition(line, newPositionOffset, true);
            range.setEndPosition(line, newPositionOffset, true);

            // If last direction was to the end of line
        } else if(this.lastModifiedBoundsDirection_ == pwk.Selection.CaretDirection.END) {
            newPositionOffset = lineParentNode.getOffsetByLineOffset(line, line.getLength());
            range.setStartPosition(line, newPositionOffset);
            range.setEndPosition(line, newPositionOffset);

            // Navigating caret to the line below to the same coordinates or nearest
        } else {

            var lineLength = line.getLength()
                , lastModifiedStartLineOffset = lastModifiedRange.getStartLineOffset()
                , initialOffset = lastModifiedStartLineOffset > lineLength ? lineLength : lastModifiedStartLineOffset
                , lineRange;

            newPositionOffset = lineParentNode.getOffsetByLineOffset(line, initialOffset);
            if(lastModifiedStartLineOffset == 0 && lastModifiedStartLineOffset < lineLength) {
                lineRange = pwk.Range.createFromNodes(line, newPositionOffset, line, newPositionOffset, true, true);
            } else {
                lineRange = pwk.Range.createFromNodes(line, newPositionOffset, line, newPositionOffset);
            }

            var prevNodeOffsetX = this.lastModifiedBounds_.left
                , lineBounds = this.getBoundsForRange(lineRange)
                , lineOffsetX = lineBounds.left
                , isStartOfLine = false
                , isUseLastOffset = false
                , prevLoopBoundsLeft;

            if (lineOffsetX > prevNodeOffsetX) { // If offset below is longer
                do {
                    prevLoopBoundsLeft = lineBounds.left;

                    newPositionOffset = lineRange.getStartNodeOffset() - 1;
                    isStartOfLine = (lineRange.getStartLineOffset() - 1) == 0;

                    lineRange.setStartPosition(line, newPositionOffset, isStartOfLine);
                    lineRange.setEndPosition(line, newPositionOffset, isStartOfLine);
                    lineBounds = this.getBoundsForRange(lineRange);

                    lineOffsetX = lineBounds.left;
                } while(lineOffsetX > prevNodeOffsetX);

                isUseLastOffset = !(Math.abs(prevNodeOffsetX - lineOffsetX) > Math.abs(prevNodeOffsetX - prevLoopBoundsLeft));
                newPositionOffset = isUseLastOffset ? lineRange.getStartNodeOffset() : lineRange.getStartNodeOffset() + 1;

            } else if (lineOffsetX < prevNodeOffsetX) { // If offset above is less
                do {
                    prevLoopBoundsLeft = lineBounds.left;

                    if(lineLength === lineRange.getStartLineOffset()) { break; } // Last word? Exit from loop

                    newPositionOffset = lineRange.getStartNodeOffset() + 1;

                    lineRange.setStartPosition(line, newPositionOffset);
                    lineRange.setEndPosition(line, newPositionOffset);
                    lineBounds = this.getBoundsForRange(lineRange);

                    lineOffsetX = lineBounds.left;

                } while(lineOffsetX < prevNodeOffsetX);

                isUseLastOffset = !(Math.abs(prevNodeOffsetX - lineOffsetX) > Math.abs(prevNodeOffsetX - prevLoopBoundsLeft));
                newPositionOffset = isUseLastOffset ? lineRange.getStartNodeOffset() : lineRange.getStartNodeOffset() - 1;
            }

            range.setStartPosition(line, newPositionOffset, isStartOfLine && isUseLastOffset);
            range.setEndPosition(line, newPositionOffset, isStartOfLine && isUseLastOffset);
        }
    }

    this.lastBoundsDirection_ = pwk.Selection.CaretDirection.DOWN;
    this.caret_.show();
    this.caret_.update(this);
};


/**
 * Returns a bounding rectangle for a given range in document space.
 * @param {pwk.Range=} opt_range
 * @param {{boundingHeight: boolean, boundingWidth: boolean, boundingLeft: boolean, boundingTop: boolean}=} opt_disable_for_ie It's could increase performance in IE
 * @return {goog.math.Rect}
 */
pwk.Selection.prototype.getBoundsForRange = function(opt_range, opt_disable_for_ie) {
    // TODO: Required to improve performance in this place. It's very critical!!!! If it's possible
    var range = opt_range || this.range_
      , bounds = new goog.math.Rect(0, 0, 0, 0);

    if(range.isCollapsed()) {
        var googStyle = goog.style
          , googDom = goog.dom
          , pwkUtilsDom = pwk.utils.dom
          , startLineContent = range.getStartLine().getContent()
          , startNodeContentEl = startLineContent.getElement()
          , startNodeLength = startLineContent.getNormalizedText().length
          , documentElement = this.document_.getElement()
          , documentClientPosition = googStyle.getClientPosition(documentElement)
          , startLineOffset = range.getStartLineOffset()
          , endLineOffset = range.getEndLineOffset()
          , endNodeContentEl = range.getEndLine().getContent().getElement()
          , boundingHeight
          , boundingWidth
          , boundingLeft
          , boundingTop
          , gRange;


        // Detect Internet Explorer
        if(goog.userAgent.IE) {
            var textRange = document.body.createTextRange()
              , browserZoomLevel = screen.deviceXDPI / screen.logicalXDPI
              , isExclude = opt_disable_for_ie != null ? opt_disable_for_ie : {boundingHeight: false, boundingWidth: false, boundingLeft: false, boundingTop: false };

            if (startNodeLength == 0) {
                startNodeContentEl.innerHTML = '&#8203;';

                textRange.moveToElementText(startNodeContentEl);
                textRange.moveStart('character', startLineOffset);
                textRange.collapse();
                textRange.moveEnd('character', 1);

                boundingHeight = isExclude.boundingHeight ? 0 : textRange.boundingHeight / browserZoomLevel;
                boundingWidth = isExclude.boundingWidth ? 0 : textRange.boundingWidth / browserZoomLevel;
                boundingLeft = isExclude.boundingLeft ? 0 : textRange.boundingLeft / browserZoomLevel;
                boundingTop = isExclude.boundingTop ? 0 : textRange.boundingTop / browserZoomLevel;

                startNodeContentEl.innerHTML = '';
            } else {
                textRange.moveToElementText(startNodeContentEl);
                textRange.moveStart('character', (endLineOffset == 0 ? startLineOffset : startLineOffset - 1));
                textRange.collapse();
                textRange.moveEnd('character', 1);

                boundingHeight = isExclude.boundingHeight ? 0 : textRange.boundingHeight / browserZoomLevel;
                boundingWidth = isExclude.boundingWidth ? 0 : textRange.boundingWidth / browserZoomLevel;
                boundingLeft = isExclude.boundingLeft ? 0 : textRange.boundingLeft / browserZoomLevel;
                boundingTop = isExclude.boundingTop ? 0 : textRange.boundingTop / browserZoomLevel;
            }

            bounds.left = boundingLeft - documentClientPosition.x + (range.getEndLineOffset() == 0 ? 0 : boundingWidth) - 0.6;
            bounds.top = boundingTop - documentClientPosition.y;
            bounds.width = boundingWidth;
            bounds.height = boundingHeight;

        } else if(goog.userAgent.GECKO || goog.userAgent.WEBKIT) { // For GECKO and WebKit based browsers
            gRange = document.createRange();

            if(startNodeLength == 0) {
                endNodeContentEl.innerHTML = '\u0020';
            }

            gRange.selectNodeContents(endNodeContentEl);
            gRange.setStart(endNodeContentEl, (endLineOffset == 0 ? startLineOffset : startLineOffset - 1));
            gRange.setEnd(endNodeContentEl, (endLineOffset == 0 ? 1 : endLineOffset));

            var boundsClientRect = gRange.getBoundingClientRect();

            if(startNodeLength == 0) {
                endNodeContentEl.innerHTML = '';
            }

            bounds.left = boundsClientRect.left - documentClientPosition.x + (range.getEndLineOffset() == 0 ? 0 : boundsClientRect.width) - 0.6;
            bounds.top = boundsClientRect.top - documentClientPosition.y;
            bounds.width = boundsClientRect.width;
            bounds.height = boundsClientRect.height;

        } else { // For other browsers
            var startMarker
              , endMarker
              , startMarkerClientPosition
              , endMarkerClientPosition;

            if(startNodeLength == 0) {
                startNodeContentEl.innerHTML = '\u0020';
            }

            if(range.getStartLineOffset() == 0) {
                gRange = googDom.Range.createFromNodes(startNodeContentEl, 0, endNodeContentEl, 0);
            } else {
                gRange = googDom.Range.createFromNodes(startNodeContentEl, range.getStartLineOffset() - 1, endNodeContentEl, range.getEndLineOffset());
            }

            // Create markers
            startMarker = pwkUtilsDom.createDummyNode();
            endMarker = pwkUtilsDom.createDummyNode();

            gRange.surroundWithNodes(startMarker, endMarker);

            startMarkerClientPosition = googStyle.getClientPosition(startMarker);
            endMarkerClientPosition = googStyle.getClientPosition(endMarker);

            bounds.left = endMarkerClientPosition.x - documentClientPosition.x - 0.75;
            bounds.top = endMarkerClientPosition.y - documentClientPosition.y;
            bounds.width = bounds.left - (startMarkerClientPosition.x - documentClientPosition.x);
            bounds.height = startNodeContentEl.offsetHeight;

            if(startNodeLength == 0) {
                startNodeContentEl.innerHTML = '';
            } else {
                startMarker.parentNode.removeChild(startMarker);
                endMarker.parentNode.removeChild(endMarker);
            }
        }
    } else {

    }

    return bounds;
};


/**
 * @param {number} x
 * @param {number} y
 * @returns {pwk.Range}
 */
pwk.Selection.prototype.getSelectionRangeFromPoint = function(x, y) {
    // NOTE: To calculate proper position for selection/caret I decided use document.elementFromPoint for all browsers.
    // Supported by all required browsers. For more information http://www.quirksmode.org/dom/w3c_cssom.html
    var doc = this.document_
      , lineElement = this.getClosestLineElementToOffset_(x, y)
      , nodeElement = goog.dom.getParentElement(lineElement)
      , line = /** @type pwk.Line */(doc.getNode(nodeElement.id).getChild(lineElement.id))
      , range = this.getLineRangeFromPoint_(line, x);

    return range;
};

/**
 * @param {pwk.Line} line
 * @param {number} x
 * @return {pwk.Range}
 * @private
 */
pwk.Selection.prototype.getLineRangeFromPoint_ = function(line, x) {
    // TODO: Optimization required! Add ability to detect from which side of line required to start the loop
    var node = line.getParentNode()
      , nodeOffset = node.getOffsetByLineOffset(line, 0)
      , lineLength = line.getLength()
      , documentElement = this.document_.getElement()
      , documentClientPosition = goog.style.getClientPosition(documentElement)
      , range = pwk.Range.createFromNodes(line, nodeOffset, line, nodeOffset, true, false)
      , loopRange
      , rangeInfo
      , closest
      , biggerCount = 0;

    for (var i = 0; i <= lineLength; i++) {
        rangeInfo = node.getRangeInfoForOffset(nodeOffset + i);

        if(line != rangeInfo.line) {
            loopRange = pwk.Range.createFromNodes(line, nodeOffset + i, line, nodeOffset + i, true, true);
        } else {
            loopRange = pwk.Range.createFromNodes(line, nodeOffset + i, line, nodeOffset + i, rangeInfo.lineOffset == 0, false);
        }

        var excludeParametersForIe = { boundingHeight: true, boundingWidth: false, boundingLeft: false, boundingTop: true }
          , bounds = this.getBoundsForRange(loopRange, excludeParametersForIe)
          , distance = bounds.left + documentClientPosition.x + 0.75;

        if (closest == null || Math.abs(distance - x) < Math.abs(closest - x)) {
            closest = distance;
            range = loopRange;
        }

        if(distance > closest) { biggerCount++; }
        if(biggerCount > 1) { break; }
    }

    return range;
};


/**
 * @param {number} x
 * @param {number} y
 * @returns {Element} line element
 * @private
 */
pwk.Selection.prototype.getClosestLineElementToOffset_ = function(x, y) {
    // TODO: Optimisation required, but maybe it can be stay as is. Double check required
    var googDomClasses = goog.dom.classes
      , googDom = goog.dom
      , googStyle = goog.style
      , receiver = document.elementFromPoint(x, y)
      , lineCssClass = pwk.Line.CSS_CLASS
      , el = null
      , parentElement
      , childElements = []
      , l;

    if(googDomClasses.has(receiver, pwk.LineContent.CSS_CLASS)) {
        return googDom.getParentElement(receiver);

    } else if(googDomClasses.has(receiver, pwk.Editor.CSS_CLASS)) {
        var viewPortSize = googDom.getViewportSize();
        receiver = document.elementFromPoint(viewPortSize.width / 2, y);

    } else if(googDomClasses.has(receiver, pwk.Document.CSS_CLASS)) { // Between pages
        receiver = document.elementFromPoint(x, y - 15);
        if(receiver != null) {
            parentElement = googDom.getAncestorByClass(receiver, pwk.Page.CSS_CLASS);
            childElements = googDom.getElementsByClass(lineCssClass, parentElement);
        }

        receiver = document.elementFromPoint(x, y + 15);
        if(receiver != null) {
            var googArray = goog.array
            parentElement = googDom.getAncestorByClass(receiver, pwk.Page.CSS_CLASS);
            childElements = googArray.concat(googArray.toArray(childElements), googArray.toArray(googDom.getElementsByClass(lineCssClass, parentElement)));
        }

    }

    l = childElements.length;

    if(parentElement == null && l == 0) {
        parentElement = googDom.getAncestorByClass(receiver, pwk.Page.CSS_CLASS);
        childElements = googDom.getElementsByClass(lineCssClass, parentElement);
        l = childElements.length;
    }

    for (var i = 0; i < l; i++) {
        if (i in childElements) {
            var item = childElements[i];
            var elBounds = googStyle.getBounds(item).toBox()
              , distance
              , dx
              , dy
              , minDistance;

            if ((x >= elBounds.left) && (x <= elBounds.right) &&
                (y >= elBounds.top)  && (y <= elBounds.bottom)) {
                el = item;
                break;
            }

            var offsets = [[elBounds.left, elBounds.top], [elBounds.right, elBounds.top], [elBounds.left, elBounds.bottom], [elBounds.right, elBounds.bottom]];
            for (var off in offsets) {
                dx = offsets[off][0] - x;
                dy = offsets[off][1] - y;
                distance = Math.sqrt((dx*dx) + (dy*dy));
                if (minDistance === undefined || distance < minDistance) {
                    minDistance = distance;
                    el = item;
                }
            }
        }
    }

    return el;
};


/**
 * @param {pwk.Range=} opt_range
 */
pwk.Selection.prototype.selectDocument = function(opt_range) {
    var doc = this.document_
      , currentRange = this.range_;

    this.caret_.hide();

    if(!opt_range) {
        var firstNode = doc.getNodeAt(0)
          , firstLine = firstNode.getFirstLine()
          , lastNode = doc.getNodeAt(doc.getNodeCount() - 1)
          , lastLine = lastNode.getLastLine()
          , nodesCount = doc.getNodeCount();

        // Create range for all document if it is not passed
        opt_range = pwk.Range.createFromNodes(firstLine, 0, lastLine, lastNode.getLength(), true, false);

        for(var i = 0; i < nodesCount; i++) {
            doc.getNodeAt(i).select();
        }

    } else {
        if(pwk.Range.equal(opt_range, currentRange) && !opt_range.isCollapsed()) { return; } // This is a very nice find, saves a lot of CPU resources

        var newStartNode = opt_range.getStartNode()
          , newEndNode = opt_range.getEndNode()
          , currentStartNode = currentRange.getStartNode()
          , currentEndNode = currentRange.getEndNode()
          , currentStartNodeIndex = doc.indexOfNode(currentStartNode)
          , currentEndNodeIndex = doc.indexOfNode(currentEndNode)
          , newStartNodeIndex = doc.indexOfNode(newStartNode)
          , newEndNodeIndex = doc.indexOfNode(newEndNode)
          , condition
          , startLine
          , endLine
          , endLineOffset
          , startLineOffset
          , nodeSelectionRange;


        if(currentStartNodeIndex == newStartNodeIndex &&
            currentEndNodeIndex == newEndNodeIndex) { // Reselect end node only

            condition = (newStartNode == newEndNode);

            if(opt_range.isReversed()) {
                endLine = condition ? opt_range.getStartLine() : newEndNode.getLastLine();
                endLineOffset = condition ? opt_range.getStartLineOffset() : endLine.getLength();
                nodeSelectionRange = new pwk.primitives.NodeSelectionRange(opt_range.getEndLine(), opt_range.getEndLineOffset(), endLine, endLineOffset);

            } else {
                startLine = condition ? opt_range.getStartLine() : newEndNode.getFirstLine();
                startLineOffset = condition ? opt_range.getStartLineOffset() : 0;
                nodeSelectionRange = new pwk.primitives.NodeSelectionRange(startLine, startLineOffset, opt_range.getEndLine(), opt_range.getEndLineOffset());

            }

            newEndNode.unselect();
            newEndNode.select(nodeSelectionRange);

        } else if(currentStartNodeIndex == newStartNodeIndex &&
            currentStartNodeIndex < newEndNodeIndex &&
            currentEndNodeIndex < newEndNodeIndex) { // Add down

            for(var i = currentEndNodeIndex; i <= newEndNodeIndex; i++) {

                switch (i) {
                    case currentEndNodeIndex: // Reselect previous end node
                        if(currentStartNodeIndex == currentEndNodeIndex) {
                            nodeSelectionRange = new pwk.primitives.NodeSelectionRange(currentRange.getStartLine(), currentRange.getStartLineOffset(), currentEndNode.getLastLine(), currentEndNode.getLastLine().getLength());
                        } else {
                            nodeSelectionRange = new pwk.primitives.NodeSelectionRange(currentEndNode.getFirstLine(), 0, currentEndNode.getLastLine(), currentEndNode.getLastLine().getLength());
                        }
                        currentEndNode.select(nodeSelectionRange);
                        break;

                    case newEndNodeIndex: // Select end node
                        nodeSelectionRange = new pwk.primitives.NodeSelectionRange(newEndNode.getFirstLine(), 0, opt_range.getEndLine(), opt_range.getEndLineOffset());
                        newEndNode.select(nodeSelectionRange);
                        break;

                    default:
                        doc.getNodeAt(i).select();
                }
            }

        } else if(currentStartNodeIndex == newStartNodeIndex &&
            currentStartNodeIndex > newEndNodeIndex &&
            currentEndNodeIndex > newEndNodeIndex) { // Add up. Keep in mind that this selection is reversed

            for(var i = currentEndNodeIndex; i >= newEndNodeIndex; i--) {
                switch (i) {
                    case currentEndNodeIndex: // Reselect previous end node
                        if(currentStartNodeIndex == currentEndNodeIndex) {
                            nodeSelectionRange = new pwk.primitives.NodeSelectionRange(currentEndNode.getFirstLine(), 0, currentRange.getStartLine(), currentRange.getStartLineOffset());
                        } else {
                            nodeSelectionRange = new pwk.primitives.NodeSelectionRange(currentEndNode.getFirstLine(), 0, currentEndNode.getLastLine(), currentEndNode.getLastLine().getLength());
                        }
                        currentEndNode.select(nodeSelectionRange);
                        break;

                    case newEndNodeIndex: // Select end node
                        endLine = opt_range.getEndLine();
                        nodeSelectionRange = new pwk.primitives.NodeSelectionRange(endLine, opt_range.getEndLineOffset(), newEndNode.getLastLine(), newEndNode.getLastLine().getLength());
                        newEndNode.select(nodeSelectionRange);
                        break;

                    default:
                        doc.getNodeAt(i).select();
                }
            }

        } else if(currentStartNodeIndex == newStartNodeIndex &&
            currentStartNodeIndex >= newEndNodeIndex &&
            currentEndNodeIndex < newEndNodeIndex) { // Remove selection from node(s) above and reselect end node

            for(var i = currentEndNodeIndex; i <= newEndNodeIndex; i++) {

                switch (i) {
                    case newEndNodeIndex:
                        condition = (newStartNode == newEndNode);
                        endLine = condition ? opt_range.getStartLine() : newEndNode.getLastLine();
                        endLineOffset = condition ? opt_range.getStartLineOffset() : endLine.getLength();
                        nodeSelectionRange = new pwk.primitives.NodeSelectionRange(opt_range.getEndLine(), opt_range.getEndLineOffset(), endLine, endLineOffset);
                        break;

                    default:
                        doc.getNodeAt(i).unselect();
                }
            }

        } else if(currentStartNodeIndex == newStartNodeIndex &&
            currentStartNodeIndex <= newEndNodeIndex &&
            currentEndNodeIndex > newEndNodeIndex) { // Remove selection from node(s) below and reselect end node

            for(var i = currentEndNodeIndex; i >= newEndNodeIndex; i--) {
                switch (i) {

                    case newEndNodeIndex:
                        condition = (newStartNode == newEndNode);
                        startLine = condition ? opt_range.getStartLine() : newEndNode.getFirstLine();
                        startLineOffset = condition ? opt_range.getStartLineOffset() : 0;
                        nodeSelectionRange = new pwk.primitives.NodeSelectionRange(startLine, startLineOffset, opt_range.getEndLine(), opt_range.getEndLineOffset());
                        break;

                    default:
                        doc.getNodeAt(i).unselect();
                }
            }

        }
    }

    this.range_ = opt_range;

    if(opt_range.isCollapsed() && opt_range.getStartLine().getLength() != 0) {
        this.updateCaretFromRange();
    } else {
        this.lastBoundsDirection_ = null;
        this.lastModifiedBoundsDirection_ = null;
    }

};


/**
 * Remove current document selection
 */
pwk.Selection.prototype.removeSelection = function() {
    var range = this.range_
      , startNode = range.getStartNode()
      , endNode = range.getEndNode();

    if(startNode == endNode) {
        startNode.unselect();

    } else {
        var doc = this.document_
          , isReversed = range.isReversed()
          , startNodeIndex = isReversed ? endNode.getIndex() : startNode.getIndex()
          , endNodeIndex = isReversed ? startNode.getIndex() : endNode.getIndex()
          , node;

        for(var i = startNodeIndex; i <= endNodeIndex; i++) {
            node = /** @type {pwk.LeafNode} */(doc.getNodeAt(i));
            node.unselect();
        }
    }
};


/**
 * @enum {number}
 */
pwk.Selection.CaretDirection = {
    LEFT : 1,
    RIGHT : 2,
    UP : 3,
    DOWN : 4,
    END : 5,
    HOME : 6
};