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
 * @fileoverview Class with functionality of manipulation by pages of document.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.Pagination');

goog.require('goog.events.EventTarget');



/**
 * @param {pwk.Document} document
 * @constructor
 */
pwk.Pagination = function(document) {

  /**
   * @type {pwk.Document}
   * @private
   */
  this.document_ = document;

  /**
   * Each array represent page and index equals the index of page in document.
   * Each child array represent nodes ids.
   * @type {Array.<Array.<string>>}
   * @private
   */
  this.pageNodeIndex_ = [];

  // Initialize event handlers
  this.initEvents_();
};


/**
 * Initialize event handlers.
 * @private
 */
pwk.Pagination.prototype.initEvents_ = function() {
  goog.events.listen(this.document_, pwk.Document.EventType.NODE_REMOVED,
      this.onDocumentNodeRemovedEventHandler_, false, this);
  goog.events.listen(this.document_, pwk.Document.EventType.FILLING_CHANGE,
      this.onDocumentFillingChangedEventHandler_, false, this);
};


/**
 * Add node to the document and link with the latest page.
 * @param {pwk.Node} node
 */
pwk.Pagination.prototype.addNode = function(node) {
  // Check if node already rendered
  if (node.isInDocument()) {
    throw new Error('Node should not be already in the document.');
  }

  var page;
  var pageIndex;
  var editorDocument = this.document_;
  var pageNodeIndex = this.pageNodeIndex_;
  var pageNodeIndexLen = this.pageNodeIndex_.length;

  // Get node index for latest page
  if (!goog.isArray(pageNodeIndex[pageNodeIndexLen - 1])) {
    page = new pwk.Page(editorDocument);
    editorDocument.addPage(page);

    // Important to add handlers after page initialization.
    page.listen(pwk.Page.EventType.OVERFLOW,
        this.onPageOverflowsHandler_, false, this);

    pageNodeIndex[pageNodeIndexLen] = [];

  } else {
    page = editorDocument.getPageAt(pageNodeIndexLen - 1);
  }

  // Update index
  pageIndex = editorDocument.indexOfPage(page);
  goog.array.insert(pageNodeIndex[pageIndex], node.getId());

  // Render node on the page
  page.linkNode(node);
};


/**
 * Add node to the document at the given 0-based index and link with the page
 * in this position.
 * @param {pwk.Node} node
 * @param {number} index
 * @param {boolean=} opt_after
 */
pwk.Pagination.prototype.addNodeAt = function(node, index, opt_after) {
  // Check if node already rendered
  if (node.isInDocument()) {
    throw new Error('Node should not be already in the document.');
  }

  var doc = this.document_;
  var pageNodeIndex = this.pageNodeIndex_;
  var pageIndex;
  var page;

  if (opt_after) {
    var prevNode = doc.getNodeAt(index - 1);

    if (goog.isDefAndNotNull(prevNode)) {
      pageIndex = this.getPageIndexByNodeId(prevNode.getId());

      var prevNodeIndex =
          goog.array.indexOf(pageNodeIndex[pageIndex], prevNode.getId());
      goog.array.insertAt(pageNodeIndex[pageIndex], node.getId(),
          prevNodeIndex + 1);

      page = this.document_.getPageAt(pageIndex);
      page.linkNodeAfter(node, prevNode);
    } else {
      // If previous node does not exist, add node to the end
      this.addNode(node);
    }
  } else {
    var nextNode = this.document_.getNodeAt(index);

    if (goog.isDefAndNotNull(nextNode)) {
      // Get page index
      pageIndex = this.getPageIndexByNodeId(nextNode.getId());

      // Add node index to index
      var nextNodeIndex =
          goog.array.indexOf(pageNodeIndex[pageIndex], nextNode.getId());
      goog.array.insertAt(pageNodeIndex[pageIndex], node.getId(),
          nextNodeIndex);

      page = this.document_.getPageAt(pageIndex);
      page.linkNodeBefore(node, nextNode);

    } else { // If sibling node does not exist, add node to the end
      this.addNode(node);
    }
  }
};


