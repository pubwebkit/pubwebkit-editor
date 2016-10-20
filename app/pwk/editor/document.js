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
 * @fileoverview Document contains all information about edited information and
 * information itself, as child components.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.Document');
goog.provide('pwk.Document.EventType');
goog.provide('pwk.Document.NodeRemovedEvent');

goog.require('goog.dom.classlist');
goog.require('goog.events.Event');
goog.require('goog.ui.Component');
goog.require('pwk.BranchNode');
goog.require('pwk.DocumentSettings');
goog.require('pwk.LeafNode');
goog.require('pwk.NodeTypes');
goog.require('pwk.Page');
goog.require('pwk.PageSettings');
goog.require('pwk.Pagination');
goog.require('pwk.Range');
goog.require('pwk.Selection');
goog.require('pwk.utils.style');



/**
 * Represent document of editor.
 * @extends {goog.ui.Component}
 * @constructor
 */
pwk.Document = function() {
  goog.base(this);

  /**
   * @type {pwk.Selection}
   * @private
   */
  this.selection_ = new pwk.Selection(this);

  /**
   * @type {pwk.Pagination}
   * @private
   */
  this.pagination_ = new pwk.Pagination(this);

  /**
   * Array of ids of child @code{pwk.Node} components. Used to hold order of
   * nodes in document.
   * @type {Array.<string>}
   * @private
   */
  this.nodeIndex_ = [];

  /**
   * Array of ids of child @code{pwk.Page} components. Used to hold order of
   * pages in document.
   * @type {Array.<string>}
   * @private
   */
  this.pageIndex_ = []; // TODO: move it to the pwk.Pagination component?

  /**
   * @type {pwk.PageSettings}
   * @private
   */
  this.pageSettings_ = pwk.PageSettings.getInstance();

  /**
   * @type {pwk.DocumentSettings}
   * @private
   */
  this.documentSettings_ = pwk.DocumentSettings.getInstance();
};
goog.inherits(pwk.Document, goog.ui.Component);


/** @inheritDoc */
pwk.Document.prototype.createDom = function() {
  // Create element and apply classes
  this.setElementInternal(this.dom_.createElement('div'));

  var el = this.getElement();

  goog.dom.classlist.add(el, pwk.Document.CSS_CLASS);

  // Set document size, should be equal of page width
  goog.style.setWidth(el, this.pageSettings_.getSize().width + 'px');

  // Initialize document instance for global settings
  this.documentSettings_.initialize(this);
  this.pageSettings_.initialize(this);
};


/** @inheritDoc */
pwk.Document.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  // Initialize events
  this.initializeEvents_();

  // Initialize selection
  this.selection_.initialize();

  // First document initialization
  this.initializeDocument_();
};


/**
 * @return {pwk.Selection}
 */
pwk.Document.prototype.getSelection = function() {
  return this.selection_;
};


/**
 * Add text value to current caret position.
 * @param {string|Text} value
 */
