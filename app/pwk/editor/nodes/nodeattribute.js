/**
 * @fileoverview Class represent node attribute.
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
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