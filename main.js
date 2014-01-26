/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets */

define(function () {
    "use strict";
    /*
    Simple extension that adds a "File > New HTML Document" menu item
    to insert an HTML "skeleton" at cursor position
    */
    var CommandManager = brackets.getModule("command/CommandManager"),
        EditorManager = brackets.getModule("editor/EditorManager"),
        Menus = brackets.getModule("command/Menus");


    function inserthtmlSkelly() {
        /* Insert the skeleton */
        // Assign a variable for 4 space indentation for easier construction
        var fourSpaceIndent = "\u0020\u0020\u0020\u0020";

        // The HTML skeleton
        var htmlSkelly = '<!DOCTYPE html>\n<html lang="en">\n<head>\n' + fourSpaceIndent +
            '<meta charset="utf-8">\n' + fourSpaceIndent +'<title></title>\n' + fourSpaceIndent +
            '<link rel="stylesheet" href="" />' + '\n</head>\n\n<body>\n' +
            fourSpaceIndent + '<script src=""></script>\n</body>\n</html>\n';

        var editor = EditorManager.getFocusedEditor();
        if (editor) {
            // Insert the skeleton at the current cursor position
            var insertionPos = editor.getCursorPos();
            editor.document.replaceRange(htmlSkelly, insertionPos);
        }
    }


    // Register extension in the File menu
    var EXTENSION_ID = "le717.html-skeleton";
    CommandManager.register("New HTML Document", EXTENSION_ID, inserthtmlSkelly);

    // Assign a keyboard shortcut
    var theMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    theMenu.addMenuItem(EXTENSION_ID, "Ctrl-Shift-N");
});
