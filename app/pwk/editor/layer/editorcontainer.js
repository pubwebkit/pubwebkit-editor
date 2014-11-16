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
