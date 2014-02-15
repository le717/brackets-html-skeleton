/* jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/* global define, brackets, $ */

/*
    HTML Skeleton
    Created 2014 Triangle717
    <http://Triangle717.WordPress.com/>

    Licensed under The MIT Licenses
*/


    /* ------- Begin Module Importing ------- */


define(function (require, exports, module) {
    "use strict";

    // Import the required Brackets modules
    var AppInit = brackets.getModule("utils/AppInit"),
        CommandManager = brackets.getModule("command/CommandManager"),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        Document = brackets.getModule("document/Document"),
        EditorManager = brackets.getModule("editor/EditorManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        Menus = brackets.getModule("command/Menus"),

        // Pull in the entire dialog
        skellyDialogHtml = require("text!htmlContent/mainDialog.html"),

        // Grab our logo to display in the dialog
        skellyLogo = require.toUrl("img/HTML-Skeleton.svg"),

        // The extension ID
        EXTENSION_ID = "le717.html-skeleton";


    /* ------- End Module Importing ------- */


    /* ------- Begin Available HTML Elements ------- */

    // Assign a variable for 4 space indentation for easier coding
    var fourSpaceIndent = "\u0020\u0020\u0020\u0020";

    // Placeholder variables for image size
    var $imgWidth = 0,
        $imgHeight = 0;

    var skellyBones = [
            // Only the head and body tags + title and meta
            '<!DOCTYPE html>\n<html lang="">\n<head>\n' + fourSpaceIndent +
                '<meta charset="utf-8">\n' + fourSpaceIndent + '<title></title>\n' +
                '\n</head>\n\n<body>\n' + fourSpaceIndent + '\n</body>\n</html>\n',

            // External stylesheet
            '<link rel="stylesheet" href="" />',

            // Inline stylesheet
            '<style></style>',

            // External script
            '<script src=""></script>',

            // Inline script
            '<script></script>',

            // Full HTML skeleton
            '<!DOCTYPE html>\n<html lang="">\n<head>\n' + fourSpaceIndent +
                '<meta charset="utf-8">\n' + fourSpaceIndent + '<title></title>\n' +
                fourSpaceIndent + '<link rel="stylesheet" href="" />' + '\n</head>\n\n<body>\n' +
                fourSpaceIndent + '<script src=""></script>\n</body>\n</html>\n'
        ];

    // Picture/Image
    var imageCode = '<img width="0" height="0" src="" />';


    /* ------- End Available HTML Elements ------- */


    /* ------- Begin HTML Element Adding ------- */

    function _insertAllTheCodes(finalElements) {
        /* Inter the selected elements into the document */

        // Get the last active editor because the dialog steals focus
        var editor = EditorManager.getActiveEditor();
        if (editor) {
            // Get the cursor position
            var cursor = editor.getCursorPos();

            finalElements.forEach(function (value) {
                //  Wrap the actions in a `batchOperation`, per guidelines
                editor.document.batchOperation(function() {
                    // Insert the selected elements at the current cursor position
                    editor.document.replaceRange(value, cursor);
                });
            });
        }
    }


    /* ------- End HTML Element Adding ------- */


    /* ------- Begin HTML Element Choices ------- */


    function _getOptions() {
        /* Get element choices */

        // Stores the elements to be added
        var finalElements = [],

            // Store all the option IDs for quicker access (and easier coding :P)
            optionIDs = ["#head-body", "#extern-style-tag", "#inline-style-tag",
                         "#extern-script-tag", "#inline-script-tag", "#full-skelly"
                        ],

            // Shortcuts to the image size input boxes
            $imgWidthID = $("#img-width"),
            $imgHeightID = $("#img-height");

        // The picture/image box is checked
        if ($("#img-tag:checked").val() === "on") {
            // The width box was filled out, use that value
            if ($imgWidthID.val()) {
                $imgWidth = $imgWidthID.val();
            } else {
                // The width box was empty, reset to 0
                $imgWidth = 0;
            }

            // The height box was filled out, use that value
            if ($imgHeightID.val()) {
                $imgHeight = $imgHeightID.val();
            } else {
                // The height box was empty, reset to 0
                $imgHeight = 0;
            }

            // Add the image tag to `finalElements` for addition in document,
            // replacing the default size with the the new values
            finalElements.push(
                imageCode.replace('<img width="0" height="0"',
                                      '<img width="' + $imgWidth +
                                      '" height="' + $imgHeight + '"')
            );

        } else {
            // The box was not checked, reset sizes
            $imgWidth = 0;
            $imgHeight = 0;
        }

        // For each option that is checked, add the corrisponding element
        // to `finalElements` for addition in document
        optionIDs.forEach(function (value, index) {
            if ($(value + ":checked").val() === "on") {
                finalElements.push(skellyBones[index]);
            }
        });

        // Finally, run process to add the selected elements
        _insertAllTheCodes(finalElements);
    }


    /* ------- End HTML Element Choices ------- */


    /* ------- Begin HTML Skeleton Dialog Box ------- */


    function _showSkellyDialog() {
        /* Display the HTML Skeleton box */

        var skellyDialog = Dialogs.showModalDialogUsingTemplate(skellyDialogHtml),
            $doneButton = skellyDialog.getElement().find('.dialog-button[data-button-id="ok"]');

        // Upon closing the dialog, run function to gather and apply choices
        $doneButton.on("click", _getOptions);

        // Display the logo
        $("#html-skeleton-figure").attr("src", skellyLogo);

        /* FUTURE Disabled unless persistent values are a good thing to have */
        // If the width and height boxes are not the default size (0), reuse the previous value.
        // Technically, the values are already reused, but this makes it more obvious.
        //        if ($imgWidth !== 0) {
        //            $("#img-width").val($imgWidth);
        //        }
        //        if ($imgHeight !== 0) {
        //           $("#img-height").val($imgHeight);
        //        }
    }


    /* ------- End HTML Skeleton Dialog Box ------- */


    /* ------- Begin Extension Initialization ------- */


    AppInit.appReady(function () {
        /* Load the extension after Brackets itself has finished loading */

        // Load any required CSS
        ExtensionUtils.loadStyleSheet(module, "css/style.css");

        // Assign a keyboard shortcut and item in Edit menu
        CommandManager.register("Insert HTML elements \u2026", EXTENSION_ID, _showSkellyDialog);
        var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
        menu.addMenuItem(EXTENSION_ID, "Ctrl-Shift-N");
    });
});


/* ------- End Extension Initialization ------- */
