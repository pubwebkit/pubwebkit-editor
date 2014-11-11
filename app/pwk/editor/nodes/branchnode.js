/**
  * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.BranchNode');


goog.require('pwk.Node');


/**
 * @param {pwk.NodeTypes} type Type of node
 * @param {pwk.Document} doc Parent document object.
 * @constructor
 * @extends {pwk.Node}
 */
pwk.BranchNode = function(type, doc) {
    goog.base(this, type, doc);
};
goog.inherits(pwk.BranchNode, pwk.Node);


/**
 * Component default css class
 * @type {string}
 */
pwk.BranchNode.prototype.CSS_CLASS = 'pwk-branchnode';


/**
 * Get size of current node.
 * @return {goog.math.Size}
 */
pwk.BranchNode.prototype.getSize = function() {
    return goog.style.getSize(this.getElement());
};
