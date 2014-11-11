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
goog.require('goog.dom.classes');
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
     * @type {goog.events.EventTarget|EventTarget} keyTarget Event target that the event
     * listener should be attached to.
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
    goog.dom.classes.add(this.getElement(), pwk.Editor.CSS_CLASS);

    // Set editor focusable
    goog.dom.setFocusableTabIndex(this.getElement(), true);
    this.getElement().focus();
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


    // TODO: Remove it in production mode!!!
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

        var elementFromPoint = document.elementFromPoint(e.clientX, e.clientY);
        if(elementFromPoint) {
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
          , viewPortWidth = googDom.getViewportSize().width
          , documentHeight = googDom.getDocumentHeight()
          , container = googDom.getElementByClass(pwk.EditorContainer.CSS_CLASS)
          , e = this.scrollLoopBrowserEvent_
          , clientX = e.clientX
          , clientY = e.clientY
          , offsetY = 0;

        if(clientX < 0 || clientX >= viewPortWidth ) {
            clientX = clientX < 0 ? 1 : viewPortWidth - 5;
        }

        if(clientY < 10 || clientY >= documentHeight) {
            offsetY = clientY < 0 ? clientY : clientY - documentHeight;
            clientY = clientY < 0 ? 30 : documentHeight - 30;
        }

        var y = goog.style.getContainerOffsetToScrollInto(this.selection_.getRange().getEndLine().getElement(), container).y;
        var scroll = new goog.fx.dom.Scroll(container, [0, container.scrollTop], [0, y + (offsetY >= 0 ? 150 : -150)], 35);

        scroll.listen(goog.fx.Transition.EventType.FINISH, goog.bind(function() {
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
}


/**
 * Keep in mind that this case is implemented for test purpose only and does not work properly with Range / Selection
 * @param {boolean=} opt_init
 */
pwk.Editor.prototype.addTestText = function(opt_init) {
    var paragraphs = [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. ',
        'Pellentesque ac vulputate tellus. Proin et lacinia est. Pellentesque lectus magna, malesuada eget sem vitae, dictum faucibus sapien. Cras mollis dolor at posuere faucibus. Phasellus scelerisque lacus non nisl convallis molestie. In et dui fermentum, posuere risus ac, lobortis orci. Suspendisse varius, ligula in molestie ultrices, mauris felis adipiscing tortor, et eleifend lacus risus id mauris. Mauris sed facilisis sem. ',
        'Interdum et malesuada fames ac ante ipsum primis in faucibus. Ut pulvinar quam in tortor pretium, a euismod massa imperdiet. Phasellus luctus urna nec tincidunt lacinia. Fusce sed mi euismod, mattis libero id, facilisis sapien. Maecenas at orci sit amet augue vestibulum rhoncus. Aliquam ac ipsum risus. Fusce condimentum egestas turpis, id tempus felis mollis ac. Donec scelerisque a justo quis tincidunt.',
        'Phasellus varius cursus mollis. Aliquam vel arcu bibendum, porttitor nulla sed, tempus dolor. Proin gravida imperdiet mauris quis mollis. Fusce eu neque diam. Vivamus mattis consequat sem, pulvinar fringilla neque rhoncus et. Aliquam a commodo turpis, nec feugiat lorem. Suspendisse consectetur malesuada enim non ultricies. Sed ac pellentesque quam. Aliquam id justo non tortor congue consequat. Mauris laoreet adipiscing blandit. Etiam nec dictum nibh. Integer pharetra gravida elit, eget ultricies purus vehicula quis. Ut massa diam, volutpat ac iaculis quis, tempor in nisi. ',
        'Nunc eu malesuada massa. Phasellus quis erat arcu. Vestibulum cursus erat non mollis sollicitudin. Duis et dui velit. Integer eget eros vel est consequat varius. Phasellus quis faucibus erat. Nunc nec ullamcorper massa, eget ornare sem. Curabitur non tempus dolor. Phasellus elementum orci sed tortor faucibus cursus. Ut vulputate ipsum sit amet quam adipiscing mollis. ',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tempus mauris velit, sit amet pharetra mi feugiat et. Nullam eu dolor quis sem tristique semper id id metus. Integer ac ultrices nunc. Ut a semper ligula. Duis dignissim mauris quam, vel suscipit ligula eleifend sit amet. Proin sodales et nunc eget pretium. Vestibulum mattis odio ac magna condimentum interdum. '
    ]
    var node;
    var line;

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
}


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