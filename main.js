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
  var AppInit            = brackets.getModule("utils/AppInit"),
      CommandManager     = brackets.getModule("command/CommandManager"),
      Dialogs            = brackets.getModule("widgets/Dialogs"),
      EditorManager      = brackets.getModule("editor/EditorManager"),
      ExtensionUtils     = brackets.getModule("utils/ExtensionUtils"),
      FileSystem         = brackets.getModule("filesystem/FileSystem"),
      FileUtils          = brackets.getModule("file/FileUtils"),
      ImageViewer        = brackets.getModule("editor/ImageViewer"),
      LanguageManager    = brackets.getModule("language/LanguageManager"),
      Menus              = brackets.getModule("command/Menus"),
      PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
      ProjectManager     = brackets.getModule("project/ProjectManager"),

      Strings            = require("strings"),
      skeletonDialogHtml = require("text!htmlContent/mainDialog.html"),
      toolbarButtonCode  = '<a href="#" id="html-skeleton-toolbar">',

      // Grab the logo to display in the dialog
      skeletonLogo       = require.toUrl("img/HTML-Skeleton.svg"),
      EXTENSION_ID       = "le717.html-skeleton",

      // User's indent settings
      indentUnits        = "",

      // Localize the dialog box
      localizedDialog    = Mustache.render(skeletonDialogHtml, Strings),

      // Valid image files (as supported by Brackets)
      imageFiles         = LanguageManager.getLanguage("image")._fileExtensions.concat("svg");


  /* ------- End Module Importing ------- */


  /* ------- Begin Polyfills ------- */


  function _repeat(str, num) {
    /* Polyfill, taken from http://stackoverflow.com/a/4550005 */
    return (new Array(num + 1)).join(str);
  }


  /* ------- End Polyfills ------- */


  /* ------- Begin Reading Indentation Preference ------- */


  function _getIndentSize() {
    /* Get the user's indentation settings for inserted code */

    var newIndentUnits, indentUnitsInt,
        tabCharPref  = PreferencesManager.get("useTabChar", PreferencesManager.CURRENT_PROJECT);

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
    data.ids.forEach(function (value, index) {

      // A relevant preference was changed, update our settings
      if (value === "useTabChar" || value === "tabSize" || value === "spaceUnits") {
        // Do NOT attempt to assign `indentUnits` directly to the function.
        // It will completely break otherwise.
        var tempVar  = _getIndentSize();
        indentUnits  = tempVar;
      }
    });
  });


  /* ------- End Reading Indentation Preference ------- */


  /* ------- Begin Available HTML Elements ------- */


  // Placeholder variables for image size
  var $imgWidth  = 0,
      $imgHeight = 0;

  var skeletonBones = [
    // Only the head and body tags + title and meta
    '<!DOCTYPE html>\n<html lang="">\n<head>\nindent-size<meta charset="UTF-8">\n' +
    'indent-size<title></title>\n</head>\n\n<body>\nindent-size\n</body>\n</html>\n',

    // External stylesheet
    '<link rel="stylesheet" href="">',

    // Inline stylesheet
    '<style></style>',

    // External (and edited to be inline) script
    '<script src=""></script>',

    // Full HTML skeleton
    '<!DOCTYPE html>\n<html lang="">\n<head>\nindent-size<meta charset="UTF-8">\n' +
    'indent-size<title></title>\nindent-size<link rel="stylesheet" href="">\n' +
    '</head>\n\n<body>\nindent-size<script src=""></script>\n</body>\n</html>\n'
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
      finalElements.reverse().forEach(function (value, index) {
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
        optionIDs     = ["#head-body", "#extern-style-tag", "#inline-style-tag",
                         "#extern-script-tag", "#inline-script-tag", "#full-skeleton"
                        ],

        // Shortcuts to the image size input boxes
        $imgWidthID   = $(".html-skeleton #img-width"),
        $imgHeightID  = $(".html-skeleton #img-height");

    // For each option that is checked, add the corresponding element
    // to `finalElements` for addition in document
    optionIDs.forEach(function(value, index) {
      if ($(".html-skeleton " + value).prop("checked")) {

        // The inline script box was checked, reuse external script string
        if (index === 4) {
          finalElements.push(skeletonBones[3].replace(/ src="">/, ">"));

          // Because of the script element editing above, redirect the
          // Full HTML Skeleton option to the proper index
        } else if (index === 5) {
          finalElements.push(skeletonBones[4]);

        } else {
          // It was another element that does not require editing/redirecting
          finalElements.push(skeletonBones[index]);
        }
      }
    });

    // The picture/image box was checked
    if ($(".html-skeleton #img-tag").prop("checked")) {

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
      imageCodeNew = imageCode.replace(/src-url/, $(".html-skeleton-image #img-src").text());
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

    // Display logo (and any user images) using Brackets' ImageViewer
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
    FileSystem.showOpenDialog(false, false, Strings.FILE_DIALOG_TITLE, null, imageFiles,
    function (closedDialog, selectedFile) {
      if (!closedDialog && selectedFile && selectedFile.length > 0) {
        _handleImage(selectedFile[0]);
      }
    });
    e.preventDefault();
    e.stopPropagation();
  }


  /* ------- End HTML Skeleton Dialog Boxes ------- */


  /* ------- Begin user-selected image display ------- */


  function _imgPathUtils(imgPath) {
    /* Various image path utilities */

    // Make the image path relative (if possible)
    imgPath = ProjectManager.makeProjectRelativeIfPossible(imgPath);

    // If the path is longer than 50 characters, split it up for better displaying
    if (imgPath.length > 50) {
      imgPath = imgPath.substring(0, 51) + "<br>" + imgPath.substring(51, imgPath.length);
    }
    return imgPath;
  }

  function _handleImage(userImageFile) {
    /* Display the user selected image */

    // Assume the selected file is a valid image
    var imageWidth     = 0,
        imageHeight    = 0,
        supportedImage = true,
        $imgWidth      = $(".html-skeleton #img-width"),
        $imgHeight     = $(".html-skeleton #img-height"),
        $imgCheckBox   = $(".html-skeleton #img-tag"),
        $imgPreview    = $(".html-skeleton-image #img-preview"),
        $showImgPath   = $(".html-skeleton-image #img-src"),
        $imgErrorText  = $(".html-skeleton-image #img-error-text");

    if (brackets.platform !== "mac") {
      // Assume otherwise on other platforms as the file filter drop down is ignored but on Mac (https://trello.com/c/430aXkpq)
      supportedImage = false;

      // Go through the supported image list and check if the image is supported
      imageFiles.forEach(function(value, index) {
        if (FileUtils.getFileExtension(userImageFile) === value) {
          // Yes, the image is supported
          supportedImage = true;
        }
      });
    }

    // The Image check box was not checked before now. Since the user has opened an image,
    // let's assume the user wants to use it and check the box.
    if (!$imgCheckBox.prop("checked")) {
      $imgCheckBox.prop("checked", true);
    }

    // The image is not a supported file type
    if (!supportedImage) {
      // Reset the width and height fields
      $imgWidth.val("");
      $imgHeight.val("");

      // Run process to trim the path
      userImageFile = _imgPathUtils(userImageFile);

      // Update display for image
      $showImgPath.html("");
      $showImgPath.html(userImageFile);
      $imgErrorText.html("<br>is not supported for previewing!");
      $showImgPath.css("color", "red");
      $imgPreview.removeClass("html-skeleton-image-shadow");

      /* NOTE I figured out what is going on here.
       * When this block is run, ideally the extension logo is displayed
       * rather than the previous (if any) image.
       * However, what seems to be occurring (even if an unsupported image is loaded on first use)
       * is the `$imgPreview.bind("load")` detection in the supported image block
       * is detecting the load and thus treating it as a supported image.
       *
       * FIXME
       * Find a way to isolate the load detection to NOT detect this change.
       * This is pretty much all that is stopping v1.2.0 from being released
       */

      $imgPreview.attr("src", skeletonLogo);
      return false;

      // The image is a supported file type, move on
    } else {
      // Display the image using the full path
      $imgPreview.attr("src", userImageFile);

      // Clean possible CSS applied from previewing an invalid image
      $imgErrorText.html("");
      $showImgPath.css("color", "");

      // Position the container
      $(".html-skeleton-image").css("position", "relative");

      // Add a small shadow to the image container
      $imgPreview.addClass("html-skeleton-image-shadow");

      // Run process to trim the path
      userImageFile = _imgPathUtils(userImageFile);

      // Show the file path
      $showImgPath.html("");
      $showImgPath.html(userImageFile);

      // Get the image width and height
      $imgPreview.bind("load", function() {
        imageWidth  = $imgPreview[0].naturalWidth;
        imageHeight = $imgPreview[0].naturalHeight;

        // If the image width and heights are not zero, update the size inputs with the values
        if (imageWidth) {
          $imgWidth.val(imageWidth);
        }
        if (imageHeight) {
          $imgHeight.val(imageHeight);
        }
      });
      return true;
    }
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
    $toolbarButton.on("click", _handleSkeletonButton);
  });
});


/* ------- End Extension Initialization ------- */
