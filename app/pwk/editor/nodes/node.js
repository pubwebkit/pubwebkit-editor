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
 * @fileoverview Node represent a content element on the document.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.Node');

goog.require('goog.dom.classlist');
goog.require('goog.ui.Component');
goog.require('pwk.NodeAttribute');
goog.require('pwk.ui.NodeFormatter');

/**
 * @param {pwk.NodeTypes} type Type of node
 * @param {pwk.Document} doc Parent document object.
 *
 * @constructor
 * @extends {goog.ui.Component}
 */
pwk.Node = function(type, doc) {
  pwk.Node.base(this, 'constructor');

  /**
   * @type {Array.<pwk.NodeAttribute>}
   * @private
   */
  this.attributes_ = [];

  /**
   * @type {pwk.NodeTypes}
   * @private
   */
  this.type_ = type;

  /**
   * @type {boolean}
   * @private
   */
  this.isChild_ = false;

  /**
   * @type {pwk.Document}
   * @private
   */
  this.document_ = doc;

  // Apply global attributes
  pwk.ui.NodeFormatter.applyGlobalDocumentFormation(doc, this);
};
goog.inherits(pwk.Node, goog.ui.Component);

/**
 * Get editor {@link pwk.Document} instance.
 * @return {pwk.Document} Editor {@link pwk.Document} instance.
 */
pwk.Node.prototype.getDocument = function() { return this.document_; };

/** @inheritDoc */
pwk.Node.prototype.createDom = function() {
  // Create element and apply classes
  this.setElementInternal(this.dom_.createElement('div'));

  goog.dom.classlist.add(this.getElement(), this.CSS_CLASS);
  pwk.ui.NodeFormatter.applyNodeStylesheet(this);
};

/** @inheritDoc */
pwk.Node.prototype.disposeInternal = function() {
  pwk.Node.base(this, 'disposeInternal');

  // Remove attributes
  for (var i = 0; i < this.attributes_.length; i++) {
    goog.array.removeAt(this.attributes_, i);
  }

  this.unselect();

  delete this.attributes_;
};

/** @inheritDoc */
pwk.Node.prototype.addChild = function(child, opt_render) {
  pwk.Node.base(this, 'addChild', child, opt_render);
};

/** @inheritDoc */
pwk.Node.prototype.addChildAt = function(child, index, opt_render) {
  if (child instanceof pwk.Node) {
    child.isChild(true);
  }

  pwk.Node.base(this, 'addChildAt', child, index, opt_render);
};

/**
 * Determine or set that node is a child.
 * @param {boolean=} opt_child
 * @return {boolean}
 */
pwk.Node.prototype.isChild = function(opt_child) {
  if (goog.isDefAndNotNull(opt_child)) {
    this.isChild_ = opt_child;
  }
  return this.isChild_;
};

/**
 * @return {pwk.NodeTypes} Type of the node
 */
pwk.Node.prototype.getType = function() { return this.type_; };

/**
 * @return {Array.<pwk.NodeAttribute>}
 */
pwk.Node.prototype.getAttributes = function() { return this.attributes_; };

/**
 * Get attribute for specified type.
 * @param {pwk.NodeAttributeTypes} type
 * @return {?pwk.NodeAttribute}
 */
pwk.Node.prototype.getAttribute = function(type) {
  return goog.array.find(
      this.attributes_, function(att) { return att.getType() == type; });
};

/**
 * Gets the height and width of an node element, even if its display is none.
 * @return {!goog.math.Size} Object with width/height properties.
 */
pwk.Node.prototype.getSize = function() {
  return goog.style.getSize(this.getElement());
};

/**
 * Set attribute. If attribute with specified type already exist, old data will
 * be rewritten or not, depended from opt_isMergeData argument. Data will be
 * rewritten by default.
 * @param {pwk.NodeAttributeTypes} type
 * @param {string} value
 * @param {boolean=} opt_isMergeData
 */
pwk.Node.prototype.setAttribute = function(type, value, opt_isMergeData) {
  var attribute = goog.array.find(
      this.attributes_, function(att) { return att.getType() == type; });

  if (goog.isDefAndNotNull(attribute)) {
    attribute.setValue(value, opt_isMergeData);
  } else {
    goog.array.insert(this.attributes_, new pwk.NodeAttribute(type, value));
  }
  this.dispatchEvent(pwk.Node.EventType.ATTRIBUTES_CHANGED);
};

/**
 * Get parent page index.
 * @return {number} Parent page index.
 */
pwk.Node.prototype.getParentPageIndex = function() {
  return this.document_.indexOfPageByNodeId(this.getId());
};

/**
 * Get parent page.
 * @return {pwk.Page} Parent page.
 */
pwk.Node.prototype.getParentPage = function() {
  return this.document_.getPageByNodeId(this.getId());
};

/**
 * Returns the 0-based index of the given node component, or -1 if no such
 * node is found.
 * @return {number}
 */
pwk.Node.prototype.getIndex = function() {
  return this.document_.indexOfNode(this);
};

/**
 * Make selection for node content by range
 */
pwk.Node.prototype.select = goog.abstractMethod;

/**
 * Remove selection from node
 */
pwk.Node.prototype.unselect = goog.abstractMethod;

/**
 * Remove content range from node
 * @param {pwk.primitives.NodeSelectionRange} nodeSelectionRange
 * @param {boolean=} opt_isBack Direction, in case if range is collapsed
 *    required to determine which key was pressed, Backspace or Delete.
 */
