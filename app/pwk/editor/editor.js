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
 * @fileoverview Rich Text Editor.
 * @author dmitry.antonenko@pubwebkit.com (Dmytro Antonenko)
 */

goog.provide('pwk.Editor');

goog.require('goog.dom.classlist');
goog.require('goog.dom.iframe');
goog.require('goog.editor.icontent');
goog.require('goog.events.EventType');
goog.require('goog.events.FocusHandler');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.events.KeyNames');
goog.require('goog.fx.dom.Scroll');
goog.require('goog.json');
goog.require('goog.text.LoremIpsum');
goog.require('goog.ui.Component');
goog.require('goog.ui.KeyboardShortcutHandler');
goog.require('pwk.Document');
goog.require('pwk.LeafNode');
goog.require('pwk.Line');
goog.require('pwk.Shortcuts.Default');
goog.require('pwk.Shortcuts.MacOS');



/**
 * Main class of PWK Editor.
 * @constructor
 * @extends {goog.ui.Component}
 */
pwk.Editor = function() {
  goog.base(this);

  /**
   * @type {goog.events.KeyHandler}
   * @private
   */
  this.keyHandler_;

  /**
   * Event target that the event listener should be attached to.
   * @type {goog.events.EventTarget|EventTarget}
   * @private
   */
  this.keyTarget_;

  /**
   * Keyboard shortcuts handler.
   * @type {goog.ui.KeyboardShortcutHandler}
   * @private
   */
  this.keyboardShortcutHandler_;

  /**
   * Editor document instance.
   * @type {pwk.Document}
   * @private
   */
  this.document_ = new pwk.Document();

  /**
   * Focus handler.
   * @type {goog.events.FocusHandler}
   * @private
   */
  this.focusHandler_ = null;

  /**
   * Custom document selection.
   * @type {pwk.Selection}
   * @private
   */
  this.selection_ = this.document_.getSelection();

  /**
   * Stores the start point of the selection.
   * @type {pwk.Range}
   * @private
   */
  this.startSelectionRange_;

  /**
   * Indicates that selection process using mouse started.
   * @type {boolean}
   * @private
   */
  this.isSelectionUsingMouseStarted_ = false;

  /**
   * Stores {@link goog.events.BrowserEvent} to pass it to the recursive
   * function {@link pwk.Editor#scrollInLoop_}
   * @type {goog.events.BrowserEvent}
   * @private
   */
  this.scrollLoopBrowserEvent_;

  /**
   * @type {boolean}
   * @private
   */
  this.scrollLoopInProgress_ = false;
};
goog.inherits(pwk.Editor, goog.ui.Component);


/** @inheritDoc */
pwk.Editor.prototype.createDom = function() {

  // Create element and apply classes
  this.setElementInternal(this.dom_.createElement('div'));
  var element = this.getElement();
  goog.dom.classlist.add(element, pwk.Editor.CSS_CLASS);

  // Set editor focusable
  goog.dom.setFocusableTabIndex(element, true);
  element.focus();
};


/** @inheritDoc */
pwk.Editor.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  var element = this.getElement();

  // Initialize private members
  this.keyHandler_ = new goog.events.KeyHandler(element);
  this.keyTarget_ = element;
  this.keyboardShortcutHandler_ =
      new goog.ui.KeyboardShortcutHandler(this.keyTarget_);
  this.focusHandler_ = new goog.events.FocusHandler(element);

  // Add children component
  this.addChild(this.document_, true);

  // Editor is focused?
  if (document.activeElement != element) {
    element.focus();
  }

  goog.style.setUnselectable(element, true);

  // Initialize events
  this.initializeEvents_();

  // TODO: [Dmytro Antonenko] Just for current development stage!!
  this.addTestText(true);
};


/**
 * Initialize key event handler.
 * @private
 */
pwk.Editor.prototype.initializeEvents_ = function() {
  this.getHandler()
      .listen(this.keyboardShortcutHandler_,
          goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED,
          this.handleKeyboardShortcut_)
      .listen(this.focusHandler_,
          goog.events.FocusHandler.EventType.FOCUSIN, this.onFocusIn_)
      .listen(this.focusHandler_,
          goog.events.FocusHandler.EventType.FOCUSOUT, this.onFocusOut_)
      .listen(this.keyHandler_, goog.events.KeyHandler.EventType.KEY,
          this.handleKeyEvent_)
      .listen(this.keyTarget_, goog.events.EventType.MOUSEDOWN,
          this.onMouseDown_, true)
      .listen(document, goog.events.EventType.MOUSEMOVE,
          this.onMouseMove_, true)
      .listen(document, goog.events.EventType.MOUSEUP,
          this.onMouseUp_, true);

  // Register keyboard shortcuts
  this.registerKeyboardShortcut_(this.keyboardShortcutHandler_);
};


/**
 * Handles mousedown event.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @private
 */