pwk.Document.prototype.addValue = function(value) {
  // TODO: Refactoring required
  var selection = this.selection_;
  var range = selection.getRange();

  // remove selection
  if (!range.isCollapsed()) {
    this.deleteSelection();
  }

  value = typeof value == 'object' ? value.nodeValue : value;

  if (range.isCollapsed()) {

    var googString = goog.string;
    var isSpace = googString.isSpace(
        googString.normalizeWhitespace(/** @type {string} */(value)));
    var startLine = range.getStartLine();
    var startLineOffset = range.getStartLineOffset();
    var isLastPositionBefore = !(startLine.getLength() - startLineOffset);
    var startLineLength = startLine.getLength();
    var prevNodeValue = startLine.getTextNodeValueAtOffset(startLineLength - 1);
    var isPrevNodeValueSpace = prevNodeValue ?
        googString.isSpace(googString.normalizeWhitespace(prevNodeValue)) :
        false;
    var startNodeOffset = range.getStartNodeOffset();
    var lineBelow = range.getStartNode()
        .getLineAt(range.getStartLineRangeInfo().getLineIndex() + 1);
    var linkedNodeRangeInfo = range.getStartNode()
        .getRangeInfoByLinkedNodesOffset(
            range.getStartLineRangeInfo().getLinkedNodeOffset());
    var linkedLineBelow = range.getStartNode()
        .getLineAt(linkedNodeRangeInfo.getLineIndex() + 1, true);
    var offset = value.length;

    if (lineBelow != null && !isSpace && isLastPositionBefore &&
        isPrevNodeValueSpace) {
      range.setStartPosition(lineBelow, startNodeOffset + offset);
      range.setEndPosition(lineBelow, startNodeOffset + offset);
      lineBelow.insertValue(/** @type {string} */(value), 0);

    } else if (linkedLineBelow != null &&
        linkedLineBelow.getParentNode() !== range.getStartNode() && !isSpace &&
        isLastPositionBefore && isPrevNodeValueSpace) {
      range.setStartPosition(linkedLineBelow, offset);
      range.setEndPosition(linkedLineBelow, offset);
      linkedLineBelow.insertValue(/** @type {string} */(value), 0);

    } else if (startLineOffset == 0 && startNodeOffset != 0 && isSpace) {
      // If is start of line and value is space, add it to the end of line above
      // Logic to align text
      range.getStartNode()
          .insertValue(/** @type {string} */(value), startNodeOffset);
      range.setStartPosition(startLine, startNodeOffset + offset, true);
      range.setEndPosition(startLine, startNodeOffset + offset, true);

    } else if (startLineOffset == 0 &&
        linkedNodeRangeInfo.getLinkedNodeOffset() > 0 && isSpace) {
      // If is start of line and value is space and it is first line of linked
      // node, add it to the end of last linked line above
      linkedNodeRangeInfo.getLine().getParentNode()
          .insertValue(/** @type {string} */(value),
              linkedNodeRangeInfo.getNodeOffset());
      range.setStartPosition(startLine, startNodeOffset, true);
      range.setEndPosition(startLine, startNodeOffset, true);

    } else {
      startLine.insertValue(/** @type {string} */(value), startLineOffset);
      selection.moveCaretRight(true);

      var isLastPositionAfter =
          !(range.getStartLine().getLength() - range.getStartLineOffset());

      if (isSpace && !isLastPositionBefore && isLastPositionAfter) {
        var rangeStartNode = range.getStartNode();
        lineBelow = rangeStartNode.getLineAt(
            range.getStartLineRangeInfo().getLineIndex() + 1);

        if (lineBelow != null) {
          startNodeOffset = range.getStartNodeOffset();

          range.setStartPosition(lineBelow, startNodeOffset, true);
          range.setEndPosition(lineBelow, startNodeOffset, true);
        } else {
          linkedNodeRangeInfo = rangeStartNode.getRangeInfoByLinkedNodesOffset(
              range.getStartLineRangeInfo().getLinkedNodeOffset());
          linkedLineBelow = rangeStartNode.getLineAt(
              linkedNodeRangeInfo.getLineIndex() + 1, true);

          range.setStartPosition(linkedLineBelow, 0, true);
          range.setEndPosition(linkedLineBelow, 0, true);
        }
      }
    }

    selection.updateCaretFromRange();
  }
};


/**
 * Create new line.
 */
