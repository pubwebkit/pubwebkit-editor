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
 * @fileoverview Page content component.
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.PageContent');

goog.require('goog.ui.Component');
goog.require('goog.dom.classlist');
goog.require('pwk.Node');
goog.require('goog.style');


/**
 * Initialize {pwk.PageContent} component.
 *
 * @param {pwk.Document} doc
 * @constructor
 * @extends {goog.ui.Component}
 */
pwk.PageContent = function(doc) {
    goog.base(this);

    /**
     * @type {pwk.Document}
     * @private
     */
    this.document_ = doc;

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
    goog.base(this, 'decorateInternal', element);

    goog.dom.classlist.add(element, pwk.PageContent.CSS_CLASS);

    // apply settings
    var pageSettings = this.pageSettings_;
    element.style.paddingRight = pageSettings.getRightMargin() + 'px';
    element.style.paddingLeft = pageSettings.getLeftMargin() + 'px';
};


/** @inheritDoc */
pwk.PageContent.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');
};


/** @inheritDoc */
pwk.PageContent.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // Remove references
    this.document_ = null;
};


/**
 * Render node inside this page content and insert at the end of page.
 * @param {pwk.Node} node
 */
pwk.PageContent.prototype.linkNode = function(node) {
    // Check if node already rendered
    if(node.isInDocument()) {
        throw new Error('Node shouldn\'t be already in the document.');
    }

    var el = this.getElement();
    node.render(el);
};

/**
 * Render node inside this page content and insert before specific node.
 * @param {pwk.Node} node
 * @param {pwk.Node} sibling
 */
pwk.PageContent.prototype.linkNodeBefore = function(node, sibling) {
    // Check if node already rendered
    if(node.isInDocument()) {
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
    if(node.isInDocument()) {
        throw new Error('Node shouldn\'t be already in the document.');
    }

    node.render(previous.getParent().getElement());

    var nodeEl = node.getElement()
      , previousNodeEl = previous.getElement()

    if(nodeEl.previousElementSibling != previousNodeEl) {
        goog.dom.insertSiblingAfter(node.getElement(), previous.getElement());
    }
};


/**
 * Remove node from document and return if any.
 * @param {string|pwk.Node} node
 */
pwk.PageContent.prototype.unlinkNode = function(node) {
    return this.document_.unlinkNode(node);
};


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 *
 * @type {string}
 */
pwk.PageContent.CSS_CLASS = 'pwk-page-content';
