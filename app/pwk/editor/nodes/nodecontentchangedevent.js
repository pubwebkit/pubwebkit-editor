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
 * @fileoverview Event handler for {@link Node} content changes
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.NodeContentChangedEvent');

goog.require('goog.events.Event');

/**
 * @param {pwk.Line} line
 * @extends {goog.events.Event}
 * @constructor
 */
pwk.NodeContentChangedEvent = function(line) {
  goog.events.Event.call(this, pwk.LeafNode.EventType.CONTENT_CHANGED, line);

  /**
   * @type {pwk.Line}
   */
  this.lastUpdatedLine = line;
};
goog.inherits(pwk.NodeContentChangedEvent, goog.events.Event);