pwk.Document.prototype.newLine = function() {
  var selection = this.selection_;
  var range = selection.getRange();
  var startNode = range.getStartNode();

  // TODO: Collapse/Selection detection

  // Create new line depend of current focused node.
  switch (startNode.getType()) {
    case pwk.NodeTypes.PARAGRAPH:
      var startNodeLength = startNode.getLength();
      var paragraph;
      var paragraphIndex;

      // Checking, if line should be splitted
      if (range.getStartNodeOffset() == 0 &&
          !goog.isDefAndNotNull(startNode.getPreviousLinkedNode())) {
        // Just create empty node above
        paragraph = new pwk.LeafNode(pwk.NodeTypes.PARAGRAPH, this);

        // Create new paragraph above
        this.addNodeAt(paragraph, this.indexOfNode(startNode));
      } else {
        if (startNodeLength >= range.getStartNodeOffset()) {
          paragraph = startNode.split(range.getStartNodeOffset());
        } else {
          paragraph = new pwk.LeafNode(pwk.NodeTypes.PARAGRAPH, this);
        }

        // Get current paragraph position
        paragraphIndex = this.indexOfNode(startNode) + 1;

        if (!paragraph.isInDocument()) {
          // Create new paragraph if it's not in the document
          this.addNodeAt(paragraph, paragraphIndex, true);
        }

        // Update range
        var line = paragraph.getFirstLine();
        selection.setRange(pwk.Range.createFromNodes(line, 0, line, 0));
      }

      selection.updateCaretFromRange();
      paragraph.dispatchEvent(
          new pwk.LeafNode.NodeContentChangedEvent(
              paragraph.getLineAt(1, true)));
      break;
  }
};


/**
 * Delete document content based on current selection range.
 * @param {boolean=} opt_isBack Direction
 */
pwk.Document.prototype.deleteSelection = function(opt_isBack) {
  var selection = this.selection_;
  var range = selection.getRange();
  var isReversed = range.isReversed();
  var topNode = isReversed ? range.getEndNode() : range.getStartNode();
  var bottomNode = isReversed ? range.getStartNode() : range.getEndNode();
  var topNodeIndex = this.indexOfNode(topNode);
  var bottomNodeIndex = this.indexOfNode(bottomNode);

  for (var i = topNodeIndex; i <= bottomNodeIndex; i++) {
    var processedNode = /** @type {pwk.Node} */(this.getNodeAt(i));

    processedNode.removeSelection(opt_isBack);

    // Merge node if required
    if (topNode != bottomNode &&
        i == bottomNodeIndex &&
        topNode.isInDocument() &&
        bottomNode.isInDocument()) {

      var topNodeOffset =
          isReversed ? range.getEndNodeOffset() : range.getStartNodeOffset();
      var bottomNodeOffset =
          isReversed ? range.getStartNodeOffset() : range.getEndNodeOffset();

      if (topNode.getLength() === topNodeOffset &&
          bottomNodeOffset === 0) {

        // Update range
        range.collapse(true);

        // Try merge nodes
        pwk.Node.mergeNodes(this, topNode, bottomNode);
      }
    }

    if (!processedNode.isInDocument() && !range.isCollapsed()) {
      // Looks like this node is selected entirely and was removed from
      // document, so let's correct variables
      bottomNode = isReversed ? range.getStartNode() : range.getEndNode();
      bottomNodeIndex = this.indexOfNode(bottomNode);
      i--;
    }
  }

  selection.updateCaretFromRange(range);
};


/**
 * Add page to the end of document.
 * @param {pwk.Page} page
 */
pwk.Document.prototype.addPage = function(page) {
  this.addChild(page, true);
  goog.array.insert(this.pageIndex_, page.getId());
};


/**
 * Add page to the document at the given 0-based index.
 * @param {pwk.Page} page
 * @param {number} index
 */
pwk.Document.prototype.addPageAt = function(page, index) {
  var prevPage;
  var prevPageIndex;
  var prevPageId = this.pageIndex_.length ? this.pageIndex_[index - 1] : null;

  if (goog.isDefAndNotNull(prevPageId)) {
    prevPage = this.getChild(prevPageId);
    prevPageIndex = this.indexOfChild(prevPage);
    this.addChildAt(page, prevPageIndex + 1, true);
    goog.array.insertAt(this.pageIndex_, page.getId(), index);
  } else {
    this.addChild(page, true);
    goog.array.insert(this.pageIndex_, page.getId());
  }
};


