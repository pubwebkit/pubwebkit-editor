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
      pageIndex = doc.indexOfPageByNodeId(prevNode.getId());

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
      pageIndex = doc.indexOfPageByNodeId(nextNode.getId());

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
 * Nodes index by pages.
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

  var page = e.getPage();

  // If content become bigger then available on current pages, move nodes to
  // other pages or create more page and move them there.
  page.checkPageOverflow();

  // Fill document pages if content height was changed
  this.checkFilling(page);
};


/**
 * Checking pages filling. Checking started from topless range node.
 * @param {pwk.Page} modifiedPage
 */
pwk.Pagination.prototype.checkFilling = function(modifiedPage) {
  var doc = this.document_;
  var topPageIndex = doc.indexOfPage(modifiedPage);
  var getBottomPageIndex =
      goog.bind(
          function() {
            return this.pageNodeIndex_[topPageIndex + 1] ?
                topPageIndex + 1 :
                -1;
          },
          this);


  var bottomPageIndex = getBottomPageIndex();
  var bottomPage;

  // We have page below of modified page?
  if (bottomPageIndex > 0) {

    var hasContentToMove = true;

    while (hasContentToMove && bottomPageIndex > 0) {
      var availableHeightAbove = modifiedPage.getAvailableContentSize();

      /** @type {pwk.Node}*/
      var nodeToMove = doc.getNode(this.pageNodeIndex_[bottomPageIndex][0]);
      var nodeToMoveSize;

      if (goog.isDefAndNotNull(nodeToMove) && nodeToMove.isInDocument()) {

        nodeToMoveSize = nodeToMove.getSize();

        // Node above could be moved to the page above completely
        if (nodeToMoveSize.height <= availableHeightAbove) {

          if (nodeToMove instanceof pwk.LeafNode) {
            var previousLinkedNode = nodeToMove.getPreviousLinkedNode();

            // For linked nodes
            if (previousLinkedNode != null) {
              pwk.Node.mergeNodes(doc, previousLinkedNode, nodeToMove);

            } else {
              // It's not linked nodes, so just move it to the above page.
              goog.array.remove(this.pageNodeIndex_[bottomPageIndex],
                  nodeToMove.getId());
              nodeToMove = doc.unlinkNode(nodeToMove);
              doc.addNodeAt(nodeToMove, nodeToMove.getIndex(), true);
            }
          }
        }
        // Node is splittable? Let's try move part to the page above.
        else if (nodeToMove.isSplittable()) {

          //Split node
          var movedContent = nodeToMove.splitByHeight(availableHeightAbove);

          if (movedContent != null) {
            var previousLinkedNode = movedContent.getPreviousLinkedNode();

            // For linked nodes
            if (previousLinkedNode != null) {
              pwk.Node.mergeNodes(doc, previousLinkedNode, nodeToMove);
            }
            else {
              doc.addNodeAt(movedContent, nodeToMove.getIndex(), true);
            }
          }
          hasContentToMove = false;
        }
        // Looks like it's impossible to move content. Exit...
        else {
          hasContentToMove = false;
        }
      }

      // Is page empty? Remove it.
      bottomPage = doc.getPageAt(bottomPageIndex);
      if (bottomPage != null && bottomPage.isEmpty()) {
        doc.removePage(bottomPage);
        goog.array.removeAt(this.pageNodeIndex_, bottomPageIndex);
      }

      // Update index variable
      bottomPageIndex = getBottomPageIndex();
    }
  }
};
