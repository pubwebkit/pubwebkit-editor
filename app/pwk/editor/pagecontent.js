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
 * @fileoverview Page content component.
 *
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.PageContent');

goog.require('goog.dom.classlist');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('pwk.Node');
goog.require('pwk.utils.ResizeEvent');

/**
 * Initialize {@link pwk.PageContent} component.
 * @param {pwk.Page} parentPage Parent page.
 * @param {pwk.Document} doc Editor document instance.
 * @constructor
 * @extends {goog.ui.Component}
 */
pwk.PageContent = function(parentPage, doc) {
  pwk.PageContent.base(this, 'constructor');

  /**
   * @type {pwk.Document}
   * @private
   */
  this.document_ = doc;

  /**
   * @type {pwk.Page}
   * @private
   */
  this.parentPage_ = parentPage;

  /**
   * @type {pwk.PageSettings}
   * @private
   */
  this.pageSettings_ = pwk.PageSettings.getInstance();
};
goog.inherits(pwk.PageContent, goog.ui.Component);

/** @inheritDoc */
pwk.PageContent.prototype.createDom = function() {
  var element = this.dom_.createElement('div');
  this.setElementInternal(element);
  this.decorateInternal(element);
};

/** @inheritDoc */
pwk.PageContent.prototype.decorateInternal = function(element) {
  pwk.PageContent.base(this, 'decorateInternal', element);

  goog.dom.classlist.add(element, pwk.PageContent.CSS_CLASS);

  // apply settings
  var pageSettings = this.pageSettings_;
  element.style.paddingRight = pageSettings.getRightMargin() + 'px';
  element.style.paddingLeft = pageSettings.getLeftMargin() + 'px';
};

/** @inheritDoc */
pwk.PageContent.prototype.enterDocument = function() {
  pwk.PageContent.base(this, 'enterDocument');

  pwk.utils.ResizeEvent.listen(this.getElement(),
                               goog.bind(this.onResizeHandler_, this));
};

/** @inheritDoc */
pwk.PageContent.prototype.disposeInternal = function() {
  pwk.PageContent.base(this, 'disposeInternal');

  // Remove references
  this.document_ = null;
};

/**
 * Render node inside this page content and insert at the end of page.
 * @param {pwk.Node} node
 */
pwk.PageContent.prototype.linkNode = function(node) {
  // Check if node already rendered
  if (node.isInDocument()) {
    throw new Error('Node shouldn\'t be already in the document.');
  }

  var element = this.getElement();
  node.render(element);
};

/**
 * Render node inside this page content and insert before specific node.
 * @param {pwk.Node} node
 * @param {pwk.Node} sibling
 */
pwk.PageContent.prototype.linkNodeBefore = function(node, sibling) {
  // Check if node already rendered
  if (node.isInDocument()) {
    throw new Error('Node shouldn\'t be already in the document.');
  }

  var siblingEl = sibling.getElement();
  node.renderBefore(siblingEl);
};

/**
 * Render node inside this page content and insert before specific node.
 * @param {pwk.Node} node
 * @param {pwk.Node} previous
 */
pwk.PageContent.prototype.linkNodeAfter = function(node, previous) {
  // Check if node already rendered
  if (node.isInDocument()) {
    throw new Error('Node shouldn\'t be already in the document.');
  }

  node.render(previous.getParent().getElement());

  var nodeEl = node.getElement();
  var previousNodeEl = previous.getElement();

  if (nodeEl.previousElementSibling != previousNodeEl) {
    goog.dom.insertSiblingAfter(node.getElement(), previous.getElement());
  }
};

/**
 * Remove node from document and return if any.
 * @param {string|pwk.Node} node
 * @return {pwk.Node}
 */
pwk.PageContent.prototype.unlinkNode = function(node) {
  return this.document_.unlinkNode(node);
};

/**
 * Is there any nodes on this page?
 * @return {boolean}
 */
pwk.PageContent.prototype.isEmpty = function() {
  var childNodes = this.getElement().childNodes;

  return (childNodes.length === 1 &&
          childNodes[0].className === pwk.utils.ResizeEvent.CSS_CLASS) ||
         childNodes.length === 0;
};

/**
 * On element resize event handler.
 * @private
 */
pwk.PageContent.prototype.onResizeHandler_ = function() {
  this.dispatchEvent(new pwk.Document.FillingChangedEvent(this.parentPage_));
};

/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 *
 * @type {string}
 */
pwk.PageContent.CSS_CLASS = 'pwk-page-content';
