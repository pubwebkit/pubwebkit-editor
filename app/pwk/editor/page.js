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
 * @fileoverview Document page
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.Page');
goog.provide('pwk.Page.EventType');
goog.provide('pwk.Page.PageOverflowEvent');

goog.require('goog.dom.classlist');
goog.require('goog.events.Event');
goog.require('goog.ui.Component');
goog.require('pwk.Node');
goog.require('pwk.NodeFormatter');
goog.require('pwk.PageContent');
goog.require('pwk.PageFooter');
goog.require('pwk.PageHeader');
goog.require('pwk.PageSettings');



/**
 * Initialize {pwk.Page} component.
 *
 * @param {pwk.Document} doc
 * @constructor
 * @extends {goog.ui.Component}
 */
pwk.Page = function(doc) {
  goog.base(this);

  /**
   * @type {pwk.Document}
   * @private
   */
  this.document_ = doc;

  /**
   * @type {pwk.PageHeader}
   * @private
   */
  this.header_ = new pwk.PageHeader();

  /**
   * @type {pwk.PageFooter}
   * @private
   */
  this.footer_ = new pwk.PageFooter();

  /**
   * @type {pwk.PageContent}
   * @private
   */
  this.content_ = new pwk.PageContent(doc);

  /**
   * @type {pwk.PageSettings}
   * @private
   */
  this.pageSettings_ = pwk.PageSettings.getInstance();
};
goog.inherits(pwk.Page, goog.ui.Component);


/** @inheritDoc */
pwk.Page.prototype.createDom = function() {
  // Create element
  let el = this.dom_.createElement('div');
  let pageSettings = this.pageSettings_;
  let pageSize = pageSettings.getSize();

  this.setElementInternal(el);
  this.decorateInternal(el);

  // add child
  this.addChild(this.header_, true);
  this.addChild(this.content_, true);
  this.addChild(this.footer_, true);

  // apply settings
  goog.style.setWidth(el, pageSize.width + 'px');
  goog.style.setHeight(el, pageSize.height + 'px');
};


/** @inheritDoc */
pwk.Page.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
  goog.dom.classlist.add(element, pwk.Page.CSS_CLASS);
};


/** @inheritDoc */
pwk.Page.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');

  // Remove references
  delete this.header_;
  delete this.footer_;
  delete this.content_;

  this.pageSettings_ = null;
  this.document_ = null;
};


/**
 * Link the node with current page and place on the end of page
 * @param {pwk.Node} node
 */
pwk.Page.prototype.linkNode = function(node) {
  // Check if node already rendered
  if (node.isInDocument()) {
    throw new Error('Node shouldn\'t be already in the document.');
  }

  this.content_.linkNode(node);
  this.checkPageOverflow();
};


/**
 * Link the node with current page and place it before specific node
 * @param {pwk.Node} node
 * @param {pwk.Node} sibling
 */
pwk.Page.prototype.linkNodeBefore = function(node, sibling) {
  // Check if node already rendered
  if (node.isInDocument()) {
    throw new Error('Node shouldn\'t be already in the document.');
  }

  this.content_.linkNodeBefore(node, sibling);
  this.checkPageOverflow();
};


/**
 * Link the node with current page and place it after specific node
 * @param {pwk.Node} node
 * @param {pwk.Node} previous
 */
pwk.Page.prototype.linkNodeAfter = function(node, previous) {
  // Check if node already rendered
  if (node.isInDocument()) {
    throw new Error('Node shouldn\'t be already in the document.');
  }

  this.content_.linkNodeAfter(node, previous);
  this.checkPageOverflow();
};


/**
 * Get maximum content height.
 * @return {number}
 */
pwk.Page.prototype.getMaxContentSize = function() {
  let googStyle = goog.style;
  // TODO: move to constant
  let headerSize = googStyle.getSize(this.header_.getElement());
  // TODO: move to constant
  let footerSize = googStyle.getSize(this.footer_.getElement());
  let pageSize = this.pageSettings_.getSize();

  return pageSize.height - footerSize.height - headerSize.height;
};


/**
 * Get available content height.
 * @return {number}
 */
pwk.Page.prototype.getAvailableContentSize = function() {
  return this.getMaxContentSize() -
      goog.style.getSize(this.content_.getElement()).height;
};


/**
 * Checking size of page content on overflows and dispatching OVERFLOW event in
 * case page is overflowed.
 */
