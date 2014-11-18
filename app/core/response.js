//
// Pubwebkit editor is powerful editor to create your ebook in various styles.
// It's includes: Cover Designer, Template Editor, Community Snippets and more...
// Also, it's a part of www.pubwebkit.com portal.
// Copyright (C) 2014 Dmitry Antonenko
//
// This file is part of Pubwebkit editor
//
// Pubwebkit editor is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License as published by the Free
// Software Foundation, version 3
//
// Pubwebkit editor is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE.
//
// See the GNU Affero General Public License for more details. You should have received
// a copy of the GNU General Public License along with Hatch.js. If not, see
// <http://www.gnu.org/licenses/>.
//
// Authors: Dmitry Antonenko
//

/**
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('app.core.Response');

goog.require('goog.soy');
goog.require('app.core.Router');


/**
 * Create a response based on the provided request.
 * @param {app.core.Request} request
 * @param {app.core.Router} router
 * @constructor
 */
app.core.Response = function(request, router) {
    /**
     * @type {app.core.Request}
     * @private
     */
    this.request_ = request;

    /**
     * @type {app.core.Router}
     * @private
     */
    this.router_ = router;
};


/**
 * @return {app.core.Router}
 */
app.core.Response.prototype.getRouter = function() {
    return this.router_;
};


/**
 * Render the template with the provided data.
 * @param {Function} template The template being rendered.
 * @param {Object=} opt_data The data being passed to the template. Usually it's {mvc.Model} object.
 * @param {Element=} opt_element The element having the template rendered in.
 * Defaults to document.body.
 */
app.core.Response.prototype.render = function(template, opt_data, opt_element) {
    var element = opt_element || document.body
      , data = opt_data || {};

    goog.soy.renderElement(element, template, data, this.request_.toJSON());
};
