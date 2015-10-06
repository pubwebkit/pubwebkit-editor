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
 * @fileoverview Rich Text Editor.
 *
 * @author Dmitry Antonenko <dmitry.antonenko@pubwebkit.com>
 */

goog.provide('pwk.Editor');

goog.require('pwk.Document');
goog.require('pwk.Shortcuts.Default');
goog.require('pwk.Shortcuts.MacOS');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.events.KeyNames');
goog.require('goog.ui.Component');
goog.require('goog.dom.classlist');
goog.require('goog.ui.KeyboardShortcutHandler');
goog.require('goog.editor.icontent');
goog.require('goog.dom.iframe');
goog.require('goog.events.FocusHandler');
goog.require('goog.json');


/**
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
     * @type {pwk.Selection}
     * @private
     */
    this.selection_ = this.document_.getSelection();


    /**
     * @type {pwk.Range}
     * @private
     */
    this.startSelectionRange_;


    /**
     * Indicated is selection of document started or not
     * @type {boolean}
     * @private
     */
    this.isSelectionStarted_ = false;

    /**
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
    var el = this.getElement();
    goog.dom.classlist.add(el, pwk.Editor.CSS_CLASS);

    // Set editor focusable
    goog.dom.setFocusableTabIndex(el, true);
    el.focus();
};


/** @inheritDoc */
pwk.Editor.prototype.enterDocument = function() {
    goog.base(this, 'enterDocument');

    var element = this.getElement();

    // Initialize private members
    this.keyHandler_ = new goog.events.KeyHandler(element);
    this.keyTarget_ = element;
    this.keyboardShortcutHandler_ = new goog.ui.KeyboardShortcutHandler(this.keyTarget_);
    this.focusHandler_ = new goog.events.FocusHandler(element);


    // Add children component
    this.addChild(this.document_, true);

    // Editor is focused?
    if(document.activeElement != element) {
        element.focus();
    }

    goog.style.setUnselectable(element, true);

    // Initialize events
    this.initializeEvents_();


    // TODO: [Dmitry Antonenko] Just for current development stage!!
    this.addTestText(true);
};


/**
 * Initialize key event handler
 *
 * @private
 */
pwk.Editor.prototype.initializeEvents_ = function() {
    this.getHandler()
        // Handle keyboard shortcuts
        .listen(this.keyboardShortcutHandler_, goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED, this.handleKeyboardShortcut_)
        // Handle editor focus
        .listen(this.focusHandler_, goog.events.FocusHandler.EventType.FOCUSIN, this.onFocusIn_)
        .listen(this.focusHandler_, goog.events.FocusHandler.EventType.FOCUSOUT, this.onFocusOut_)
        // Handle keys pressing
        .listen(this.keyHandler_, goog.events.KeyHandler.EventType.KEY, this.handleKeyEvent_)
        // Handle selection
        .listen(this.keyTarget_, goog.events.EventType.MOUSEDOWN, this.onMouseDown_, true)
        .listen(document, goog.events.EventType.MOUSEMOVE, this.onMouseMove_, true)
        .listen(document, goog.events.EventType.MOUSEUP, this.onMouseUp_, true);

    // Register keyboard shortcuts
    if(goog.userAgent.MAC) {
        this.registerKeyboardShortcutForMacOS_(this.keyboardShortcutHandler_);
    } else {
        this.registerKeyboardShortcut_(this.keyboardShortcutHandler_);
    }
};


/**
 *
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @private
 */
pwk.Editor.prototype.onMouseDown_ = function(e) {

    if(e.isMouseActionButton()) {
        var editorEl = this.getElement()
          , selection = this.selection_;

        // Editor is focused?
        if(document.activeElement != editorEl) {
            editorEl.focus();
        }

        this.isSelectionStarted_ = true;
        selection.removeSelection();

        var selectionRange = selection.getSelectionRangeFromPoint(e.clientX, e.clientY);
        if(goog.isDefAndNotNull(selectionRange)) {
            selection.setRange(selectionRange);
            selection.updateCaretFromRange();
            this.startSelectionRange_ = selectionRange;
        }

        e.preventDefault();
    }
};


