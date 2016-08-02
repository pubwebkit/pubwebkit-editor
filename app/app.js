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
 * @fileoverview Main file to initialize and prepare Pwk.Editor
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('app');

goog.require('app.Core');
goog.require('app.exports');


/**
 * Cross-browser wrapper for DOMContentLoaded.
 * @param {Window} win Window reference
 * @param {Function} fn Callback function reference
 * @private
 */
app.contentLoaded_ = function(win, fn) {
  let done = false;
  let top = true;
  let doc = win.document;
  let root = doc.documentElement;
  let modern = doc.addEventListener;
  let add = modern ? 'addEventListener' : 'attachEvent';
  let rem = modern ? 'removeEventListener' : 'detachEvent';
  let pre = modern ? '' : 'on';

  let init =
    function(e) {
      if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
      (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
      if (!done && (done = true)) fn.call(win, e.type || e);
    };

  let poll =
    function() {
        try {
          root.doScroll('left');
        }
        catch(e) {
          setTimeout(poll, 50); return;
        }
        init('poll');
    };

  if (doc.readyState == 'complete') {
    fn.call(win, 'lazy');
  } else {
      if (!modern && root.doScroll) {
          try { top = !win.frameElement; } catch(e) { }
          if (top) poll();
      }
      doc[add](pre + 'DOMContentLoaded', init, false);
      doc[add](pre + 'readystatechange', init, false);
      win[add](pre + 'load', init, false);
  }
};

// Run application
app.contentLoaded_(window, function() {
    (new app.Core()).init();
});
