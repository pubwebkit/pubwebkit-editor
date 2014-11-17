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
 * @fileoverview Selection overview UI component.
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */


goog.provide('pwk.layer.SelectionOverlay');

goog.require('goog.ui.Component');
goog.require('goog.dom.classlist');
goog.require('goog.events.Event');
goog.require('pwk.primitives.ClientRectRange');


/**
 * @param {pwk.primitives.ClientRectRange} clientRectRange
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for document interaction.
 * @constructor
 * @extends {goog.ui.Component}
 */
pwk.layer.SelectionOverlay = function(clientRectRange, opt_domHelper) {
    goog.base(this, opt_domHelper);

    /**
     * @type {pwk.primitives.ClientRectRange}
     * @private
     */
    this.clientRectRange_ = clientRectRange;
};
goog.inherits(pwk.layer.SelectionOverlay, goog.ui.Component);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 *
 * @type {string}
 */
pwk.layer.SelectionOverlay.CSS_CLASS = 'pwk-selection-overlay';


/** @inheritDoc */
pwk.layer.SelectionOverlay.prototype.createDom = function() {
    var element = goog.dom.createDom('div')
      , clientRect = this.clientRectRange_
      , googStyle = goog.style
      , googMath = goog.math;

    this.setElementInternal(element);
    goog.dom.classlist.add(this.getElement(), pwk.layer.SelectionOverlay.CSS_CLASS);
    googStyle.setPosition(element, new googMath.Coordinate(clientRect.left, clientRect.top));
    googStyle.setSize(element, new googMath.Size(clientRect.width, clientRect.height));
};

