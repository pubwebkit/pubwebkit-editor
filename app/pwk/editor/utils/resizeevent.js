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
 * @fileoverview Manage resize event for DOM elements.
 *
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.utils.ResizeEvent');

/**
 * Is Internet Explorer?
 * @type {boolean}
 * @private
 */
pwk.utils.ResizeEvent.isIE_ = (function() {
  return typeof navigator !== 'undefined'
             ? Boolean(navigator.userAgent.match(/Trident/) ||
                       navigator.userAgent.match(/Edge/))
             : false;
}());

/**
 * @type {Function}
 * @private
 */
pwk.utils.ResizeEvent.requestFrame_ = (function() {
  var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame || function fallbackRAF(func) {
              return window.setTimeout(func, 20);
            };

  return function requestFrameFunction(func) { return raf(func); };
})();

/**
 * @type {Function}
 * @private
 */
pwk.utils.ResizeEvent.cancelFrame_ = (function() {
  var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame ||
               window.webkitCancelAnimationFrame || window.clearTimeout;
  return function cancelFrameFunction(id) { return cancel(id); };
})();

/**
 * @param {Event} e
 * @private
 */
pwk.utils.ResizeEvent.resizeListener_ = function(e) {
  var win = e.target || e.srcElement;

  if (win.__resizeRAF__) {
    pwk.utils.ResizeEvent.cancelFrame_(win.__resizeRAF__);
  }

  win.__resizeRAF__ = pwk.utils.ResizeEvent.requestFrame_(function() {
    var trigger = win.__resizeTrigger__;
    if (trigger !== undefined) {
      trigger.__resizeListeners__.forEach(function(fn) {
        fn.call(trigger, e, trigger);
      });
    }
  });
};

/**
 * On element load handler.
 * @param {Element} el
 * @private
 */
pwk.utils.ResizeEvent.objectLoad_ = function(el) {
  el.contentDocument.defaultView.__resizeTrigger__ = el.__resizeElement__;
  el.contentDocument.defaultView.addEventListener(
      'resize', pwk.utils.ResizeEvent.resizeListener_);
};

/**
 * Adds an event listener for a custom resize event.
 * @param {Element} element
 * @param {Function} fn
 */
pwk.utils.ResizeEvent.listen = function(element, fn) {
  var attachEvent = document.attachEvent;

  if (!element.__resizeListeners__) {
    element.__resizeListeners__ = [];
    if (attachEvent) {
      element.__resizeTrigger__ = element;
      element.attachEvent('onresize', pwk.utils.ResizeEvent.resizeListener_);
    } else {
      if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
      }
      var obj = element.__resizeTrigger__ = document.createElement('object');
      obj.setAttribute(
          'style',
          'display: block; position: absolute; top: 0; ' +
              'left: 0; height: 100%; width: 100%; overflow: hidden; ' +
              'pointer-events: none; z-index: -1; opacity: 0;');
      obj.setAttribute('class', 'resize-sensor');
      obj.__resizeElement__ = element;
      obj.onload = goog.bind(pwk.utils.ResizeEvent.objectLoad_, obj, obj);
      obj.type = 'text/html';
      if (pwk.utils.ResizeEvent.isIE_) {
        element.appendChild(obj);
      }
      obj.data = 'about:blank';
      if (!pwk.utils.ResizeEvent.isIE_) {
        element.appendChild(obj);
      }
    }
  }
  element.__resizeListeners__.push(fn);
};

/**
 * Removes an resize event listener which was added with listen() method.
 * @param {Element} element
 * @param {Function} fn
 */
pwk.utils.ResizeEvent.unlisten = function(element, fn) {
  var attachEvent = document.attachEvent;

  element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn),
                                     1);

  if (!element.__resizeListeners__.length) {
    if (attachEvent) {
      element.detachEvent('onresize', pwk.utils.ResizeEvent.resizeListener_);
    } else {
      element.__resizeTrigger__.contentDocument.defaultView.removeEventListener(
          'resize', pwk.utils.ResizeEvent.resizeListener_);
      element.__resizeTrigger__ =
          !element.removeChild(element.__resizeTrigger__);
    }
  }
};

/**
 * Default CSS class to be applied to the resize sensor.
 * @type {string}
 */
pwk.utils.ResizeEvent.CSS_CLASS = 'resize-sensor';