pwk.Editor.prototype.onMouseDown_ = function(e) {

  if (e.isMouseActionButton()) {
    var editorEl = this.getElement();
    var selection = this.selection_;

    // Editor is focused?
    if (document.activeElement != editorEl) {
      editorEl.focus();
    }

    this.isSelectionUsingMouseStarted_ = true;
    selection.removeSelection();

    var selectionRange =
        selection.getSelectionRangeFromPoint(e.clientX, e.clientY);

    if (goog.isDefAndNotNull(selectionRange)) {
      selection.setRange(selectionRange);
      selection.updateCaretFromRange();
      this.startSelectionRange_ = selectionRange;
    }

    e.preventDefault();
  }
};


/**
 * Handles mousemove event.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @private
 */
pwk.Editor.prototype.onMouseMove_ = function(e) {
  if (e.isMouseActionButton() && this.isSelectionUsingMouseStarted_) {

    var viewPortSize = goog.dom.getViewportSize();

    if (e.clientY < viewPortSize.height - 10 && e.clientY > 0) {
      this.scrollLoopInProgress_ = false;
      this.selectFromRangeToPoint_(this.startSelectionRange_, e.clientX,
          e.clientY);

    } else {
      if (e.clientY == 0) {
        // In case if browser opened in full screen mode, we can't receive
        // negative clientY, so let's assign fake offset
        e.clientY = -15;
      }
      // Cursor is out of document, let's scroll it
      this.scrollDocumentForSelection_(e);
    }
  }

  e.preventDefault();
};


/**
 * @param {goog.events.BrowserEvent} e
 * @private
 */
pwk.Editor.prototype.scrollDocumentForSelection_ = function(e) {
  if (e) {
    this.scrollLoopBrowserEvent_ = e;
  }

  if (!this.scrollLoopInProgress_) {
    this.scrollLoopInProgress_ = true;
    this.scrollInLoop_();
  }
};


/**
 * @param {pwk.Range} startSelectionRange
 * @param {number} x
 * @param {number} y
 * @private
 */
pwk.Editor.prototype.selectFromRangeToPoint_ =
    function(startSelectionRange, x, y) {

  var selection = this.selection_;
  var endSelectionRange = selection.getSelectionRangeFromPoint(x, y);
  var selectionRange =
      pwk.Range.createFromNodes(startSelectionRange.getStartLine(),
          startSelectionRange.getStartNodeOffset(),
          endSelectionRange.getEndLine(),
          endSelectionRange.getEndNodeOffset(),
          startSelectionRange.isStartOfStartLine(),
          endSelectionRange.isStartOfEndLine());
  selection.selectDocument(selectionRange);
};


/**
 * @private
 */
pwk.Editor.prototype.scrollInLoop_ = function() {
  if (this.scrollLoopInProgress_) {

    // TODO: Make a smooth scrolling

    var googDom = goog.dom;
    var viewPortSize = googDom.getViewportSize();
    var viewPortWidth = viewPortSize.width;
    var viewPortHeight = viewPortSize.height;
    var container = googDom.getElementByClass(pwk.EditorContainer.CSS_CLASS);
    var e = this.scrollLoopBrowserEvent_;
    var clientX = e.clientX;
    var clientY = e.clientY;
    var offsetY = 0;

    if (clientX < 0 || clientX >= viewPortWidth) {
      clientX = clientX < 0 ? 1 : viewPortWidth;
    }

    if (clientY < 50 || clientY >= viewPortHeight) {
      offsetY = clientY < 0 ? clientY : clientY - viewPortHeight;
      clientY = clientY < 0 ? 50 : viewPortHeight - 50;
    }

    var y = goog.style.getContainerOffsetToScrollInto(
        this.selection_.getRange().getEndLine().getElement(), container).y;
    var scroll = new goog.fx.dom.Scroll(container, [0, container.scrollTop],
        [0, y + ((offsetY == 0 ? 15 : offsetY) * 5)], 50);

    scroll.listen(goog.fx.Transition.EventType.END, goog.bind(function() {
      if (this.scrollLoopInProgress_) {
        this.selectFromRangeToPoint_(this.startSelectionRange_, clientX,
            clientY);
        this.scrollInLoop_();
      }
    }, this));

    scroll.play();
  }
};


/**
 * Handles mouseup event.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @private
 */
pwk.Editor.prototype.onMouseUp_ = function(e) {
  if (e.isMouseActionButton()) {
    this.isSelectionUsingMouseStarted_ = false;
    this.startSelectionRange_ = null;
    this.scrollLoopInProgress_ = false;
    this.scrollLoopBrowserEvent_ = null;
  }

  e.preventDefault();
};


/**
 * Handles focus event.
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
pwk.Editor.prototype.onFocusIn_ = function(e) {
  var selection = this.selection_;
  if (selection.getRange().isCollapsed()) {
    this.selection_.getCaret().show();
  }
};


/**
 * Handles focus out event.
 * @param {goog.events.BrowserEvent} e Browser's event object.
 * @private
 */
pwk.Editor.prototype.onFocusOut_ = function(e) {
  var selection = this.selection_;
  if (selection.getRange().isCollapsed()) {
    this.selection_.getCaret().hide();
  }
};


