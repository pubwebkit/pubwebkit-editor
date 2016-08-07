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
 * @fileoverview This class uses for formatting nodes of various types.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.NodeFormatter');

goog.require('goog.dom.classlist');
goog.require('pwk.DocumentSettings');
goog.require('pwk.NodeAttributeTypes');


/**
 * @param {pwk.Document} doc
 * @param {pwk.Node|pwk.LeafNode} node
 */
pwk.NodeFormatter.applyGlobalDocumentFormation = function(doc, node) {
  let nodeIndex = doc.indexOfNode(node);
  let documentSettings =
      (/**@type {pwk.DocumentSettings}*/(pwk.DocumentSettings.getInstance()));

  switch (node.getType()) {
    case pwk.NodeTypes.PARAGRAPH:

      let prevNode = doc.getNodeAt(nodeIndex - 1);
      let types = pwk.NodeAttributeTypes;

      if (goog.isDefAndNotNull(prevNode)) {
        node.setAttribute(types.STYLE_LINE_HEIGHT,
            prevNode.getAttribute(types.STYLE_LINE_HEIGHT).getValue());
        node.setAttribute(types.STYLE_HEIGHT,
            prevNode.getAttribute(types.STYLE_HEIGHT).getValue());
        node.setAttribute(types.STYLE_FONT_SIZE,
            prevNode.getAttribute(types.STYLE_FONT_SIZE).getValue());

      } else {
        let fontSize =
            parseFloat(pwk.utils.style.PointsToPixels(
                documentSettings.getFontSize()));
        let lineHeight = parseFloat(documentSettings.getLineHeight());
        let height = (fontSize * lineHeight) + 'px';

        node.setAttribute(types.STYLE_LINE_HEIGHT,
            documentSettings.getLineHeight());
        node.setAttribute(types.STYLE_HEIGHT, height);
        node.setAttribute(types.STYLE_FONT_SIZE,
            documentSettings.getFontSize());
      }

      break;
  }
};


/**
 * Apply attributes for the specified node.
 * @param {Array.<pwk.NodeAttribute>} attributes
 * @param {goog.ui.Component} node Node or any child component
 */
pwk.NodeFormatter.applyNodeAttributes = function(attributes, node) {
  let element = node.getElement();

  goog.array.forEach(attributes, function(attr) {
    let value = attr.getValue();

    switch (attr.getType()) {

      case pwk.NodeAttributeTypes.HTML_CLASS:
        goog.dom.classlist.set(element, value);
        break;

      case pwk.NodeAttributeTypes.STYLE_FONT_SIZE:
        element.style.fontSize = value;
        break;

      case pwk.NodeAttributeTypes.STYLE_HEIGHT:
        goog.style.setHeight(element, value);
        break;

      case pwk.NodeAttributeTypes.STYLE_LINE_HEIGHT:
        element.style.lineHeight = value;
        break;

      default:
        throw new Error('Unknown node attribute type');
    }
  });
};
