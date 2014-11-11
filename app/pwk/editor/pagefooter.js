/**
 * @fileoverview Represent footer of the page.
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.PageFooter');

goog.require('goog.ui.Component');
goog.require('pwk.PageSettings');


/**
 * Initialize {pwk.PageFooter} component.
 *
 * @constructor
 * @extends {goog.ui.Component}
 */
pwk.PageFooter = function() {
    goog.base(this);

    /**
     * @type {pwk.PageSettings}
     * @private
     */
    this.pageSettings_ = pwk.PageSettings.getInstance();
};
goog.inherits(pwk.PageFooter, goog.ui.Component);


/** @inheritDoc */
pwk.PageFooter.prototype.createDom = function() {
    var el = this.dom_.createElement('div');
    this.setElementInternal(el);
    this.decorateInternal(el);

    // Width should be equal page width
    goog.style.setWidth(el, this.pageSettings_.getSize().width + 'px');
    goog.style.setUnselectable(el, true);
};


/** @inheritDoc */
pwk.PageFooter.prototype.decorateInternal = function(element) {
    goog.base(this, 'decorateInternal', element);

    goog.dom.classes.add(element, pwk.PageFooter.CSS_CLASS);
};


/** @inheritDoc */
pwk.PageFooter.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');
};


/** @inheritDoc */
pwk.PageFooter.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // Remove references
    this.pageSettings_ = null;
};


/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 *
 * @type {string}
 */
pwk.PageFooter.CSS_CLASS = 'pwk-page-footer';