pwk.Node.prototype.removeRange = goog.abstractMethod;

/**
 * Get first line of the current node.
 * @return {pwk.Line}
 */
pwk.Node.prototype.getFirstLine = goog.abstractMethod;

/**
 * Get latest line of the node.
 * @return {pwk.Line}
 */
pwk.Node.prototype.getLastLine = goog.abstractMethod;

/**
 * Get node offset regarding specified line offset.
 * @param {pwk.Line} line
 * @param {number} lineOffset
 * @return {number}
 */
pwk.Node.prototype.getOffsetByLineOffset = goog.abstractMethod;

/**
 * Remove node content based on current selection
 * @param {boolean=} opt_isBack Direction, in case if range is collapsed
 *    required to determine which key was pressed, Backspace or Delete.§
 */
pwk.Node.prototype.removeSelection = goog.abstractMethod;

/**
 * Specifies whether there can be this node is split between pages.
 * @return {boolean}
 */
pwk.Node.prototype.isSplittable = goog.abstractMethod;

/**
 * Split node to two parts by specified offset and return bottommost newly
 * created node without adding to the DOM. If offset is end of the node and
 * exists linked node below, then let's just unlink linked node below and return
 * it without unlinking from the document.
 * @param {number} offset Node offset, 0-based index.
 * @return {pwk.LeafNode} Returns new node or below linked node, in case if
 *    offset is end of the current node and linked node below is exist.
 */
pwk.Node.prototype.splitToBottom = goog.abstractMethod;

/**
 * Split node to two nodes by specified offset and return topmost newly
 * created node without adding to the DOM. If offset is start of the node and
 * exists linked node above, then let's just unlink linked node above and return
 * it without unlinking from the document.
 * @param {number} offset Node offset, 0-based index.
 * @param {boolean} linkNode Make separated nodes linked?
 * @return {pwk.LeafNode} Returns new node or above linked node, in case if
 *    offset is start of the current node and linked node above is exist.
 */
pwk.Node.prototype.splitToTop = goog.abstractMethod;

/**
 * Cut specified range of the node and return newly created node without adding
 * to the DOM.
 * @param {number} startOffset Node offset, 0-based index.
 * @param {number=} opt_endOffset Node offset, 0-based index.
 * @return {pwk.LeafNode} Returns new node or next linked node, in case if
 *    offset is end of the current node and next exist linked node.
 */
pwk.Node.prototype.cut = goog.abstractMethod;

/**
 * Split node by specified height.
 * @param {number} height Height.
 * @return {?pwk.Node}  Returns new node or next linked node, in case if offset
 * is end of the current node and next exist linked node.
 */
pwk.Node.prototype.splitByHeight = goog.abstractMethod;

/**
 * Set previous linked node.
 * @param {pwk.Node} node
 */
pwk.Node.prototype.setPreviousLinkedNode = goog.abstractMethod;

/**
 * Set next linked node.
 * @param {pwk.Node} node
 */
pwk.Node.prototype.setNextLinkedNode = goog.abstractMethod;

/**
 * Get previous linked node. If node does not linked returns null.
 * @return {?pwk.Node}
 */
pwk.Node.prototype.getPreviousLinkedNode = goog.abstractMethod;

/**
 * Get next linked node. If node does not linked returns null.
 * @return {?pwk.Node}
 */
pwk.Node.prototype.getNextLinkedNode = goog.abstractMethod;

/**
 * Get lines content length
 * 0 is means that no content inside the node
 * @return {number}
 */
pwk.Node.prototype.getLength = goog.abstractMethod;

/**
 * Component default css class
 * @type {string}
 */
pwk.Node.prototype.CSS_CLASS = goog.getCssName('pwk-node');

/**
 * Merge nodes
 * @param {pwk.Document} document
 * @param {pwk.Node} topNode
 * @param {pwk.Node} bottomNode
 */
pwk.Node.mergeNodes = function(document, topNode, bottomNode) {
  if (topNode instanceof pwk.LeafNode) {

    // Proceed pwk.LeafNode to pwk.LeafNode merge
    if (topNode instanceof pwk.LeafNode) {

      //Merge
      var length = bottomNode.getLinesCount();
      var lastChangedLine = bottomNode.getLineAt(0);

      while (length--) {
        topNode.insertLine(bottomNode.unlinkLine(bottomNode.getLineAt(0)), true);
      }

      // Update linked nodes
      var topNodeNextLinkedNode = topNode.getNextLinkedNode();
      if (bottomNode.getLinesCount() === 0) {
        if (topNodeNextLinkedNode === bottomNode) {
          topNode.unlinkNextLinkedNode();
        }

        // Relink next link
        var bottomNodeNextLinkedNode = bottomNode.getNextLinkedNode();
        if (bottomNodeNextLinkedNode != null) {
          bottomNode.unlinkNextLinkedNode();
          topNode.setNextLinkedNode(bottomNodeNextLinkedNode);
        }

        if(document.indexOfNode(bottomNode) != -1) {
          document.removeNode(bottomNode);
        }
      }

      if (lastChangedLine != null) {
        topNode.dispatchEvent(new pwk.NodeContentChangedEvent(lastChangedLine));
      }
    }
  }
};

/**
 * @enum {string}
 */
pwk.Node.EventType = {
  ATTRIBUTES_CHANGED : goog.events.getUniqueId('attributes_changed')
};
