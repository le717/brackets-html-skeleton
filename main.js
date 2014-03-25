/* jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50 */
/* global define, brackets, $, require, Mustache, window */

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
  var AppInit            = brackets.getModule("utils/AppInit"),
      CommandManager     = brackets.getModule("command/CommandManager"),
      Dialogs            = brackets.getModule("widgets/Dialogs"),
      Document           = brackets.getModule("document/Document"),
      EditorManager      = brackets.getModule("editor/EditorManager"),
      ExtensionUtils     = brackets.getModule("utils/ExtensionUtils"),
      ImageViewer        = brackets.getModule("editor/ImageViewer"),
      Menus              = brackets.getModule("command/Menus"),
      PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
      ProjectManager     = brackets.getModule("project/ProjectManager"),

      // Import dialog localization
      Strings            = require("strings"),

      // Pull in any required HTML
      skeletonDialogHtml = require("text!htmlContent/mainDialog.html"),
      toolbarButtonCode  = '<a href="#" id="html-skeleton-toolbar">',

      // Grab the logo to display in the dialog
      skeletonLogo       = require.toUrl("img/HTML-Skeleton.svg"),
      EXTENSION_ID       = "le717.html-skeleton";

  window.indentUnits = null;


  /* ------- End Module Importing ------- */

  // Get user's indentation settings
  PreferencesManager.on("change", function (e, data) {
    data.ids.forEach(function (value) {

      // The `useTabChar` preference was changed, update our settings
      if (value === "useTabChar") {
        // FIXME Put this value in the global namspace
        //window.indentUnits = _getIndentSize();
        _getIndentSize();
      }
    });
  });


  /* ------- Begin Reading Indentation Preference ------- */


  function _repeat(str, num) {
    /* Taken from http://stackoverflow.com/a/4550005 */
    return (new Array(num + 1)).join(str);
  }

  function _getIndentSize() {
    /* Get the user's indentation settings for inserted code */

    var indentUnits, indentUnitsInt,
        tabCharPref = PreferencesManager.get("useTabChar", PreferencesManager.CURRENT_PROJECT);

    // The user is using tabs
    if (tabCharPref) {
      indentUnitsInt = PreferencesManager.get("tabSize");
      indentUnits = _repeat("\u0009", indentUnitsInt);

      // The user is using spaces
    } else {
      indentUnitsInt = PreferencesManager.get("spaceUnits");
      indentUnits = _repeat("\u0020", indentUnitsInt);
    }
    console.log("HTML SKELETON - INDENT UNITS " + [tabCharPref, indentUnitsInt]);
    return indentUnits;

  }


  /* ------- End Reading Indentation Preference ------- */


  /* ------- Begin Available HTML Elements ------- */


  // Placeholder variables for image size
  var $imgWidth = 0,
      $imgHeight = 0;

  var skeletonBones = [
    // Only the head and body tags + title and meta
    '<!DOCTYPE html>\n<html lang="">\n<head>\n' + window.indentUnits +
    '<meta charset="UTF-8">\n' + window.indentUnits + '<title></title>\n' +
    '\n</head>\n\n<body>\n' + window.indentUnits + '\n</body>\n</html>\n',

    // External stylesheet
    '<link rel="stylesheet" href="">',

    // Inline stylesheet
    '<style></style>',

    // External script
    '<script src=""></script>',

    // Inline script
    '<script></script>',

    // Full HTML skeleton
    '<!DOCTYPE html>\n<html lang="">\n<head>\n' + window.indentUnits +
    '<meta charset="UTF-8">\n' + window.indentUnits + '<title></title>\n' +
    window.indentUnits + '<link rel="stylesheet" href="">' + '\n</head>\n\n<body>\n' +
    window.indentUnits + '<script src=""></script>\n</body>\n</html>\n'
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
                     "#extern-script-tag", "#inline-script-tag", "#full-skeleton"
                    ],

        // Shortcuts to the image size input boxes
        $imgWidthID = $("#img-width"),
        $imgHeightID = $("#img-height");

    // For each option that is checked, add the corresponding element
    // to `finalElements` for addition in document
    optionIDs.forEach(function (value, index) {
      if ($(value + ":checked").val() === "on") {
        finalElements.push(skeletonBones[index]);
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


  function _showSkeletonDialog() {
    /* Display the HTML Skeleton box */

    var localizedDialog = Mustache.render(skeletonDialogHtml, Strings);
    var skeletonDialog = Dialogs.showModalDialogUsingTemplate(localizedDialog),
        $doneButton = skeletonDialog.getElement().find('.dialog-button[data-button-id="ok"]');

    // Display logo using Bracket's own image viewer
    ImageViewer.render(skeletonLogo, $(".html-skeleton-image"));

    // The following trick is from http://css-tricks.com/snippets/jquery/get-an-images-native-width/
    // Create a new (offscreen) image
    $("#img-preview").bind("load", function() {
      var newImageForSizing = new Image();
      newImageForSizing.src = $("#img-preview").attr("src");

      // Now we can get accurate image demitions
      var imageWidth = newImageForSizing.width;
      var imageHeight = newImageForSizing.height;
      //console.log(imageWidth);
      //console.log(imageHeight);
    });

    //var verticalign = $(".html-skeleton-image").toArray();
    //console.log(verticalign);

      //$("#img-preview").css("width", vwide);
      //$("#img-preview").css("height", vtall);
   //});

    // Hide image stats
    $("#img-tip").remove();
    $("#img-scale").remove();

    // Upon closing the dialog, run function to gather and apply choices
    $doneButton.on("click", _getOptions);
  }


  /* ------- End HTML Skeleton Dialog Box ------- */


  /* ------- Begin Extension Initialization ------- */


  AppInit.appReady(function () {
    /* Load the extension after Brackets itself has finished loading */

    // Load extension CSS
    ExtensionUtils.loadStyleSheet(module, "css/style.css");

    // Create a menu item in the Edit menu
    CommandManager.register(Strings.INSERT_HTML_ELEMENTS, EXTENSION_ID, _showSkeletonDialog);
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuItem(EXTENSION_ID);

    // Create toolbar icon
    var $toolbarButton = $(toolbarButtonCode);
    $toolbarButton.appendTo("#main-toolbar > .buttons");
    $toolbarButton.attr("title", "HTML Skeleton");
    $toolbarButton.click(_showSkeletonDialog);
  });
});


/* ------- End Extension Initialization ------- */
