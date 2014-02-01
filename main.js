/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */

/*
    HTML Skeleton
    Created 2014 Triangle717
    <http://Triangle717.WordPress.com/>

    Licensed under The MIT Licenses
*/

define(function (require, exports, module) {
    "use strict";

    // Import the required Brackets modules
    var AppInit = brackets.getModule("utils/AppInit"),
        CommandManager = brackets.getModule("command/CommandManager"),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        EditorManager = brackets.getModule("editor/EditorManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        Menus = brackets.getModule("command/Menus"),

        // Pull in the entire dialog and define the toolbar button link
        skellyDialogHtml = require("text!mainDialog.html"),
        toolbarButtonCode = '<a href="#" id="html-skelly-icon">',

        // Grab our logo to display in the dialog
        skellyLogo = require.toUrl("img/HTML-Skeleton.svg"),

        // The extension ID
        EXTENSION_ID = "le717.html-skeleton";


    function inserthtmlSkelly() {
        /* Insert the skeleton */

        // Assign a variable for 4 space indentation for easier construction
        var fourSpaceIndent = "\u0020\u0020\u0020\u0020";

        // The HTML skeleton
        var htmlSkelly = '<!DOCTYPE html>\n<html lang="">\n<head>\n' + fourSpaceIndent +
            '<meta charset="utf-8">\n' + fourSpaceIndent +'<title></title>\n' + fourSpaceIndent +
            '<link rel="stylesheet" href="" />' + '\n</head>\n\n<body>\n' +
            fourSpaceIndent + '<script src=""></script>\n</body>\n</html>\n';

        var editor = EditorManager.getFocusedEditor();
        if (editor) {
            // Insert the skeleton at the current cursor position
            var cursor = editor.getCursorPos();
            editor.document.replaceRange(htmlSkelly, cursor);
        }
    }


    function _showSkellyDialog() {
        /* Display the HTML Skeleton box */

        var skellyDialog = Dialogs.showModalDialogUsingTemplate(skellyDialogHtml);
        skellyDialog.getElement().find(".close").on("click", skellyDialog.close.bind(skellyDialog));

        // Display the logo
        $("#html-skeleton-figure").attr("src", skellyLogo);
    }

    AppInit.appReady(function () {
        /* Load the extension after Brackets itself has finished loading */

        // Load any required CSS
        ExtensionUtils.loadStyleSheet(module, "css/style.css");

        // Add the shortcut (and only method of access) to the toolbar
        var $toolbarButton = $(toolbarButtonCode);
        $toolbarButton.appendTo("#main-toolbar > .buttons");

        // Assign a keyboard shortcut and option in File menu
        CommandManager.register("Insert HTML elements", EXTENSION_ID, _showSkellyDialog);
        var theMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
        theMenu.addMenuItem(EXTENSION_ID, "Ctrl-Shift-N");

        // Set the button's title attribute, open dialog when clicked
        $toolbarButton.attr("title", "Insert HTML elements");
        $toolbarButton.click(_showSkellyDialog);
    });
});