/**
 * Attempts to handle a keyboard event.
 * @param {goog.events.KeyEvent} e The key event.
 * @return {boolean}
 * @private
 */
pwk.Editor.prototype.handleKeyEvent_ = function(e) {
  var isStopPropagation = false;

  // Fix charCode for Opera on Mac
  if (goog.userAgent.OPERA && goog.userAgent.MAC) {
    e.charCode = e.getBrowserEvent().which;
  }

  switch (e.keyCode) {
    case goog.events.KeyCodes.ENTER:
      this.document_.createNewLine();
      isStopPropagation = true;
      break;

    case goog.events.KeyCodes.BACKSPACE:
      isStopPropagation = true;
      this.document_.deleteSelection(true);
      break;

    case goog.events.KeyCodes.DELETE:
      isStopPropagation = true;
      this.document_.deleteSelection();
      break;

    case goog.events.KeyCodes.LEFT:
      this.selection_.moveCaretLeft();
      isStopPropagation = true;
      break;

    case goog.events.KeyCodes.RIGHT:
      this.selection_.moveCaretRight();
      isStopPropagation = true;
      break;

    case goog.events.KeyCodes.HOME:
      this.selection_.moveCaretLineStart();
      isStopPropagation = true;
      break;

    case goog.events.KeyCodes.END:
      this.selection_.moveCaretLineEnd();
      isStopPropagation = true;
      break;

    case goog.events.KeyCodes.UP:
      this.selection_.moveCaretUp();
      isStopPropagation = true;
      break;

    case goog.events.KeyCodes.DOWN:
      this.selection_.moveCaretDown();
      isStopPropagation = true;
      break;

    case goog.events.KeyCodes.TAB:
      this.document_.addValue(document.createTextNode('\u0009'));
      isStopPropagation = true;
      break;

    case goog.events.KeyCodes.F1:
    case goog.events.KeyCodes.F2:
    case goog.events.KeyCodes.F3:
    case goog.events.KeyCodes.F4:
    case goog.events.KeyCodes.F5:
    case goog.events.KeyCodes.F6:
    case goog.events.KeyCodes.F7:
    case goog.events.KeyCodes.F8:
    case goog.events.KeyCodes.F9:
    case goog.events.KeyCodes.F10:
    case goog.events.KeyCodes.F11:
    case goog.events.KeyCodes.F12:
      break;

    default:
      if (e.charCode > 0 && !e.ctrlKey && !e.metaKey) {
        switch (e.charCode) {
          default:
            this.document_.addValue(String.fromCharCode(e.charCode));
            isStopPropagation = true;
        }
      }
  }

  if (isStopPropagation) {
    e.stopPropagation();
    e.preventDefault();
  }

  // Editor is focused?
  var element = this.getElement();
  if (document.activeElement != element) {
    element.focus();
  }

  return isStopPropagation;
};


/**
 * Handles keyboard shortcuts on the editor.
 * @param {goog.ui.KeyboardShortcutEvent} e
 * @private
 */
pwk.Editor.prototype.handleKeyboardShortcut_ = function(e) {
  switch (e.identifier) {
    case pwk.Shortcuts.Default.SAVE[0]:
      console.info('Save document...');
      this.addTestText();
      break;

    case pwk.Shortcuts.Default.SELECT_ALL[0]:
      this.document_.getSelection().selectDocument();
      e.preventDefault();
      e.stopPropagation();
      break;
  }
};


/**
 * Register handled shortcut.
 * @param {goog.ui.KeyboardShortcutHandler} handler
 * @private
 */
pwk.Editor.prototype.registerKeyboardShortcut_ = function(handler) {
  for (var shortcut in pwk.Shortcuts.Default) {
    handler.registerShortcut(pwk.Shortcuts.Default[shortcut][0],
        goog.array.slice(pwk.Shortcuts.Default[shortcut], 1));
  }
};


/**
 * Keep in mind that this case is implemented for test purpose only and does not
 * work properly with Range / Selection.
 * @param {boolean=} opt_init
 */
pwk.Editor.prototype.addTestText = function(opt_init) {
  var generator = new goog.text.LoremIpsum();
  var paragraph;
  var line;
  var node;

  //console.profile('Normalization performance');
  for (var i = 0; i < 10; i++) {
    paragraph = generator.generateParagraph(false);
    if (i == 0 && opt_init) {
      line = /** @type {pwk.LeafNode} */(this.document_.getNodeAt(0))
          .getFirstLine();
      line.insertText(paragraph);
    } else {
      line = new pwk.Line(paragraph);
      node = new pwk.LeafNode(pwk.NodeTypes.PARAGRAPH, this.document_, line);
      this.document_.addNode(node);
    }
  }
  //console.profileEnd();
};


/**
 * Component default css class.
 * @type {string}
 */
pwk.Editor.CSS_CLASS = 'pwk-editor';


/**
 * iFrame text event target CSS class.
 * @type {string}
 */
pwk.Editor.CSS_TEXT_EVENT_TARGET = 'pwk-editor-textevettarget-iframe';
