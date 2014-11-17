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
 * @fileoverview Component that represent caret in document
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.layer.Caret');
goog.provide('pwk.layer.Caret.AfterUpdateEvent');

goog.require('pwk.utils.dom');
goog.require('goog.dom.classlist');
goog.require('goog.ui.Component');
goog.require('goog.dom.Range');
goog.require('goog.editor.range');
goog.require('goog.style');
goog.require('goog.events.Event');

/**
 * Initialize {pwk.layer.Caret} component.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for document interaction.
 * @constructor
 * @extends {goog.ui.Component}
 */
pwk.layer.Caret = function(opt_domHelper) {
    goog.base(this, opt_domHelper);

    /**
     * Is cursor visible.
     *
     * @type {boolean}
     * @private
     */
    this.isVisible_ = false;

    /**
     * Parent caret wrapper.
     *
     * @type {Node}
     * @private
     */
    this.layer_;

    /**
     * @type {number}
     * @private
     */
    this.blinkId_;

    /**
     * @type {Element}
     * @private
     */
    this.documentElement_;

    /**
     * A zero width space character.
     * @type {string}
     * @private
     */
    this.ZERO_WIDTH_SPACE_ = '\ufeff';

    this.count_ = 0;
};
goog.inherits(pwk.layer.Caret, goog.ui.Component);


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 *
 * @type {string}
 */
pwk.layer.Caret.CSS_CLASS = 'pwk-caret';

/**
 * CSS class of parent caret wrapper element.
 *
 * @type {string}
 */
pwk.layer.Caret.CSS_CLASS_LAYER = 'pwk-caret-layer';


/** @inheritDoc */
pwk.layer.Caret.prototype.createDom = function() {
    var element = goog.dom.createDom('div');

    this.documentElement_ = goog.dom.getElementByClass(pwk.Document.CSS_CLASS);

    goog.style.setUnselectable(element, true);

    this.setElementInternal(element);
    this.decorateInternal(element);
};


/** @inheritDoc */
pwk.layer.Caret.prototype.decorateInternal = function(element) {
    goog.base(this, 'decorateInternal', element);

    // Add css class
    goog.dom.classlist.add(element, pwk.layer.Caret.CSS_CLASS);

    // Initialize wrapper
    this.layer_ = goog.dom.createDom('div');
    goog.dom.classlist.add(this.layer_, pwk.layer.Caret.CSS_CLASS_LAYER);
};


pwk.layer.Caret.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');

    // Wrap by layer
    var parent = /** @type {!Node} */(goog.dom.getParentElement(this.getElement()));
    goog.dom.append(parent, this.layer_);
    this.layer_.appendChild(this.getElement());

    // Initialize events
    this.listen(pwk.layer.Caret.EventType.BEFORE_UPDATE, this.onCaretBeforeUpdate_, false, this);
    this.listen(pwk.layer.Caret.EventType.AFTER_UPDATE, this.onCaretAfterUpdate_, false, this);
};


/** @inheritDoc */
pwk.layer.Caret.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // Stop timer
    clearInterval(this.blinkId_);

    // Remove DOM nodes
    if(this.layer_) {
        goog.dom.removeNode(this.layer_);
    }
    delete this.layer_;

    // Remove references to DOM nodes,
    this.documentElement_ = null;

    //NOTE: Event listeners are cleaned in the method exitDocument of base class
};


/**
 * Hide cursor.
 */
pwk.layer.Caret.prototype.hide = function() {
    var el = this.getElement();

    clearInterval(this.blinkId_);
    this.isVisible_ = false;
    el.style.visibility = "hidden";
};


/**
 * Show cursor.
 */
pwk.layer.Caret.prototype.show = function() {
    var el = this.getElement();

    this.isVisible_ = true;
    el.style.visibility = "visible";
    this.restartTimer();
};


/**
 * Restart blink
 */
pwk.layer.Caret.prototype.restartTimer = function() {
    clearInterval(this.blinkId_);
    if (!this.isVisible_) {
        return;
    }

    var self = this.getElement()
      , obj = this;
    this.blinkId_ = setInterval(function() {
        self.style.visibility = "hidden";
        setTimeout(function() {
            if(obj.isVisible_) {
                self.style.visibility = "visible";
            }
        }, 400);
    }, 1000);
};


/**
 * Update cursor position by range
 *
 * @param {pwk.Selection} selection
 * @return {goog.math.Rect}
 */
pwk.layer.Caret.prototype.update = function(selection) {

    this.dispatchEvent(pwk.layer.Caret.EventType.BEFORE_UPDATE);

	var el = this.getElement()
      , bounds = selection.getBoundsForRange()
      , elStyle = el.style

    elStyle.left = bounds.left + 'px';
    elStyle.top = bounds.top + 'px';
    elStyle.height = bounds.height + 'px';

    this.restartTimer();
    this.dispatchEvent(new pwk.layer.Caret.AfterUpdateEvent(this, bounds));

    return bounds;
};


/**
 * @param {goog.events.Event} e
 * @private
 */
pwk.layer.Caret.prototype.onCaretBeforeUpdate_ = function(e) {
};


/**
 * @param {pwk.layer.Caret.AfterUpdateEvent} e
 * @private
 */
pwk.layer.Caret.prototype.onCaretAfterUpdate_ = function(e) {

};


/**
 * @enum {string}
 */
pwk.layer.Caret.EventType = {
    BEFORE_UPDATE: goog.events.getUniqueId('before_update'),
    AFTER_UPDATE: goog.events.getUniqueId('after_update')
};


/**
 * @param {pwk.layer.Caret} caret
 * @param {goog.math.Rect} bounds
 * @constructor
 * @extends {goog.events.Event}
 */
pwk.layer.Caret.AfterUpdateEvent = function(caret, bounds) {
    goog.events.Event.call(this, pwk.layer.Caret.EventType.AFTER_UPDATE, caret);

    /**
     * @type {goog.math.Rect}
     * @private
     */
    this.bounds_ = bounds;
};
goog.inherits(pwk.layer.Caret.AfterUpdateEvent, goog.events.Event);


/**
 * @return {goog.math.Rect}
 */
pwk.layer.Caret.AfterUpdateEvent.prototype.getBounds = function() {
    return this.bounds_;
};
