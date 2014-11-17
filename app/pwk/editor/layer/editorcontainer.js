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
 * @fileoverview Editor components container
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */


goog.provide('pwk.EditorContainer');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.ui.Component');


/**
 * @constructor
 * @extends {goog.ui.Component}
 */
pwk.EditorContainer = function() {
    goog.base(this);
};
goog.inherits(pwk.EditorContainer, goog.ui.Component);


/** @inheritDoc */
pwk.EditorContainer.prototype.createDom = function() {

    // Create element and apply classes
    this.setElementInternal(this.dom_.createElement('div'));
    goog.dom.classlist.add(this.getElement(), pwk.EditorContainer.CSS_CLASS);
};


/**
 * Component default css class
 * @type {string}
 */
pwk.EditorContainer.CSS_CLASS = 'pwk-editor-container';


/** @inheritDoc */
pwk.EditorContainer.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');

    // Initialize events
    goog.events.listen(window, goog.events.EventType.RESIZE, this.onWindowResize_, false, this);
    this.onWindowResize_();
};


/**
 * On window resize event handler
 * @private
 */
pwk.EditorContainer.prototype.onWindowResize_ = function() {
    goog.style.setHeight(this.getElement(), goog.dom.getViewportSize().height);
};