/**
 *
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @private
 */
pwk.Editor.prototype.onMouseMove_ = function(e) {
    if(e.isMouseActionButton() && this.isSelectionStarted_) {

        var viewPortSize = goog.dom.getViewportSize();

        if(e.clientY < viewPortSize.height - 50 && e.clientY > -1) {
            this.scrollLoopInProgress_ = false;
            this.selectFromRangeToPoint_(this.startSelectionRange_, e.clientX, e.clientY);
        } else {
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
    if(e) { this.scrollLoopBrowserEvent_ = e; }

    if(!this.scrollLoopInProgress_) {
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
pwk.Editor.prototype.selectFromRangeToPoint_ = function(startSelectionRange, x, y) {
    var selection = this.selection_
      , endSelectionRange = selection.getSelectionRangeFromPoint(x, y)
      , selectionRange = pwk.Range.createFromNodes(startSelectionRange.getStartLine()
                                                 , startSelectionRange.getStartNodeOffset()
                                                 , endSelectionRange.getEndLine()
                                                 , endSelectionRange.getEndNodeOffset()
                                                 , startSelectionRange.isStartOfStartLine()
                                                 , endSelectionRange.isStartOfEndLine());
    selection.selectDocument(selectionRange);
};


/**
 * @private
 */
pwk.Editor.prototype.scrollInLoop_ = function() {
    if(this.scrollLoopInProgress_) {

        // TODO: Make a smooth scrolling

        var googDom = goog.dom
          , viewPortSize = googDom.getViewportSize()
          , viewPortWidth = viewPortSize.width
          , viewPortHeight = viewPortSize.height
          , container = googDom.getElementByClass(pwk.EditorContainer.CSS_CLASS)
          , e = this.scrollLoopBrowserEvent_
          , clientX = e.clientX
          , clientY = e.clientY
          , offsetY = 0;

        if(clientX < 0 || clientX >= viewPortWidth ) {
            clientX = clientX < 0 ? 1 : viewPortWidth;
        }

        if(clientY < 50 || clientY >= viewPortHeight) {
            offsetY = clientY < 0 ? clientY : clientY - viewPortHeight;
            clientY = clientY < 0 ? 50 : viewPortHeight - 50;
        }

        var y = goog.style.getContainerOffsetToScrollInto(this.selection_.getRange().getEndLine().getElement(), container).y;
        var scroll = new goog.fx.dom.Scroll(container, [0, container.scrollTop], [0, y + ((offsetY == 0 ? 25 : offsetY) * 5)], 50);

        scroll.listen(goog.fx.Transition.EventType.END, goog.bind(function() {
            if(this.scrollLoopInProgress_) {
                this.selectFromRangeToPoint_(this.startSelectionRange_, clientX, clientY);
                this.scrollInLoop_();
            }
        }, this));

        scroll.play();
    }
};


/**
 *
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @private
 */
pwk.Editor.prototype.onMouseUp_ = function(e) {
    if(e.isMouseActionButton()) {
        this.isSelectionStarted_ = false;
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
    if(selection.getRange().isCollapsed()){
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
    if(selection.getRange().isCollapsed()){
        this.selection_.getCaret().hide();
    }
};


/**
 * Attempts to handle a keyboard event,
 * @param {goog.events.KeyEvent} e
 * @private
 */
pwk.Editor.prototype.handleKeyEvent_ = function(e) {
    var isStopPropagation = false;

    // Fix charCode for Opera on Mac
    if(goog.userAgent.OPERA && goog.userAgent.MAC) {
        e.charCode = e.getBrowserEvent().which;
    }

    switch (e.keyCode) {
        case goog.events.KeyCodes.ENTER:
            this.document_.newLine();
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
            if(e.charCode > 0 && !e.ctrlKey && !e.metaKey) {
                switch (e.charCode) {
                    default:
                        this.document_.addValue(String.fromCharCode(e.charCode));
                        isStopPropagation = true;
                }
            }
    }

    if(isStopPropagation) {
        e.stopPropagation();
        e.preventDefault();
    }

    // Editor is focused?
    var element = this.getElement();
    if(document.activeElement != element) {
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
    // NOTE: Process shortcuts here. For details see {goog.ui.KeyboardShortcutHandler}
    // NOTE: Remember about Mac and Win keyboard

    switch(e.identifier) {
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
 *
 * @param {goog.ui.KeyboardShortcutHandler} handler
 * @private
 */
pwk.Editor.prototype.registerKeyboardShortcut_ = function(handler) {
    for(var shortcut in pwk.Shortcuts.Default) {
        handler.registerShortcut(pwk.Shortcuts.Default[shortcut][0], goog.array.slice(pwk.Shortcuts.Default[shortcut], 1));
    }
};


/**
 * Register handled shortcut.
 *
 * @param {goog.ui.KeyboardShortcutHandler} handler
 * @private
 */
pwk.Editor.prototype.registerKeyboardShortcutForMacOS_ = function(handler) {
    for(var shortcut in pwk.Shortcuts.MacOS) {
        handler.registerShortcut(pwk.Shortcuts.MacOS[shortcut][0], goog.array.slice(pwk.Shortcuts.MacOS[shortcut], 1));
    }
};


/**
 * Keep in mind that this case is implemented for test purpose only and does not work properly with Range / Selection
 * @param {boolean=} opt_init
 */
pwk.Editor.prototype.addTestText = function(opt_init) {
    var paragraphs = [
        //'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.     bla-bla-blaLorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et.'


        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque mollis, nulla viverra accumsan aliquet, sem ipsum aliquam dui, dignissim ultrices tortor purus non nisl. Curabitur tempor diam et turpis feugiat, sit amet fermentum turpis egestas. Vivamus vel quam sed augue convallis viverra. Vivamus a erat tortor. Phasellus turpis ante, euismod vel risus et, egestas dictum urna. Donec scelerisque vitae turpis quis commodo. Nulla sit amet aliquet sem, vitae sodales lacus. Sed malesuada condimentum urna. Sed rhoncus magna quis lorem vehicula accumsan. Cras venenatis pellentesque semper.',
        'Cras tincidunt leo id tincidunt lacinia. Aenean id mollis urna. Proin dapibus commodo felis sed lobortis. Praesent sodales libero lacus, a finibus ipsum semper nec. Phasellus mollis est elementum leo interdum, quis dictum lacus dignissim. Praesent in placerat arcu, at elementum nulla. Phasellus auctor tincidunt neque non commodo. Aliquam pulvinar metus ut lacus efficitur, et pharetra nibh tempus.',
        'Etiam vulputate eleifend risus tincidunt pretium. Phasellus sodales libero eget enim interdum, elementum scelerisque ipsum suscipit. Praesent lobortis a dolor id tristique. Etiam ligula lorem, consequat id malesuada eget, porttitor eget neque. Phasellus finibus ut ipsum luctus aliquam. Quisque vitae neque dignissim, iaculis velit commodo, vehicula orci. Maecenas vitae vestibulum ex. Proin interdum pretium rhoncus. Aliquam tincidunt diam at est ullamcorper, at scelerisque massa consequat. Nam eget pulvinar nunc.',
        'Fusce non consequat est. Nam ex dui, dignissim sit amet facilisis id, sodales in lorem. Suspendisse nec placerat velit. Ut neque massa, malesuada ac cursus et, aliquet vitae nunc. Donec arcu ex, volutpat sed pulvinar a, dictum vitae odio. In egestas erat massa, sit amet vehicula velit sodales sit amet. Duis egestas cursus diam at posuere. Proin tristique posuere nisl sit amet eleifend. Suspendisse potenti. Suspendisse sit amet volutpat nulla.',
        'Maecenas auctor, augue pharetra tempor bibendum, metus leo condimentum erat, ac eleifend mi leo id mauris. In in efficitur diam. Sed sollicitudin dignissim laoreet. Donec justo leo, bibendum nec neque sed, interdum finibus mi. Cras nec accumsan felis. Vivamus sed nibh nulla. Aenean euismod massa leo, et fringilla massa mollis at.',
        'Integer faucibus ex non justo ornare congue. Vivamus porttitor imperdiet risus sit amet mattis. Praesent vel libero nisl. Maecenas sollicitudin ullamcorper consequat. Morbi non varius augue, ac molestie ex. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Proin at iaculis ante. Nunc ut rutrum dui. Maecenas vel sollicitudin augue. In molestie, quam sit amet aliquam eleifend, tortor leo efficitur nisi, ut pretium dolor sem dapibus neque. Etiam maximus nulla id lacinia suscipit. Quisque eu est a dolor lacinia finibus quis non sapien.',
        'Proin lobortis pharetra eros, ac commodo risus dictum rutrum. Vestibulum eget maximus lorem. Ut feugiat gravida massa, porttitor bibendum diam porttitor nec. Nulla facilisi. Integer lobortis lobortis tortor in dignissim. Mauris velit tortor, blandit at interdum non, pretium vitae eros. Pellentesque volutpat neque in dolor ornare luctus. Praesent sed ultricies eros, nec rutrum turpis. Maecenas rutrum erat ac mi porta eleifend.',
        'Aliquam erat volutpat. Integer vulputate quam dapibus blandit pellentesque. In vel pellentesque felis, ac dignissim felis. Pellentesque dapibus leo purus, et dapibus massa ullamcorper et. Mauris in libero eu purus efficitur elementum eget a nunc. Etiam fermentum diam et lectus placerat, sed venenatis magna tempor. Ut tristique sodales nibh, quis aliquam augue aliquam non.',
        'Vestibulum a semper metus, id aliquet augue. Vestibulum consectetur, nulla sed imperdiet ultricies, tortor lectus ultrices purus, et elementum odio magna ut risus. Vestibulum dignissim risus non ex porta, et feugiat leo rutrum. Phasellus sapien libero, tempus et placerat quis, varius tempus metus. Phasellus varius sit amet ex vel fringilla. In ut tempor erat. Proin congue, elit sed porta ornare, mauris nulla lacinia dui, a dignissim risus nisl viverra orci. Vestibulum luctus sapien vitae purus elementum, in luctus magna bibendum. Sed quis mi feugiat lectus venenatis ultrices eget volutpat orci. Cras quis consectetur quam, molestie ornare quam. Proin molestie erat id elementum facilisis. Donec efficitur ante non augue pretium semper. Duis in sem neque. Sed et sem tristique, sollicitudin nulla non, volutpat dui.',
        'Fusce at tempus metus, vel hendrerit est. Suspendisse id dolor in quam semper facilisis ut et lacus. Nullam eget ligula sed ipsum finibus mattis. Aliquam eu ex eget augue aliquet tempus. Maecenas feugiat mauris purus, rhoncus posuere tellus feugiat nec. Cras blandit purus vitae neque mattis, consectetur elementum ex bibendum. Morbi a nisi in nisl tempus interdum non nec tellus. Cras vulputate mauris in sapien vestibulum, eu pulvinar sapien venenatis. Nunc vestibulum ligula purus, at semper magna finibus at. Nullam eget nunc dolor. Curabitur vel turpis a arcu volutpat pharetra. Proin sit amet eros vel nisi venenatis bibendum. Vivamus mollis scelerisque nisl nec aliquet. Sed tempus eros quis egestas posuere. Nunc sodales hendrerit nunc, non sodales magna finibus vel.',
        'Sed convallis gravida lectus, non ultrices quam gravida interdum. Pellentesque iaculis ac arcu eu sodales. Nulla efficitur porta mauris vitae ornare. Aliquam lacinia ante nunc, a accumsan lorem laoreet a. Quisque ornare tempus auctor. Nam vel lacus vel nibh consectetur scelerisque quis id turpis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec interdum nisl nunc, a iaculis metus scelerisque ullamcorper. In porttitor, dui ac blandit hendrerit, tortor sem ornare risus, id convallis mi nulla et ligula. Pellentesque at posuere dui. Sed mi leo, pulvinar in nulla id, ultricies interdum sem. Aliquam a mauris eget purus tempor placerat.'

        //'Vivamus ante est, porta sed mollis ac, porta quis orci. Ut vulputate enim sed lacus posuere, eget dapibus quam fringilla. Suspendisse et ornare ex. Duis a commodo purus, sit amet aliquam mi. Sed consectetur posuere tellus, a tincidunt odio sollicitudin sed. Phasellus consectetur mi sem, id tristique metus finibus egestas. Pellentesque vitae nisi odio. Cras eu dapibus ex. Aenean quis scelerisque odio. Phasellus nec sollicitudin quam.',
        //'Fusce commodo purus in turpis fringilla laoreet. Fusce rhoncus pharetra sagittis. Maecenas risus magna, commodo et finibus eu, bibendum ut dui. Nam lobortis consectetur nibh, ac interdum nulla pretium vel. Nullam id ultricies leo. Nunc nec purus vitae ipsum ornare egestas at et tellus. Nulla elementum, magna non placerat commodo, tortor lectus ullamcorper risus, at placerat sem odio ut quam. Praesent pretium rutrum felis, eu semper elit facilisis non. Suspendisse pharetra aliquam varius. Aliquam neque libero, pharetra id justo ac, commodo gravida turpis. Aenean gravida feugiat nibh auctor mollis. Sed condimentum pulvinar ex, at ultricies neque cursus eget. Donec elementum, ipsum vel ullamcorper suscipit, neque nunc mollis magna, at ornare arcu orci ut felis. Pellentesque ac dui placerat, efficitur neque vel, imperdiet libero.',
        //'Donec pellentesque velit mi. Fusce gravida tempor velit. Nulla et accumsan libero. Nam tellus eros, elementum quis ex non, fermentum scelerisque est. Sed faucibus arcu quis est dignissim efficitur. Nunc sagittis bibendum semper. Quisque at pretium arcu. Nunc at ipsum eget felis gravida euismod. Nam dolor neque, varius vel lobortis sit amet, semper elementum metus. Nam dapibus augue nec vulputate venenatis.',
        //'Integer pulvinar tincidunt posuere. Sed vestibulum sit amet enim in consequat. Etiam ornare felis quam, ut convallis enim sodales vitae. Mauris nulla enim, mattis quis suscipit eu, egestas vitae justo. Duis lacinia mollis enim vel scelerisque. Curabitur gravida sodales pharetra. Donec laoreet dignissim ipsum sit amet tincidunt. Nulla in mauris non tellus egestas placerat sit amet facilisis sapien. Integer eu lorem pharetra, aliquam orci sed, sollicitudin augue. Suspendisse sem enim, consequat vitae volutpat quis, semper vitae sapien. Sed porta imperdiet dapibus. Quisque vulputate velit in odio bibendum aliquet.'

        //'Ut a egestas massa. Vestibulum dignissim ipsum tortor, id porta augue auctor quis. Donec eget mi a libero rhoncus sagittis. Mauris mollis tellus ut tortor tempus luctus. In porttitor pretium facilisis. Aenean ut vulputate libero. Praesent risus est, laoreet vitae ipsum sed, feugiat aliquam leo. Vivamus purus orci, elementum sit amet mollis sed, vestibulum eget ligula. Aliquam feugiat aliquet tortor, sed finibus purus molestie nec. In condimentum, lectus ut feugiat pharetra, neque ante sagittis felis, a mattis est neque nec magna. Nulla molestie dignissim convallis. Vestibulum eu finibus odio. Curabitur semper consectetur risus, sed vestibulum libero posuere sit amet. Vestibulum gravida molestie suscipit. Nam enim mauris, auctor in enim nec, fringilla aliquet tortor.',
        //'Nulla nec viverra lorem. Nullam tempor faucibus enim, at tristique turpis gravida sit amet. Pellentesque nec risus pellentesque, euismod urna sed, cursus risus. Aenean lacinia, elit porta dapibus placerat, tellus nisi condimentum mauris, ac pulvinar tortor quam sit amet neque. Suspendisse elementum urna magna, in venenatis arcu suscipit vitae. Integer ultrices congue aliquam. Nulla sed metus vel nisi dignissim tincidunt vitae sed nisi. Praesent aliquam risus vel turpis porta, nec venenatis eros suscipit.',
        //'Aliquam porta justo commodo aliquet ornare. In purus nisl, malesuada sit amet rutrum eu, imperdiet nec leo. Donec posuere nisi et convallis mattis. Etiam finibus auctor neque, vitae consequat dui faucibus vitae. Vestibulum sit amet lacinia ex. Vestibulum tempor et magna et posuere. Vivamus massa ipsum, rutrum vulputate posuere ac, sagittis non ligula. Nulla varius leo a dictum ultrices.',
        //'Nulla sem diam, ultrices tempus eros ac, commodo ultrices enim. Integer et nisl consectetur nunc pharetra efficitur a sit amet velit. Pellentesque tortor enim, pharetra in dapibus sed, tempus at ex. Vestibulum felis neque, posuere at dapibus et, dapibus vel dolor. Nullam vitae elit orci. Fusce sodales quam vitae mi sollicitudin, vitae commodo enim bibendum. Vestibulum enim nulla, dapibus vitae nulla vel, efficitur euismod diam. Donec eleifend volutpat ligula et luctus. In lacinia eu ante eu maximus. Vestibulum pulvinar, augue a iaculis fermentum, neque orci dictum justo, in bibendum sem orci eget neque. Nam dolor nulla, egestas ac nisl vitae, feugiat pellentesque felis.',
        //'Cras nisl mauris, vulputate ut nibh ut, maximus viverra leo. Fusce tincidunt purus sit amet nisl suscipit lobortis. Sed nec faucibus dolor. Morbi at nibh porttitor, finibus risus a, elementum libero. Duis rhoncus convallis euismod. Donec auctor ipsum sed consectetur porttitor. Aliquam erat volutpat.',
        //'Ut posuere risus enim, a ullamcorper justo tristique id. Curabitur sed bibendum mi. Nam lacinia dapibus bibendum. Mauris varius augue ac ipsum vulputate porttitor. In ultrices orci libero, bibendum lacinia justo lacinia nec. In aliquet pulvinar nibh nec rutrum. Nullam vitae porttitor justo. Maecenas sed iaculis turpis, et hendrerit dolor. Nullam accumsan, libero id tincidunt pharetra, est ipsum cursus neque, vitae hendrerit urna augue ut purus. Etiam sed turpis ut nibh suscipit pharetra. Suspendisse pulvinar elementum molestie.',
        //'Sed vel nibh ultrices, laoreet orci nec, faucibus nunc. Mauris justo metus, vestibulum in maximus non, fermentum non massa. Donec quis urna porttitor, volutpat mi non, commodo lacus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Quisque volutpat auctor odio, quis consectetur eros eleifend id. Curabitur molestie rutrum velit eget ullamcorper. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec aliquam varius turpis, vitae tristique ligula pretium id. Nunc facilisis consectetur neque, in feugiat mauris porttitor quis. Etiam ac lectus imperdiet, commodo ante non, vulputate mi. Sed nunc nulla, gravida eu molestie nec, rhoncus quis quam. Pellentesque nunc orci, fermentum laoreet molestie sed, volutpat sit amet dui. Donec vitae massa lobortis metus fermentum auctor. Ut diam nisl, vulputate ac consectetur ullamcorper, laoreet sit amet metus. Duis gravida posuere mi. Etiam hendrerit consectetur leo, at pretium ante feugiat vestibulum.'
    ];
    var node;
    var line;

    //console.profile('Normalization performance');
    for(var i = 0; i < paragraphs.length; i++) {
        if(i == 0 && opt_init) {
            line = (/** @type {pwk.LeafNode} */ (this.document_.getNodeAt(0))).getFirstLine();
            line.insertText(paragraphs[i]);
        } else {
            line = new pwk.Line(paragraphs[i]);
            node = new pwk.LeafNode(pwk.NodeTypes.PARAGRAPH, this.document_, line);
            this.document_.addNode(node);
        }
    }
    //console.profileEnd();
};


/**
 * Component default css class
 * @type {string}
 */
pwk.Editor.CSS_CLASS = 'pwk-editor';


/**
 * iFrame text event target CSS class
 * @type {string}
 */
pwk.Editor.CSS_TEXT_EVENT_TARGET = 'pwk-editor-textevettarget-iframe';
