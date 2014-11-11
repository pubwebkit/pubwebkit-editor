/**
 * @fileoverview This class uses for formatting nodes of various types.
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.NodeFormatter');

goog.require('pwk.NodeAttributeTypes');
goog.require('pwk.DocumentSettings');

/**
 * @param {pwk.Document} doc
 * @param {pwk.Node|pwk.LeafNode} node
 */
pwk.NodeFormatter.applyGlobalDocumentFormation = function(doc, node) {
    var nodeIndex = doc.indexOfNode(node)
      , documentSettings = (/**@type {pwk.DocumentSettings}*/(pwk.DocumentSettings.getInstance()));

    switch(node.getType()) {
        case pwk.NodeTypes.PARAGRAPH:

            var prevNode = doc.getNodeAt(nodeIndex - 1)
                , types = pwk.NodeAttributeTypes;

            if(goog.isDefAndNotNull(prevNode)) {
                node.setAttribute(types.STYLE_LINE_HEIGHT, prevNode.getAttribute(types.STYLE_LINE_HEIGHT).getValue());
                node.setAttribute(types.STYLE_HEIGHT, prevNode.getAttribute(types.STYLE_HEIGHT).getValue());
                node.setAttribute(types.STYLE_FONT_SIZE,prevNode.getAttribute(types.STYLE_FONT_SIZE).getValue());

            } else {
                var height = (parseFloat(pwk.utils.style.PointsToPixels(documentSettings.getFontSize()))
                                * parseFloat(documentSettings.getLineHeight())) + 'px';

                node.setAttribute(types.STYLE_LINE_HEIGHT, documentSettings.getLineHeight());
                node.setAttribute(types.STYLE_HEIGHT, height);
                node.setAttribute(types.STYLE_FONT_SIZE, documentSettings.getFontSize());
            }

            break;
    }
};


/**
 * Apply attributes for the specified node.
 *
 * @param {Array.<pwk.NodeAttribute>} attributes
 * @param {goog.ui.Component} node Node or any child component
 */
pwk.NodeFormatter.applyNodeAttributes = function(attributes, node) {
    var el = node.getElement();

    goog.array.forEach(attributes, function(attr) {
        var value = attr.getValue();

        switch (attr.getType()) {

            case pwk.NodeAttributeTypes.HTML_CLASS:
                goog.dom.classes.set(el, value);
                break;

            case pwk.NodeAttributeTypes.STYLE_FONT_SIZE:
                el.style.fontSize = value;
                break;

            case pwk.NodeAttributeTypes.STYLE_HEIGHT:
                goog.style.setHeight(el, value);
                break;

            case pwk.NodeAttributeTypes.STYLE_LINE_HEIGHT:
                el.style.lineHeight = value;
                break;

            default:
                throw new Error('Unknown node attribute type');
        }
    });
};