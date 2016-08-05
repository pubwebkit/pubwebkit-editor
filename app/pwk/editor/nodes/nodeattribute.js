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
 * @fileoverview Class represent node attribute.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.NodeAttribute');
goog.provide('pwk.NodeAttributeTypes');


/**
 * @param {pwk.NodeAttributeTypes} type
 * @param {string} value
 * @constructor
 */
pwk.NodeAttribute = function(type, value) {

    /**
     * @type {pwk.NodeAttributeTypes}
     * @private
     */
    this.type_ = type;


    /**
     * @type {string}
     * @private
     */
    this.value_ = "";
    this.setValue(value);
};

/**
 * Get attribute type.
 * @return {pwk.NodeAttributeTypes}
 */
pwk.NodeAttribute.prototype.getType = function() {
    return this.type_;
};


/**
 * Get attribute value.
 * @return {string}
 */
pwk.NodeAttribute.prototype.getValue = function() {
    return this.value_;
};


/**
 * Set attribute value.
 * @param {string} value
 * @param {boolean=} opt_isAppendValue Add value to the exist value. Adding depend from attribute type
 */
pwk.NodeAttribute.prototype.setValue = function(value, opt_isAppendValue) {
    if(goog.isDefAndNotNull(this.value_)) {

        switch (this.type_) {

            case pwk.NodeAttributeTypes.HTML_CLASS:
                var classes = this.value_.split(' ');
                // Is class already assigned?
                if(!goog.array.contains(classes, value)) {

                    // Is required to append value of just define it?
                    if(opt_isAppendValue) {
                        this.value_ = this.value_ + ' ' + value;
                    } else {
                        this.value_ = value;
                    }
                }
                break;

            default:
                this.value_ = value;
        }
    }
};


/**
 * Node attribute types.
 *
 * @enum {string}
 */
pwk.NodeAttributeTypes = {
    HTML_CLASS : 'html/class',
    STYLE_HEIGHT : 'style/height',
    STYLE_LINE_HEIGHT : 'style/lineHeight',
    STYLE_FONT_SIZE : 'style/fontSize'
};
