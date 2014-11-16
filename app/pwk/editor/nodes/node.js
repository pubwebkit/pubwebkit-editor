/**
 * @fileoverview Node represent a content element on the document.
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.Node');

goog.require('goog.ui.Component');
goog.require('goog.dom.classlist');
goog.require('pwk.NodeFormatter');


/**
 * @param {pwk.NodeTypes} type Type of node
 * @param {pwk.Document} doc Parent document object.
 *
 * @constructor
 * @extends {goog.ui.Component}
 */
pwk.Node = function(type, doc) {
    goog.base(this);


    /**
     * @type {Array.<pwk.NodeAttribute>}
     * @private
     */
    this.attributes_ = [];


    /**
     * @type {pwk.NodeTypes}
     * @private
     */
    this.type_ = type;


    /**
     * @type {boolean}
     */
    this.isChild_ = false;


    /**
     * @type {pwk.Document}
     * @protected
     */
    this.document_ = doc;


    // Apply global attributes
    pwk.NodeFormatter.applyGlobalDocumentFormation(doc, this);
};
goog.inherits(pwk.Node, goog.ui.Component);


/** @inheritDoc */
pwk.Node.prototype.createDom = function() {
    // Create element and apply classes
    this.setElementInternal(this.dom_.createElement('div'));
    goog.dom.classlist.add(this.getElement(), this.CSS_CLASS);
};


/** @inheritDoc */
pwk.Node.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // Remove attributes
    for(var i = 0; i < this.attributes_.length; i++) {
        goog.array.removeAt(this.attributes_, i);
    }

    delete this.attributes_;
};


/** @inheritDoc */
pwk.Node.prototype.addChild = function(child, opt_render) {
    goog.base(this, 'addChild', child, opt_render);
};


/** @inheritDoc */
pwk.Node.prototype.addChildAt = function(child, index, opt_render) {
    if(child instanceof pwk.Node) {
        child.isChild(true);
    }

    goog.base(this, 'addChildAt', child, index, opt_render);
    this.dispatchEvent(pwk.Document.EventType.FILLING_CHANGE);
};


/**
 * Determine or set that node is a child.
 *
 * @param {boolean=} opt_child
 * @return {boolean}
 */
pwk.Node.prototype.isChild = function(opt_child) {
    if(goog.isDefAndNotNull(opt_child)) {
        this.isChild_ = opt_child;
    }
    return this.isChild_;
};


/**
 * @return {pwk.NodeTypes} Type of the node
 */
pwk.Node.prototype.getType = function() {
    return this.type_;
};


/**
 * @return {Array.<pwk.NodeAttribute>}
 */
pwk.Node.prototype.getAttributes = function() {
    return this.attributes_;
};


/**
 * Get attribute for specified type.
 * @param {pwk.NodeAttributeTypes} type
 * @return {?pwk.NodeAttribute}
 */
pwk.Node.prototype.getAttribute = function(type) {
    return goog.array.find(this.attributes_, function(att) {
        return att.getType() == type;
    });
};


/**
 * Set attribute. If attribute with specified type already exist, old data will be rewritten or not, depended from
 * opt_isMergeData argument. Data will be rewritten by default.
 *
 * @param {pwk.NodeAttributeTypes} type
 * @param {string} value
 * @param {boolean=} opt_isMergeData
 */
pwk.Node.prototype.setAttribute = function(type, value, opt_isMergeData) {
    var attribute = goog.array.find(this.attributes_, function(att){
        return att.getType() == type;
    });

    if(goog.isDefAndNotNull(attribute)) {
        attribute.setValue(value, opt_isMergeData);
    } else {
        goog.array.insert(this.attributes_, new pwk.NodeAttribute(type, value));
    }
    this.dispatchEvent(pwk.Node.EventType.ATTRIBUTES_CHANGED);
};


/**
 * Returns the 0-based index of the given node component, or -1 if no such
 * node is found.
 * @returns {number}
 */
pwk.Node.prototype.getIndex = function() {
    return this.document_.indexOfNode(this);
};


/**
 * Make selection for node content by range
 */
pwk.Node.prototype.select = goog.abstractMethod;


/**
 * Remove selection from node
 */
pwk.Node.prototype.unselect = goog.abstractMethod;


/**
 * Delete selected content from node
 * @param {pwk.primitives.NodeSelectionRange} nodeSelectionRange
 */
pwk.Node.prototype.deleteRange = goog.abstractMethod;


/**
 * Check if node could be split
 * @return {boolean}
 */
pwk.Node.prototype.isSplittable = goog.abstractMethod;


/**
 * @param {number} offset   0-based index node offset.
 * @return {pwk.Node}   Returns new node or next linked node, in case if offset is end of the current node and next exist linked node.
 */
pwk.Node.prototype.split = goog.abstractMethod;


/**
 * Component default css class
 * @type {string}
 */
pwk.Node.prototype.CSS_CLASS = 'pwk-node';


/**
 * @enum {string}
 */
pwk.Node.EventType = {
    ATTRIBUTES_CHANGED : goog.events.getUniqueId('attributes_changed')
};