/**
 * Calls the given function on each of this document's page in order.  If
 * {@code opt_obj} is provided, it will be used as the 'this' object in the
 * function when called. The function should take two arguments:  the page
 * component and its 0-based index.  The return value is ignored.
 * @param {Function} f The function to call for every page component; should
 *    take 2 arguments (the page and its index).
 * @param {Object=} opt_obj Used as the 'this' object in f when called.
 */
pwk.Document.prototype.forEachPage = function(f, opt_obj) {
  if (this.pageIndex_) {
    goog.array.forEach(this.pageIndex_, function(padeId, index) {
      var page = this.getChild(padeId);
      f.call(opt_obj, page, index);
    });
  }
};


/**
 * Returns the page with the given ID, or null if no such page exists.
 * @param {string} id Page ID.
 * @return {pwk.Page?} The page with the given ID; null if none.
 */
pwk.Document.prototype.getPage = function(id) {
  return /** @type {pwk.Page?} */(this.getChild(id));
};


/**
 * Returns the page at the given index, or null if the index is out of bounds.
 * @param {number} index 0-based index.
 * @return {pwk.Page?} The page at the given index; null if none.
 */
pwk.Document.prototype.getPageAt = function(index) {
  var pageId = this.pageIndex_.length ? this.pageIndex_[index] || '' : '';
  return this.getPage(pageId);
};


/**
 * Returns the number of pages of this document.
 * @return {number} The number of pages.
 */
pwk.Document.prototype.getPageCount = function() {
  return this.pageIndex_.length;
};


/**
 * Returns an array containing the IDs of the pages of this document, or an
 * empty array if the document has no pages.
 * @return {Array.<string>} Page component IDs.
 */
pwk.Document.prototype.getPageIds = function() {
  return this.pageIndex_;
};


/**
 * Returns the 0-based index of the given page component, or -1 if no such
 * page is found.
 * @param {?pwk.Page|string} page The page component.
 * @return {number} 0-based index of the page component; -1 if not found.
 */
pwk.Document.prototype.indexOfPage = function(page) {
  var pageId = goog.isString(page) ? page : page.getId();

  return (this.pageIndex_ && pageId) ?
      goog.array.indexOf(this.pageIndex_, pageId) :
      -1;
};


/**
 * Removes the given page from this document, and returns it.  Throws an error
 * if the argument is invalid or if the specified page isn't found in the
 * document.  The argument can either be a string (interpreted as the
 * ID of the page component to remove) or the page component itself.
 * @param {string|pwk.Page} page The ID of the page to remove, or the page
 *    component itself.
 * @return {pwk.Page} The removed component, if any.
 */
pwk.Document.prototype.removePage = function(page) {
  goog.array.remove(this.pageIndex_, goog.isString(page) ? page : page.getId());
  var removedPage = /** @type {pwk.Page} */(this.removeChild(page, true));
  if (removedPage) {
    goog.dispose(removedPage);
  }
  return removedPage;
};


/**
 * Removes the page at the given index from this document, and returns it.
 * Throws an error if the argument is out of bounds, or if the specified page
 * isn't found in the document.
 * @param {number} index 0-based index of the page to remove.
 * @return {pwk.Page} The removed page, if any.
 */
pwk.Document.prototype.removePageAt = function(index) {
  return this.removePage(this.pageIndex_[index]);
};


/**
 * Add node to the end of document.
 * @param {pwk.Node} node
 */
pwk.Document.prototype.addNode = function(node) {
  this.addChild(node);
  var nodeIndex = this.nodeIndex_.length;
  this.pagination_.addNode(node);

  // To prevent duplicates in case of creating new page
  var nodeId = node.getId();
  if (goog.array.indexOf(this.nodeIndex_, nodeId) == -1) {
    goog.array.insertAt(this.nodeIndex_, nodeId, nodeIndex);
  }
};


/**
 * Add node to the document at the given 0-based index.
 * @param {pwk.Node} node
 * @param {number} index
 * @param {boolean=} opt_renderAfter Is required to render the node after
 *    previous node or before sibling?
 */
