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