/**
 * Get page index where are situated node with specified id.
 * @param {string} id Node ID.
 * @return {number}
 */
pwk.Pagination.prototype.getPageIndexByNodeId = function(id) {
  var result;
  var pageNodeIndex = this.pageNodeIndex_;
  var indexLen = pageNodeIndex.length;
  var googArray = goog.array;

  for (var i = 0; i < indexLen; i++) {
    result = googArray.indexOf(pageNodeIndex[i], id);
    if (result != -1) {
      return i;
    }
  }
  return -1;
};


/**
 * Handler to process the page overflow event.
 * @param {pwk.Page.PageOverflowEvent} e
 * @private
 */
pwk.Pagination.prototype.onPageOverflowsHandler_ = function(e) {
  var nodes = e.getNodesForMoving();
  var page = e.target;
  var pageIndex = e.getPageIndex();
  var doc = this.document_;
  var siblingPage = doc.getPageAt(pageIndex + 1);

  // Update index
  goog.array.forEach(nodes, function(node) {
    goog.array.remove(this.pageNodeIndex_[pageIndex], node.getId());
  }, this);

  // Is required to create a new page?
  if (goog.isDefAndNotNull(siblingPage)) { // - No
    var siblingPageNodes = this.pageNodeIndex_[pageIndex + 1];
    var siblingNode = doc.getNode(siblingPageNodes[0]);
    var siblingNodeIndex = doc.indexOfNode(siblingNode);

    goog.array.forEach(nodes, function(node) {
      doc.addNodeAt(node, siblingNodeIndex);
    }, this);

  } else { // Create new page
    page = new pwk.Page(doc);
    doc.addPage(page);

    // NOTE: Important to add handlers after page initialization.
    page.listen(pwk.Page.EventType.OVERFLOW, this.onPageOverflowsHandler_,
        false, this);

    // Update index
    this.pageNodeIndex_[this.pageNodeIndex_.length] = [];

    goog.array.forEachRight(nodes, function(node) {
      doc.addNode(node);
    }, this);
  }
};


/**
 * @return {Array.<Array.<string>>}
 */
pwk.Pagination.prototype.getPaginationIndex = function() {
  return this.pageNodeIndex_;
};


/**
 * Event handler for pwk.Document.EventType.NODE_REMOVED event type.
 * @param {pwk.Document.NodeRemovedEvent} e
 * @private
*/
pwk.Pagination.prototype.onDocumentNodeRemovedEventHandler_ = function(e) {
  var doc = this.document_;
  var parentPage = doc.getPageAt(e.parentPageIndex);
  var removedNodeId = e.removedNode.getId();
  var range = doc.getSelection().getRange();

  // if page empty and it's not a last one, remove it from document
  if (parentPage.isEmpty()) {
    debugger;
    doc.removePage(parentPage);

    goog.array.removeAt(this.pageNodeIndex_, e.parentPageIndex);

    // If no more pages in the document
    if (this.pageNodeIndex_.length === 0) {
      // Add new empty paragraph in document
      var newNode = new pwk.LeafNode(pwk.NodeTypes.PARAGRAPH, doc);
      doc.addNode(newNode);

      range.setStartPosition(newNode.getFirstLine(), 0);
      range.setEndPosition(newNode.getLastLine(), 0);
    }

  } else {
    // remove node from page index
    goog.array.forEach(this.pageNodeIndex_, function(arr) {
      if (goog.array.remove(arr, removedNodeId)) {
        return;
      }
    }, this);

  }
};


/**
 * Handler of filling document content by pages. Called each time, when page
 * height was changed.
 * @param {pwk.Document.FillingChangedEvent} e
 * @private
 */