pwk.Document.prototype.addNodeAt = function(node, index, opt_renderAfter) {
  var prevNode;
  var prevNodeIndex;
  var prevNodeId = /** @type {string} */(this.nodeIndex_.length ?
      this.nodeIndex_[index - 1] :
      null);

  if (goog.isDefAndNotNull(prevNodeId) || index == 0) {
    if (index == 0) {
      this.addChildAt(node, 0);
    } else {
      prevNode = this.getNode(prevNodeId);
      prevNodeIndex = this.indexOfNode(prevNode);
      this.addChildAt(node, prevNodeIndex + 1);
    }

    this.pagination_.addNodeAt(node, index, opt_renderAfter);

    // To prevent duplicates in case of creating new page
    var nodeId = node.getId();
    if (goog.array.indexOf(this.nodeIndex_, nodeId) == -1) {
      goog.array.insertAt(this.nodeIndex_, nodeId, index);
    }
  } else {
    this.addNode(node);
  }
};


/**
 * Calls the given function on each of this document's node in order.  If
 * {@code opt_obj} is provided, it will be used as the 'this' object in the
 * function when called. The function should take two arguments:  the node
 * component and its 0-based index.  The return value is ignored.
 * @param {Function} f The function to call for every node component; should
 *    take 2 arguments (the node and its index).
 * @param {Object=} opt_obj Used as the 'this' object in f when called.
 */
pwk.Document.prototype.forEachNode = function(f, opt_obj) {
  if (this.nodeIndex_) {
    goog.array.forEach(this.nodeIndex_, function(nodeId, index) {
      var node = this.getChild(nodeId);
      f.call(opt_obj, node, index);
    }, this);
  }
};


/**
 * Returns the node with the given ID, or null if no such node exists.
 * @param {string} id Node ID.
 * @return {pwk.Node?} The node with the given ID; null if none.
 */
pwk.Document.prototype.getNode = function(id) {
  return /** @type {pwk.Node?} */(this.getChild(id));
};


/**
 * Returns the node at the given index, or null if the index is out of bounds.
 * @param {number} index 0-based index.
 * @return {pwk.Node?} The node at the given index; null if none.
 */
pwk.Document.prototype.getNodeAt = function(index) {
  var nodeId = this.nodeIndex_.length ? this.nodeIndex_[index] || '' : '';
  return this.getNode(nodeId);
};


/**
 * Returns the number of nodes of this document.
 * @return {number} The number of nodes.
 */
pwk.Document.prototype.getNodeCount = function() {
  return this.nodeIndex_.length;
};


/**
 * Returns an array containing the IDs of the nodes of this document, or an
 * empty array if the document has no nodes.
 * @return {Array.<string>} Node component IDs.
 */
pwk.Document.prototype.getNodeIds = function() {
  return this.nodeIndex_;
};


/**
 * Returns the 0-based index of the given node component, or -1 if no such
 * node is found.
 * @param {?pwk.Node} node The node component.
 * @return {number} 0-based index of the node component; -1 if not found.
 */
pwk.Document.prototype.indexOfNode = function(node) {
  return (this.nodeIndex_ && node) ?
      goog.array.indexOf(this.nodeIndex_, node.getId()) :
      -1;
};


/**
 * Do the same as {@code pwk.Document.prototype.removeNode} but did not deleting
 * it from index. Usually used to detach node from DOM to move to other place.
 * @param {string|pwk.Node} node The ID of the node to remove, or the node
 *    component itself.
 * @return {pwk.Node} The removed node, if any.
 */
pwk.Document.prototype.unlinkNode = function(node) {
  return /** @type {pwk.Node} */(this.removeChild(node, true));
};


/**
 * Removes the given node from this document, returns and disposes of it.
 * Throws an error if the argument is invalid or if the specified node isn't
 * found in the document. The argument can either be a string (interpreted as
 * the ID of the node component to remove) or the node component itself.
 * @param {string|pwk.Node} node The ID of the node to remove, or the node
 *    component itself.
 * @return {pwk.Node} The removed node, if any.
 */
