/**
 * @fileoverview Page header component.
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.PageHeader');

goog.require('goog.ui.Component');
goog.require('goog.dom.classlist');
goog.require('pwk.PageSettings');


/**
 * Initialize {pwk.PageHeader} component.
 *
 * @constructor
 * @extends {goog.ui.Component}
 */
pwk.PageHeader = function() {
    goog.base(this);


    /**
     * @type {pwk.PageSettings}
     * @private
     */
    this.pageSettings_ = pwk.PageSettings.getInstance();
};
goog.inherits(pwk.PageHeader, goog.ui.Component);


/** @inheritDoc */
pwk.PageHeader.prototype.createDom = function() {
    var el = this.dom_.createElement('div');
    this.setElementInternal(el);
    this.decorateInternal(el);

    // Width should be equal page width
    goog.style.setWidth(el, this.pageSettings_.getSize().width + 'px');
    goog.style.setUnselectable(el, true);
};


/** @inheritDoc */
pwk.PageHeader.prototype.decorateInternal = function(element) {
    goog.base(this, 'decorateInternal', element);

    goog.dom.classlist.add(element, pwk.PageHeader.CSS_CLASS);
};


/** @inheritDoc */
pwk.PageHeader.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');
};


/** @inheritDoc */
pwk.PageHeader.prototype.disposeInternal = function() {
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
pwk.PageHeader.CSS_CLASS = 'pwk-page-header';