pwk.Pagination.prototype.onDocumentFillingChangedEventHandler_ = function(e) {

  console.log('FillingChangedEvent');

  // If content become bigger then available on current pages, move nodes to
  // other pages or create more page and move them there.
  e.getPage().checkPageOverflow();

  // Fill document pages if content height was changed
  this.checkFilling();
};


/**
 * Checking pages filling. Checking started from topless range node.
 */
pwk.Pagination.prototype.checkFilling = function() {

  var doc = this.document_;
  var range = doc.getSelection().getRange();
  var topPageIndex =
      this.getPageIndexByNodeId(range.isReversed() ?
          range.getEndNode().getId() :
          range.getStartNode().getId());
  var getBottomPageIndex = goog.bind(function() {
    return this.pageNodeIndex_.length > topPageIndex + 1 ?
        topPageIndex + 1 :
        -1;
  }, this);
  var belowPageIndex = getBottomPageIndex();
  var pageOffsetToCheck = 1;
  var abovePage;

  // Shift checking pages
  topPageIndex = (topPageIndex - pageOffsetToCheck) >= 0 ?
      topPageIndex - pageOffsetToCheck :
      0;

  // - check if current page is could be filled by content below {√}
  //      - get available height
  // - get minimal available splittable part on the page below
  //      - get minimal splittable part height of the node below and node
  //        height itself
  //      - if height acceptable, move it to the above page
  //          - remove empty page LAST page
  //      - if not, exit ...
  // - set page below to belowPageIndex variable

  //console.log('checkFilling');

  //console.log('- = - = - = - = - = -');

  while (belowPageIndex > 0) { // We have page below modified page?
    abovePage = /** @type {pwk.Page}*/(doc.getPageAt(topPageIndex));

    var availableHeightAbove = abovePage.getAvailableContentSize();
    var nodeToMove = /** @type {pwk.Node}*/
        (this.pageNodeIndex_[belowPageIndex].length > 0 ?
            doc.getNode(this.pageNodeIndex_[belowPageIndex][0]) :
            null);
    var nodeToMoveSize;

    // if (goog.isDefAndNotNull(nodeToMove) && nodeToMove.isInDocument()) {
    //
    //   console.log('availableHeightAbove: ' + availableHeightAbove);
    //   console.log(nodeToMove);
    //
    //   nodeToMoveSize = nodeToMove.getSize();
    //   console.log('nodeToMoveSize: ' + nodeToMoveSize);
    //   // Node above could be moved to the page above completely
    //   if (nodeToMoveSize.height <= availableHeightAbove) {
    //
    //     if (nodeToMove instanceof pwk.LeafNode) {
    //       var previousLinkedNode = nodeToMove.getPreviousLinkedNode();
    //
    //       // For linked nodes
    //       if (previousLinkedNode != null) {
    //           pwk.Node.mergeNodes(doc, previousLinkedNode, nodeToMove);
    //
    //       } else {
    //         // It's not linked nodes, so just move it to the above page.
    //         nodeToMove = doc.unlinkNode(nodeToMove);
    //         doc.addNodeAt(nodeToMove,
    //             doc.indexOfNode(previousLinkedNode), true);
    //
    //       }
    //     }
    //
    //   } else if (nodeToMove.isSplittable()) {
    //   //   //            // TODO: Split node
    //   //   //
    //   } else {
    //   //
    //   //   //            break;
    //     // --i >= 0 || 'exit'
    //   }
    // }



    //      else {
    //        break;
    // - - - -    }

    //console.log('- = - = - = - = - = -');
    return;

  }

  // Steps to fill pages top:
  // - Checking start from topmost range node
  // - Get height of remains space of the top page and get height of node below,
  // if it's could be moved to the page above, move it. Merge with node above if
  // they are linked.
  // - If the space still remains on the page, check if current node could be
  // split (Create abstract method isSplittable to pwk.Node class), then try to
  // split it and move part of them.
  // - Stop checking if content position were not changed
};
