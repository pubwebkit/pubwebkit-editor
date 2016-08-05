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
 * @fileoverview This class contains shared settings of document.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.DocumentSettings');

goog.require('goog.style');


/**
 * Initialize {pwk.PageSettings} component.
 * @constructor
 */
pwk.DocumentSettings = function() {

    /**
     * Document line height.
     * @type {string}
     * @private
     */
    this.lineHeight_ = '1.5';

    /**
     * Document font size.
     * @type {string}
     * @private
     */
    this.fontSize_ = '12pt';

    /**
     * Document instance.
     * @type {pwk.Document}
     * @private
     */
    this.document_;
};
goog.addSingletonGetter(pwk.DocumentSettings);


/**
 * Get default line-height for current document.
 * @return {string}
 */
pwk.DocumentSettings.prototype.getLineHeight = function() {
    return this.lineHeight_;
};


/**
 * Set default line-height for current document.
 * @param {string} value
 */
pwk.DocumentSettings.prototype.setLineHeight = function(value) {
    this.lineHeight_ = value;
    this.applyLineHeight_();
};


/**
 * Get default font size of current document.
 * @return {string}
 */
pwk.DocumentSettings.prototype.getFontSize = function() {
   return this.fontSize_;
};


/**
 * Set default font size of current document.
 * @param {string} value
 */
pwk.DocumentSettings.prototype.setFontSize = function(value) {
    this.fontSize_ = value;
    this.applyFontSize_();
};


/**
 * Initialize document property to manage global settings of document.
 * @param {pwk.Document} doc
 */
pwk.DocumentSettings.prototype.initialize = function(doc) {
    this.document_ = doc;
    this.applyLineHeight_();
    this.applyFontSize_();
};


/**
 * Apply line height settings to document.
 * @private
 */
pwk.DocumentSettings.prototype.applyLineHeight_ = function() {
    goog.style.setStyle(this.getDocument_().getElement(), 'line-height', this.lineHeight_);
};

/**
 * Apply font size settings to document.
 * @private
 */
pwk.DocumentSettings.prototype.applyFontSize_ = function() {
    this.getDocument_().getElement().style.fontSize = this.fontSize_;
};


/**
 * @return {pwk.Document}
 * @private
 */
pwk.DocumentSettings.prototype.getDocument_ = function() {
    if(!goog.isDefAndNotNull(this.document_)) {
        throw new Error('Document should be initialized!');
    }
    return this.document_;
};

