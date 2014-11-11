/**
 * @fileoverview Utilities to manioulate with DOM
 *
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.utils.dom');


/**
 * @return {Element}
 */
pwk.utils.dom.createDummyNode = function() {
    // Create marker
    return goog.dom.createDom('span', { 'id' : 'caret-marker' }, '\u200B');
};
