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
 * @fileoverview This class contains shared settings for document pages.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */


goog.provide('pwk.PageSettings');
goog.provide('pwk.PageSettings.Paper');

goog.require('goog.math.Size');



/**
 * Initialize {pwk.PageSettings} component.
 * @constructor
 */
pwk.PageSettings = function() {

  /**
     * @type {pwk.PageSettings.Paper}
     * @private
     */
  this.pagePaper_ = pwk.PageSettings.Paper.Executive;

  /**
     * Page width. (in pixels)
     * @type {number}
     * @private
     */
  this.width_ = this.pagePaper_.width.pixel;

  /**
     * Page height. (in pixels)
     * @type {number}
     * @private
     */
  this.heigth_ = this.pagePaper_.height.pixel;

  /**
     * Left margin in pixels
     * @type {number}
     * @private
     */
  this.leftMargin_ = 90;

  /**
     * Right margin in pixels
     * @type {number}
     * @private
     */
  this.rightMargin_ = 90;

  /**
     * Document instance.
     * @type {pwk.Document}
     * @private
     */
  this.document_;
};
goog.addSingletonGetter(pwk.PageSettings);


/**
 * @param {pwk.Document} doc Document required to manage global settings of pages of document.
 */
pwk.PageSettings.prototype.initialize = function(doc) {
  this.document_ = doc;
};

// TODO: To implement the functionality to set left/right margin and apply this settings on UI side


/**
 * Get left page margin.
 * @return {number}
 */
pwk.PageSettings.prototype.getLeftMargin = function() {
  return this.leftMargin_;
};


/**
 * Get right page margin.
 * @return {number}
 */
pwk.PageSettings.prototype.getRightMargin = function() {
  return this.rightMargin_;
};


/**
 * Get page size settings.
 * @return {goog.math.Size}
 */
pwk.PageSettings.prototype.getSize = function() {
  return new goog.math.Size(this.width_, this.heigth_);
};


/**
 * Get page content width
 * @return {number}
 */
pwk.PageSettings.prototype.getContentWidth = function() {
  return this.width_ - this.leftMargin_ - this.rightMargin_;
};


/**
 * Get inner width of page
 * @return {number}
 */
pwk.PageSettings.prototype.getInnerWidth = function() {
  return this.width_ - this.leftMargin_ - this.rightMargin_;
};


/**
 * @return {pwk.Document}
 * @private
 */
pwk.PageSettings.prototype.getDocument_ = function() {
  if (!goog.isDefAndNotNull(this.document_)) {
    throw new Error('Document should be initialized!');
  }
  return this.document_;
};


/**
 * Sizes of common paper sizes.
 * @enum {Object}
 */
pwk.PageSettings.Paper = {
  Test: {
    height: {
      pixel: 6 * 96
    },
    width: {
      pixel: 5 * 96
    }
  },
  A4: {
    height: {
      pixel: 11.69 * 96,
      inch: 11.69,
      mm: 11.69 * 25.4
    },
    width: {
      pixel: 8.27 * 96,
      inch: 8.27,
      mm: 8.27 * 25.4
    }
  },
  Letter: {
    height: {
      pixel: 11.0 * 96,
      inch: 11.0,
      mm: 11.0 * 25.4
    },
    width: {
      pixel: 8.5 * 96,
      inch: 8.5,
      mm: 8.5 * 25.4
    }
  },
  Legal: {
    height: {
      pixel: 14.0 * 96,
      inch: 14.0,
      mm: 14.0 * 25.4
    },
    width: {
      pixel: 8.5 * 96,
      inch: 8.5,
      mm: 8.5 * 25.4
    }
  },
  Executive: {
    height: {
      pixel: 10.5 * 96,
      inch: 10.5,
      mm: 10.5 * 25.4
    },
    width: {
      pixel: 7.25 * 96,
      inch: 7.25,
      mm: 7.25 * 25.4
    }
  }
};

