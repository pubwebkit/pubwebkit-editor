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
 * @fileoverview Page header component.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.PageHeader');

goog.require('goog.dom.classlist');
goog.require('goog.ui.Component');
goog.require('pwk.PageSettings');

/**
 * Initialize {pwk.PageHeader} component.
 * @constructor
 * @extends {goog.ui.Component}
 */
pwk.PageHeader = function() {
  pwk.PageHeader.base(this, 'constructor');

  /**
   * @type {pwk.PageSettings}
   * @private
   */
  this.pageSettings_ = pwk.PageSettings.getInstance();
};
goog.inherits(pwk.PageHeader, goog.ui.Component);

/** @inheritDoc */
pwk.PageHeader.prototype.createDom = function() {
  var element = this.dom_.createElement('div');
  this.setElementInternal(element);
  this.decorateInternal(element);

  // Width should be equal page width
  goog.style.setWidth(element, this.pageSettings_.getSize().width + 'px');
  goog.style.setUnselectable(element, true);
};

/** @inheritDoc */
pwk.PageHeader.prototype.decorateInternal = function(element) {
  pwk.PageHeader.base(this, 'decorateInternal', element);

  goog.dom.classlist.add(element, pwk.PageHeader.CSS_CLASS);
};

/** @inheritDoc */
pwk.PageHeader.prototype.enterDocument = function() {
  pwk.PageHeader.base(this, 'enterDocument');
};

/** @inheritDoc */
pwk.PageHeader.prototype.disposeInternal = function() {
  pwk.PageHeader.base(this, 'disposeInternal');

  // Remove references
  this.pageSettings_ = null;
};

/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
pwk.PageHeader.CSS_CLASS = 'pwk-page-header';