pwk.Page.prototype.checkPageOverflow = function() {
  var googStyle = goog.style,
      doc = this.document_,
      contentEl = this.content_.getElement(),
      contentSize = googStyle.getSize(contentEl),
      maxContentHeight = this.getMaxContentSize();

  // If page content higher than allowed value
  if (contentSize.height > maxContentHeight) {
    var nodes = [], // Nodes which will be moved to the next page
        pageIndex = doc.indexOfPage(this),
        pageNodes = doc.getPaginationIndex()[pageIndex],
        pageNodesLength = pageNodes.length,
        loopNode,
        newLinkedNode;

    while (pageNodesLength--) {
      loopNode = doc.getNode(pageNodes[pageNodesLength]);

      switch (loopNode.getType()) {
        case pwk.NodeTypes.PARAGRAPH:
          var leafNode = /** @type {pwk.LeafNode} */(loopNode),
              nodeHeight = googStyle.getSize(leafNode.getElement()).height,
              linkedNode = leafNode.getNextLinkedNode();

          // Is required to move the whole node?
          if ((contentEl.offsetHeight - nodeHeight) < maxContentHeight) {
            var lineLength = leafNode.getLinesCount(),
                loopLine,
                heightToCut = 0;

            while (lineLength--) {
              loopLine = leafNode.getLineAt(lineLength);
              heightToCut += loopLine.getHeight();
              if ((contentEl.offsetHeight - heightToCut) < maxContentHeight) {
                break;
              }
            }

            if (lineLength == 0) {
              // Move all node to the next page
              goog.array.insert(nodes, this.content_.unlinkNode(leafNode));
            } else {
              var lastLine;

              if (!goog.isDefAndNotNull(linkedNode)) {
                // Move lines to the new linked node
                for (var i = leafNode.getLinesCount() - 1;
                     i >= lineLength; i--) {
                  lastLine = loopNode.unlinkLine(loopNode.getLineAt(i));

                  if (!goog.isDefAndNotNull(newLinkedNode)) {
                    newLinkedNode =
                        new pwk.LeafNode(loopNode.getType(), doc, lastLine);
                    loopNode.setNextLinkedNode(newLinkedNode);
                  } else {
                    newLinkedNode.insertLine(lastLine, false, 0);
                  }
                }

                goog.array.insert(nodes, newLinkedNode);
              } else {
                // Move lines to the exist next linked node
                for (var i = leafNode.getLinesCount() - 1;
                     i >= lineLength; i--) {
                  lastLine = loopNode.unlinkLine(loopNode.getLineAt(i));
                  linkedNode.insertLine(lastLine, true, 0);
                }

                doc.getPageAt(
                    doc.getPagination().getPageIndexByNodeId(
                        linkedNode.getId())).checkPageOverflow();
              }
            }

          } else {
            // Move all node to the next page
            goog.array.insert(nodes, this.content_.unlinkNode(leafNode));
          }

          break;

        default:
          // Remove node from page to move it to the next page
          goog.array.insert(nodes, this.content_.unlinkNode(loopNode));
      }

      // Recalculate content
      if (contentEl.offsetHeight < maxContentHeight) {
        break;
      }
    }

    // Page overflowed!
    this.dispatchEvent(new pwk.Page.PageOverflowEvent(this, nodes, pageIndex));
  }
};


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
pwk.Page.CSS_CLASS = 'pwk-page';


/**
 * Event types that can be stopped/started.
 * @enum {string}
 */
pwk.Page.EventType = {
  OVERFLOW: goog.events.getUniqueId('page_overflow')
};



/**
 * @param {pwk.Page} page
 * @param {Array.<pwk.Node>} nodes
 * @param {number} pageIndex
 * @extends {goog.events.Event}
 * @constructor
 */
pwk.Page.PageOverflowEvent = function(page, nodes, pageIndex) {
  goog.events.Event.call(this, pwk.Page.EventType.OVERFLOW, page);

  /**
   * @type {Array.<pwk.Node>}
   * @private
   */
  this.nodes_ = nodes;

  /**
   * @type {number}
   * @private
   */
  this.pageIndex_ = pageIndex;
};
goog.inherits(pwk.Page.PageOverflowEvent, goog.events.Event);


/**
 * @return {Array.<pwk.Node>}
 */
pwk.Page.PageOverflowEvent.prototype.getNodesForMoving = function() {
  return this.nodes_;
};


/**
 * @return {number}
 */
pwk.Page.PageOverflowEvent.prototype.getPageIndex = function() {
  return this.pageIndex_;
};