pwk.Document.prototype.removeNode = function(node) {
  var parentPageIndex = node.getParentPageIndex();
  goog.array.remove(this.nodeIndex_, goog.isString(node) ? node : node.getId());
  var removedNode = this.unlinkNode(node);

  if (removedNode) {
    goog.dispose(removedNode);
  }

  // trigger events
  this.dispatchEvent(
      new pwk.Document.NodeRemovedEvent(removedNode, parentPageIndex));

  // return removed node
  return removedNode;
};


/**
 * Removes the node at the given index from this document, returns and disposes
 * of it. Throws an error if the argument is out of bounds, or if the specified
 * node isn't found in the document.
 * @param {number} index 0-based index of the node to remove.
 * @return {pwk.Node} The removed node, if any.
 */
pwk.Document.prototype.removeNodeAt = function(index) {
  return this.removeNode(this.nodeIndex_[index]);
};


/**
 * Get {@code pwk.Pagination} document instance
 * @return {pwk.Pagination}
 */
pwk.Document.prototype.getPagination = function() {
  return this.pagination_;
};


/**
 * Return index of page/nodes equivalent.
 * @return {Array.<Array.<string>>}
 */
pwk.Document.prototype.getPaginationIndex = function() {
  return this.pagination_.getPaginationIndex();
};


/**
 * Initialize document
 * @private
 */
pwk.Document.prototype.initializeDocument_ = function() {

  // If document empty, add empty paragraph
  if (!this.getNodeCount()) {
    var paragraph = new pwk.LeafNode(pwk.NodeTypes.PARAGRAPH, this);

    this.addNode(paragraph);

    this.dispatchEvent(
        new pwk.LeafNode.NodeContentChangedEvent(paragraph.getFirstLine()));

    // Initialize Range
    var range = pwk.Range.createFromNodes(paragraph.getFirstLine(), 0,
        paragraph.getFirstLine(), 0);
    this.selection_.setRange(range);
    this.selection_.updateCaretFromRange();
  }
};


/**
 * Initialize component and related components events
 * @private
 */
pwk.Document.prototype.initializeEvents_ = function() {
};


/**
 * Component default css class
 * @type {string}
 */
pwk.Document.CSS_CLASS = 'pwk-document';


/**
 * Event types that can be stopped/started.
 * @enum {string}
 */
pwk.Document.EventType = {
  FILLING_CHANGE: goog.events.getUniqueId('filling_changed'),
  NODE_REMOVED: goog.events.getUniqueId('node_removed')
};



/**
 * Object representing a NODE_REMOVED event.
 * @param {pwk.Node} node
 * @param {number} parentPageIndex
 * @extends {goog.events.Event}
 * @constructor
 */
pwk.Document.NodeRemovedEvent = function(node, parentPageIndex) {
  goog.events.Event.call(this, pwk.Document.EventType.NODE_REMOVED, node);

  /**
   * @type {number}
   */
  this.parentPageIndex = parentPageIndex;

  /**
   * @type {pwk.Node}
   */
  this.removedNode = node;
};
goog.inherits(pwk.Document.NodeRemovedEvent, goog.events.Event);



/**
 * Object representing a FILLING_CHANGE event.
 * @param {pwk.Page} page
 * @extends {goog.events.Event}
 * @constructor
 */
pwk.Document.FillingChangedEvent = function(page) {
  goog.events.Event.call(this, pwk.Document.EventType.FILLING_CHANGE, page);

  /**
   * @type {pwk.Page}
   * @private
   */
  this.page_ = page;
};
goog.inherits(pwk.Document.FillingChangedEvent, goog.events.Event);


/**
 * @return {pwk.Page}
 */
pwk.Document.FillingChangedEvent.prototype.getPage = function() {
  return this.page_;
};
