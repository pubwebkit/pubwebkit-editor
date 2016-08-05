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
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('app.core.Request');

goog.require('goog.Uri');



/**
 * Create a simple request object based on the provided URL.
 * @param {Object} routeData Object that contains information about current
 *    route.
 * @param {string} uri The uri we are constructing this object from.
 * @param {string} queryVals The values for query path.
 * @param {boolean=} opt_ignoreCase Whether or not we are performing a case
 * sensitive parse.
 * @constructor
 * @extends {goog.Uri}
 */
app.core.Request = function(routeData, uri, queryVals, opt_ignoreCase) {
  goog.Uri.call(this, uri, opt_ignoreCase);

  /**
   * @type {Object}
   * @private
   */
  this.routeData_ = routeData;

  this.setQueryData(queryVals, false);
};
goog.inherits(app.core.Request, goog.Uri);


/**
 * Return route data by key or all values as object
 * @param {string=} opt_key
 * @return {Object|string}
 */
app.core.Request.prototype.getRouteData = function(opt_key) {
  if (goog.isDefAndNotNull(opt_key)) {
    return this.routeData_[opt_key];
  }
  return this.routeData_;
};


/**
 * Convert this object to a simple JSON object.
 * @return {Object}
 */
app.core.Request.prototype.toJSON = function() {
  var obj = {
    domain: this.getDomain(),
    path: this.getPath(),
    port: this.getPort(),
    query: this.getQuery(),
    scheme: this.getScheme(),
    userInfo: this.getUserInfo(),
    routeData: this.routeData_,
    queryData: {}
  };

  var queryData = this.getQueryData(),
      keys = queryData.getKeys();

  for (var a = 0; a < keys.length; a++) {
    var values = queryData.getValues(keys[a]);

    if (values.length > 1) {
      obj.queryData[keys[a]] = values;
    } else {
      obj.queryData[keys[a]] = queryData.get(keys[a]);
    }
  }

  return obj;
};
