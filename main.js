/* jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50 */
/* global define, brackets, $, require, Mustache */

/*
  HTML Skeleton
  Created 2014 Triangle717
  <http://Triangle717.WordPress.com/>

  Licensed under The MIT License
  <http://opensource.org/licenses/MIT/>
*/


/* ------- Begin Module Importing ------- */


define(function (require, exports, module) {
  "use strict";

  // Import the required Brackets modules
  var AppInit         = brackets.getModule("utils/AppInit"),
      CommandManager  = brackets.getModule("command/CommandManager"),
      Dialogs         = brackets.getModule("widgets/Dialogs"),
      Document        = brackets.getModule("document/Document"),
      EditorManager   = brackets.getModule("editor/EditorManager"),
      ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
      ImageViewer     = brackets.getModule("editor/ImageViewer"),
      Menus           = brackets.getModule("command/Menus"),
      ProjectManager  = brackets.getModule("project/ProjectManager"),

      // Import dialog localization
      Strings         = require("strings"),

      // Pull in the extension dialog
      skellyDialogHtml    = require("text!htmlContent/mainDialog.html"),

      // Grab the logo to display in the dialog
      skellyLogo      = require.toUrl("img/HTML-Skeleton.svg"),
      EXTENSION_ID    = "le717.html-skeleton";


  /* ------- End Module Importing ------- */


  /* ------- Begin Available HTML Elements ------- */

  // Assign a variable for 2 space indentation for easier coding
  // FUTURE Replace with Sprint 37 prefs system
  var twoSpaceIndent = "\u0020\u0020";

  // Placeholder variables for image size
  var $imgWidth = 0,
      $imgHeight = 0;

  var skellyBones = [
    // Only the head and body tags + title and meta
    '<!DOCTYPE html>\n<html lang="">\n<head>\n' + twoSpaceIndent +
    '<meta charset="UTF-8">\n' + twoSpaceIndent + '<title></title>\n' +
    '\n</head>\n\n<body>\n' + twoSpaceIndent + '\n</body>\n</html>\n',

    // External stylesheet
    '<link rel="stylesheet" href="">',

    // Inline stylesheet
    '<style></style>',

    // External script
    '<script src=""></script>',

    // Inline script
    '<script></script>',

    // Full HTML skeleton
    '<!DOCTYPE html>\n<html lang="">\n<head>\n' + twoSpaceIndent +
    '<meta charset="UTF-8">\n' + twoSpaceIndent + '<title></title>\n' +
    twoSpaceIndent + '<link rel="stylesheet" href="">' + '\n</head>\n\n<body>\n' +
    twoSpaceIndent + '<script src=""></script>\n</body>\n</html>\n'
  ];

  // Picture/Image
  var imageCode = '<img src="" alt="" width="size-x" height="size-y" />';


  /* ------- End Available HTML Elements ------- */


  /* ------- Begin HTML Element Adding ------- */

  function _insertAllTheCodes(finalElements) {
    /* Inter the selected elements into the document */

    // Get the last active editor because the dialog steals focus
    var editor = EditorManager.getActiveEditor();
    if (editor) {
      // Get the cursor position
      var cursor = editor.getCursorPos();

      // Get the elements from the list in reverse so everything is added in the proper order
      finalElements.reverse().forEach(function (value) {
        //  Wrap the actions in a `batchOperation` call, per guidelines
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

    var imageCodeNew,
        // Stores the elements to be added
        finalElements = [],

        // Store all the option IDs for easier access
        optionIDs = ["#head-body", "#extern-style-tag", "#inline-style-tag",
                     "#extern-script-tag", "#inline-script-tag", "#full-skelly"
                    ],

        // Shortcuts to the image size input boxes
        $imgWidthID = $("#img-width"),
        $imgHeightID = $("#img-height");

    // For each option that is checked, add the corresponding element
    // to `finalElements` for addition in document
    optionIDs.forEach(function (value, index) {
      if ($(value + ":checked").val() === "on") {
        finalElements.push(skellyBones[index]);
      }
    });

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
      // replacing the invalid values with valid ones
      imageCodeNew = imageCode.replace(/size-x/, $imgWidth);
      imageCodeNew = imageCodeNew.replace(/size-y/, $imgHeight);
      finalElements.push(imageCodeNew);
    }

    // Finally, run process to add the selected elements
    _insertAllTheCodes(finalElements);
  }


  /* ------- End HTML Element Choices ------- */


  /* ------- Begin HTML Skeleton Dialog Box ------- */


  function _showSkellyDialog() {
    /* Display the HTML Skeleton box */

    var localized = Mustache.render(skellyDialogHtml, Strings);
    var skellyDialog = Dialogs.showModalDialogUsingTemplate(localized),
        $doneButton = skellyDialog.getElement().find('.dialog-button[data-button-id="ok"]');

    // Display logo using Bracket's viewer
    ImageViewer.render(skellyLogo, $(".html-skeleton-image"));

    // Hide image stats
    $("#img-tip").remove();
    $("#img-scale").remove();

    // Upon closing the dialog, run function to gather and apply choices
    $doneButton.on("click", _getOptions);

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

    // Load extension CSS
    ExtensionUtils.loadStyleSheet(module, "css/style.css");

    // Create a menu item in the Edit menu
    CommandManager.register(Strings.INSERT_HTML_ELEMENTS, EXTENSION_ID, _showSkellyDialog);
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuItem(EXTENSION_ID);
  });
});


/* ------- End Extension Initialization ------- */
