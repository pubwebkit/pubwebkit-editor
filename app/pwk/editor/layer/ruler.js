/**
 * @fileoverview Allows the user to set the margin and padding of document (for all pages) and nodes.
 * All document settings stored in pwk.PageSettings. All settings specific to the node, stored inside it.
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.Ruler');

goog.require('goog.ui.Component');

/**
 * @constructor
 * @extends {goog.ui.Component}
 */
pwk.Ruler = function() {
    goog.base(this);
};
goog.inherits(pwk.Ruler, goog.ui.Component);


