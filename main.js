/* jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50 */
/* global define, brackets, $, require, Mustache, Image */

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
      FileSystem         = brackets.getModule("filesystem/FileSystem"),
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
      EXTENSION_ID       = "le717.html-skeleton",

      // User's indent settings
      indentUnits        = "",

      // Localize the dialog box
      localizedDialog = Mustache.render(skeletonDialogHtml, Strings);


  /* ------- End Module Importing ------- */


  /* ------- Begin Reading Indentation Preference ------- */


  function _repeat(str, num) {
    /* Taken from http://stackoverflow.com/a/4550005 */
    return (new Array(num + 1)).join(str);
  }

  function _getIndentSize() {
    /* Get the user's indentation settings for inserted code */

    var newIndentUnits, indentUnitsInt,
        tabCharPref = PreferencesManager.get("useTabChar", PreferencesManager.CURRENT_PROJECT);

    // The user is using tabs
    if (tabCharPref) {
      indentUnitsInt = PreferencesManager.get("tabSize");
      newIndentUnits = _repeat("\u0009", indentUnitsInt);

      // The user is using spaces
    } else {
      indentUnitsInt = PreferencesManager.get("spaceUnits");
      newIndentUnits = _repeat("\u0020", indentUnitsInt);
    }
    return newIndentUnits;
  }

  // Get user's indentation settings
  PreferencesManager.on("change", function (e, data) {
    data.ids.forEach(function (value) {

      // A relevant preference was changed, update our settings
      // FUTURE Keep an eye out for `softTabs` in Sprint 38
      if (value === "useTabChar" || value === "tabSize" || value === "spaceUnits") {
        // Do NOT attempt to assign `indentUnits` directly to the function.
        // It will completely break otherwise.
        var temp = _getIndentSize();
        indentUnits = temp;
      }
    });
  });


  /* ------- End Reading Indentation Preference ------- */


  /* ------- Begin Available HTML Elements ------- */


  // Placeholder variables for image size
  var $imgWidth = 0,
      $imgHeight = 0;

  var skeletonBones = [
    // Only the head and body tags + title and meta
    '<!DOCTYPE html>\n<html lang="">\n<head>\nindent-size<meta charset="UTF-8">\n' +
    'indent-size<title></title>\n\n</head>\n\n<body>\nindent-size\n</body>\n</html>\n',

    // External stylesheet
    '<link rel="stylesheet" href="">',

    // Inline stylesheet
    '<style></style>',

    // External script
    '<script src=""></script>',

    // Inline script
    '<script></script>',

    // Full HTML skeleton
    '<!DOCTYPE html>\n<html lang="">\n<head>\nindent-size<meta charset="UTF-8">\n' +
    'indent-size<title></title>\nindent-size<link rel="stylesheet" href="">' +
    '\n</head>\n\n<body>\nindent-size<script src=""></script>\n</body>\n</html>\n'
  ];

  // Image
  var imageCode = '<img src="src-url" alt="" width="size-x" height="size-y" />';


  /* ------- End Available HTML Elements ------- */


  /* ------- Begin HTML Element Adding ------- */

  function _insertAllTheCodes(finalElements) {
    /* Inter the selected elements into the document */

    // Get the last active editor
    var editor = EditorManager.getActiveEditor();
    if (editor) {
      // Get the cursor position
      var cursor = editor.getCursorPos();

      // Get the elements from the list in reverse so everything is added in the proper order
      finalElements.reverse().forEach(function (value) {
        //  Wrap the actions in a `batchOperation` call, per guidelines
        editor.document.batchOperation(function() {

          // Do a regex search for the `indent-size` keyword
          // and replace it with the user's indent settings
          value = value.replace(/indent-size/g, indentUnits);

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
        $imgWidthID = $(".html-skeleton #img-width"),
        $imgHeightID = $(".html-skeleton #img-height");

    // For each option that is checked, add the corresponding element
    // to `finalElements` for addition in document
    optionIDs.forEach(function (value, index) {
      if ($(".html-skeleton " + value + ":checked").val() === "on") {
        finalElements.push(skeletonBones[index]);
      }
    });

    // The picture/image box is checked
    if ($(".html-skeleton #img-tag:checked").val() === "on") {

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
      imageCodeNew = imageCode.replace(/src-url/, $(".html-skeleton-image span").text());
      imageCodeNew = imageCodeNew.replace(/size-x/, $imgWidth);
      imageCodeNew = imageCodeNew.replace(/size-y/, $imgHeight);
      finalElements.push(imageCodeNew);
    }

    // Finally, run process to add the selected elements
    _insertAllTheCodes(finalElements);
  }


  /* ------- End HTML Element Choices ------- */


  /* ------- Begin HTML Skeleton Dialog Boxes ------- */


  function _handleSkeletonButton() {
    /* Display dialog box */

    var skeletonDialog = Dialogs.showModalDialogUsingTemplate(localizedDialog),
        $dialog = skeletonDialog.getElement(),
        $doneButton = $('.dialog-button[data-button-id="ok"]', $dialog);

    // If the Browse button is clicked, proceed to open the browse dialog
    $('.dialog-button[data-button-id="browse"]', $dialog).on("click", function(e) {
      _showImageFileDialog(e);
    });

    // Display logo using Bracket's own image viewer
    // TODO I am not using any special features of ImageViewer like I thought I needed to,
    // so switch back to a "plain" img tag.
    // It would remove the need for the new Image() trick too.
    ImageViewer.render(skeletonLogo, $(".html-skeleton-image"));

    // Hide image stats
    $(".html-skeleton-image #img-tip").remove();
    $(".html-skeleton-image #img-scale").remove();

    // Upon closing the dialog, run function to gather and apply choices
    $doneButton.on("click", _getOptions);
  }

  function _showImageFileDialog(e) {
    /* Open the file browse dialog for the user to select an image */

    // Only display the image if the user selects ones
    FileSystem.showOpenDialog(false, false, "Choose an image", null, null,
      function (closedDialog, selectedFile) {
      if (!closedDialog && selectedFile && selectedFile.length > 0) {
        _displayImage(selectedFile[0]);
      }
    });
    e.preventDefault();
    e.stopPropagation();
  }


  /* ------- End HTML Skeleton Dialog Boxes ------- */


  /* ------- Begin user-selected image display ------- */


  function _displayImage(userImageFile) {
    /* Display the user selected image */
    // FIXME Handle the user selecting a non-image file
    // Perhaps detect MIME type?

    // Display the image
    $(".html-skeleton-image #img-preview").attr("src", userImageFile);

    /* The following trick is from http://css-tricks.com/snippets/jquery/get-an-images-native-width/ */

    // Create a new (offscreen) image
    $(".html-skeleton-image #img-preview").bind("load", function() {
      var newImageForSizing = new Image();
      newImageForSizing.src = $(".html-skeleton-image #img-preview").attr("src");

      // Now we can get accurate image dimensions
      var imageWidth = newImageForSizing.width,
          imageHeight = newImageForSizing.height;

      // If the image width and heights are not zero, update the size inputs with the values
      if (imageWidth !== 0) {
        $("#img-width").val(imageWidth);
      }
      if (imageHeight !== 0) {
        $("#img-height").val(imageHeight);
      }

      // Position the container
      $(".html-skeleton-image").css("position", "relative");

      // Add a small shadow to the image container
      $(".html-skeleton-image #img-preview").css("box-shadow","0px 1px 6px black");

      // Make the image path relative (if possible)
      userImageFile = ProjectManager.makeProjectRelativeIfPossible(userImageFile);

      // If the path is longer than 50 characters, split it up for better displaying
      if (userImageFile.length > 50) {
        userImageFile = userImageFile.substring(0, 51) + "<br>" + userImageFile.substring(50, userImageFile.length);
      }

      // Show the file path
      $(".html-skeleton-image span").html(userImageFile);
    });
  }


  /* ------- End user-selected image display ------- */


  /* ------- Begin Extension Initialization ------- */


  AppInit.appReady(function () {
    /* Load the extension after Brackets itself has finished loading */

    // Load extension CSS
    ExtensionUtils.loadStyleSheet(module, "css/style.css");

    // Create a menu item in the Edit menu
    CommandManager.register(Strings.INSERT_HTML_ELEMENTS, EXTENSION_ID, _handleSkeletonButton);
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuItem(EXTENSION_ID);

    // Create toolbar icon
    var $toolbarButton = $(toolbarButtonCode);
    $toolbarButton.appendTo("#main-toolbar > .buttons");
    $toolbarButton.attr("title", Strings.DIALOG_TITLE);
    $toolbarButton.click(_handleSkeletonButton);
  });
});


/* ------- End Extension Initialization ------- */
