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


    /* ------- Begin Available HTML Elements ------- */


    // Placeholder variables for image size
    var imgWidth = 0,
        imgHeight = 0,

        // Only the head and body tags + title and meta
        headBody = '<!DOCTYPE html>\n<html lang="">\n<head>\n' + fourSpaceIndent +
        '<meta charset="utf-8">\n' + fourSpaceIndent +'<title></title>\n' +
        '\n</head>\n\n<body>\n' + fourSpaceIndent + '\n</body>\n</html>\n',

        // External stylesheet
        externStyle = '<link rel="stylesheet" href="" />',

        // Inline stylesheet
        inlineStyle = '<style>\n</style>',

        // External script
        externScript = '<script src=""></script>',

        // Inline script
        inlineScript = externScript.replace('src=""', ""),

        // Picture/Image
        image = '<img width="' + imgWidth + '" height="'+ imgHeight +'" src="" />',

        // Assign a variable for 4 space indentation for easier construction
        fourSpaceIndent = "\u0020\u0020\u0020\u0020",

        // Full HTML skeleton
        fullHtmlSkelly = '<!DOCTYPE html>\n<html lang="">\n<head>\n' + fourSpaceIndent +
        '<meta charset="utf-8">\n' + fourSpaceIndent +'<title></title>\n' + fourSpaceIndent +
        '<link rel="stylesheet" href="" />' + '\n</head>\n\n<body>\n' +
        fourSpaceIndent + '<script src=""></script>\n</body>\n</html>\n';


    /* ------- End Available HTML Elements ------- */


    /*function inserthtmlSkelly() {
        var editor = EditorManager.getFocusedEditor();
        if (editor) {
            // Insert the skeleton at the current cursor position
            var cursor = editor.getCursorPos();
            editor.document.replaceRange(htmlSkelly, cursor);
        }
    }*/


    function _showSkellyDialog() {
        /* Display the HTML Skeleton box */

        var skellyDialog = Dialogs.showModalDialogUsingTemplate(skellyDialogHtml),
            $openButton = skellyDialog.getElement().find(".close"),
            $doneButton = skellyDialog.getElement().find("#done-button");

        // Close the dialog box
        $openButton.on("click", skellyDialog.close.bind(skellyDialog));

        // Upon closing the dialog, run function to gather and apply choices
        $doneButton.on("click", _performActions);

        // Display the logo
        $("#html-skeleton-figure").attr("src", skellyLogo);

        // If the width and height boxes are not the default size (1), reuse the previous value.
        // Technically, the value is already reused, but this makes it more obvious.
        if (imgWidth !== 0) {
            $("#img-width").val(imgWidth);
        }
        if (imgHeight !== 0) {
            $("#img-height").val(imgHeight);
        }
    }


    function _performActions() {
        /* Get element choices and insert them */

        // Store all the option IDs for quicker access (and easier coding :P)
        var optionIDs = ["#head-body", "#extern-style-tag", "#inline-style-tag",
                         "#extern-script-tag", "#inline-script-tag", "#full-skelly"
                        ],
            $imgWidthID = $("#img-width"),
            $imgHeightID = $("#img-height");

        // The picture/image box is checked
        if ($("#img-tag:checked").val()) {

            // The width box was filled out, use that value
            if ($imgWidthID.val()) {
                imgWidth = $imgWidthID.val();
            }

            // The height box was filled out, use that value
            if ($imgHeightID.val()) {
                imgHeight = $imgHeightID.val();
            }

        } else {
            // The box was not checked, reset sizes
            imgWidth = 0;
            imgHeight = 0;
        }

        optionIDs.forEach(function (value, index) {
            if ($(value + ":checked").val() === "on") {
                console.log(value);
            }
        });
    }


    AppInit.appReady(function () {
        /* Load the extension after Brackets itself has finished loading */

        // Load any required CSS
        ExtensionUtils.loadStyleSheet(module, "css/style.css");

        // Add a shortcut to the toolbar
        var $toolbarButton = $(toolbarButtonCode);
        $toolbarButton.appendTo("#main-toolbar > .buttons");

        // Assign a keyboard shortcut and option in File menu
        CommandManager.register("Insert HTML elements", EXTENSION_ID, _showSkellyDialog);
        var theMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
        theMenu.addMenuItem(EXTENSION_ID, "Ctrl-Shift-N");

        // Set the button's title attribute, open dialog when clicked
        $toolbarButton.attr("title", "Insert HTML elements");
        $toolbarButton.on("click", _showSkellyDialog);
    });
});
