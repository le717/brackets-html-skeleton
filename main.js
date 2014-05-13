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
      LanguageManager    = brackets.getModule("language/LanguageManager"),
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
      localizedDialog    = Mustache.render(skeletonDialogHtml, Strings),

      // Valid image files (as supported by Brackets)
      imageFiles         = LanguageManager.getLanguage("image")._fileExtensions.concat("svg");


  /* ------- End Module Importing ------- */


  /* ------- Begin Polyfills ------- */


  function _repeat(str, num) {
    /* Polyfill, taken from http://stackoverflow.com/a/4550005 */
    return (new Array(num + 1)).join(str);
  }

  function endsWith(str, suffix) {
    /* Polyfill, taken from http://stackoverflow.com/a/2548133 */
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }


  /* ------- End Polyfills ------- */


  /* ------- Begin Reading Indentation Preference ------- */


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
    data.ids.forEach(function (value, index) {

      // A relevant preference was changed, update our settings
      if (value === "useTabChar" || value === "tabSize" || value === "spaceUnits") {
        // Do NOT attempt to assign `indentUnits` directly to the function.
        // It will completely break otherwise.
        var tempVar = _getIndentSize();
        indentUnits = tempVar;
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
        optionIDs = ["#head-body", "#extern-style-tag", "#inline-style-tag",
                     "#extern-script-tag", "#inline-script-tag", "#full-skeleton"
                    ],

        // Shortcuts to the image size input boxes
        $imgWidthID = $(".html-skeleton #img-width"),
        $imgHeightID = $(".html-skeleton #img-height");

    // For each option that is checked, add the corresponding element
    // to `finalElements` for addition in document
    optionIDs.forEach(function (value, index) {
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
    FileSystem.showOpenDialog(false, false, "Choose an image", null, imageFiles,
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


  function _imgPathUtils(imgPath) {
    /* Various image path utilities */

    //console.log(imgPath);
    // Make the image path relative (if possible)
    imgPath = ProjectManager.makeProjectRelativeIfPossible(imgPath);

    // If the path is longer than 50 characters, split it up for better displaying
    if (imgPath.length > 50) {
      imgPath = imgPath.substring(0, 51) + "<br>" + imgPath.substring(51, imgPath.length);
    }

    //console.log(imgPath);
    return imgPath;
  }


  function _displayImage(userImageFile) {
    /* Display the user selected image */
    // FIXME Handle the user selecting a non-image file

    // Assume the selected file is a valid image
    var $imageWidth, $imageHeight,
        supportedImage = true,
        $imgPreview    = $(".html-skeleton-image #img-preview"),
        $showImgPath   = $(".html-skeleton-image #img-src"),
        $imgErrorText  = $(".html-skeleton-image #img-error-text"),
        $imgCheckBox   = $(".html-skeleton #img-tag");

    if (brackets.platform !== "mac") {
      // Assume otherwise on other platforms as the file filter drop down is ignored but on Mac (https://trello.com/c/430aXkpq)
      supportedImage = false;

      // Go through the supported image list and check if the image is supported
      imageFiles.forEach(function(value, index) {
        if (endsWith(userImageFile, value)) {
          // Yes, the image is supported
          supportedImage = true;
        }
      });
    }

    //console.log("supportedImage: " + supportedImage);

    // The Image check box was not checked before now. Since the user has opened an image,
    // let's assume the user wants to use it and check the box.
    if (!$imgCheckBox.prop("checked")) {
      $imgCheckBox.prop("checked", true);
    }

    // The image is not a supported file type
    if (!supportedImage) {

      //console.log(userImageFile);

      // Run process to trim the path
      userImageFile = _imgPathUtils(userImageFile);

      $showImgPath.html("");
      $showImgPath.html(userImageFile);
      $imgErrorText.html("<br>is not supported for previewing!");
      $showImgPath.css("color", "red");
      $imgPreview.css("box-shadow", "");
      // FIXME Reload the extension logo
      //$imgPreview.attr("src", skeletonLogo);
      $imgPreview.attr("src", "");

      //console.log(userImageFile);
      return false;

      // The image is a supported file type, move on
    } else {

      // Display the image using the full path
      $imgPreview.attr("src", userImageFile);

      // Clean possible CSS applied from previewing an invalid image
      $imgErrorText.html("");
      $showImgPath.css("color", "");

      // Get the image width and height
      $imgPreview.bind("load", function() {
        $imageWidth  = $imgPreview[0].naturalWidth;
        $imageHeight = $imgPreview[0].naturalHeight;
      });

      // If the image width and heights are not zero, update the size inputs with the values
      if ($imageWidth !== 0) {
        $("#img-width").val($imageWidth);
      }

      if ($imageHeight !== 0) {
        $("#img-height").val($imageHeight);
      }

      // Position the container
      $(".html-skeleton-image").css("position", "relative");

      // Add a small shadow to the image container
      $imgPreview.css("box-shadow", "0px 1px 6px black");

      // Run process to trim the path
      userImageFile = _imgPathUtils(userImageFile);

      // Show the file path
      $showImgPath.html("");
      $showImgPath.html(userImageFile);
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
    $toolbarButton.click(_handleSkeletonButton);
  });
});


/* ------- End Extension Initialization ------- */
