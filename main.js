/* jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50 */

/*
 * HTML Skeleton
 * Created 2014 Triangle717
 * <http://Triangle717.WordPress.com/>
 *
 * Licensed under The MIT License
 * <http://opensource.org/licenses/MIT/>
 */


define(function(require, exports, module) {
  "use strict";

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
      ImageFiles         = LanguageManager.getLanguage("image")._fileExtensions.concat("svg"),
      // SvgSize            = require("src/SvgSize"),
      Strings            = require("strings"),
      skeletonLogo       = require.toUrl("img/HTML-Skeleton.svg"),
      skeletonDialogHtml = require("text!htmlContent/mainDialog.html"),
      toolbarButtonCode  = "<a href='#' title='{{DIALOG_TITLE}}' id='html-skeleton-toolbar'>";

  var indentUnits     = "",
      localizedDialog = Mustache.render(skeletonDialogHtml, Strings);

  var skeletonBones = [
    // Only the head and body tags + title and meta
    "<!DOCTYPE html>\n<html lang=''>\n<head>\nindent-size<meta charset='UTF-8'>\n" +
    "indent-size<title></title>\n</head>\n\n<body>\nindent-size\n</body>\n</html>\n",

    // External stylesheet
    "<link rel='stylesheet' href=''>",

    // Inline stylesheet
    "<style></style>",

    // External (and edited to be inline) script
    "<script src=''></script>",

    // Full HTML skeleton
    "<!DOCTYPE html>\n<html lang=''>\n<head>\nindent-size<meta charset='UTF-8'>\n" +
    "indent-size<title></title>\nindent-size<link rel='stylesheet' href=''>\n" +
    "</head>\n\n<body>\nindent-size<script src=''></script>\n</body>\n</html>\n"
  ];

  // Image
  var imageCode = "<img src='src-url' alt='' width='size-x' height='size-y'>";


  /**
   * @private
   * Polyfill from http://stackoverflow.com/a/4550005
   * @param str Text to be repeated.
   * @param num Number of times text should be repeated.
   * @return {string} repeated the number of times stated.
   */
  function _repeat(str, num) {
    return (new Array(num + 1)).join(str);
  }


  /**
   * @private
   * Get the current indentation settings for use in inserted code
   * @return {string} User's current indentation settings
   */
  function _getIndentSize() {
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


  /**
   * @private
   * Insert the selected elements into the document
   * @param elements The elements to be inserted into the document
   */
  function _insertAllTheCodes(elements) {
    // Get the document in the full editor
    var editor = EditorManager.getCurrentFullEditor();

    if (editor) {
      // Get the elements from the list in reverse so everything is added in the proper order
      var cursor = editor.getCursorPos();
      elements.reverse().forEach(function (value, index) {
        //  Wrap the actions in a `batchOperation` call, per guidelines
        editor.document.batchOperation(function() {

          // Do a regex search for the `indent-size` keyword
          // and replace it with the user's indent settings
          // Also replace all single quotes with double quotes
          value = value.replace(/indent-size/g, indentUnits)
                       .replace(/'/g, "\"");
//          value = value.replace(/'/g, "\"");

          // Insert the selected elements at the current cursor position
          editor.document.replaceRange(value, cursor);
        });
      });
    }
  }


  /**
   * @private
   * Get element choices
   */
  function _getOptions() {
    var imageCodeNew,
        imgWidth      = 0,
        imgHeight     = 0,
        $imgWidthID   = $(".html-skeleton .image-width"),
        $imgHeightID  = $(".html-skeleton .image-height"),
        finalElements = [],
        optionIDs     = [
          "#head-body", "#extern-style-tag", "#inline-style-tag",
          "#extern-script-tag", "#inline-script-tag", "#full-skeleton"
        ];

    // For each option that is checked, add the corresponding element
    // to `finalElements` for addition in document
    optionIDs.forEach(function(value, index) {
      if ($(".html-skeleton " + value).prop("checked")) {

        // The inline script box was checked, reuse external script string
        if (index === 4) {
          finalElements.push(skeletonBones[index - 1].replace(/\ssrc="">/, ">"));

          // Because of the script element editing above, redirect the
          // Full HTML Skeleton option to the proper index
        } else if (index === 5) {
          finalElements.push(skeletonBones[index - 1]);

        } else {
          // It was another element that does not require editing/redirecting
          finalElements.push(skeletonBones[index]);
        }
      }
    });

    // The picture/image box was checked
    if ($(".html-skeleton #img-tag").prop("checked")) {
      var $inputWidth  = $imgWidthID.val(),
          $inputHeight = $imgHeightID.val();

      // The values could not be picked out,
      // Use 0 instead
      switch ($inputWidth) {
        case "":
          imgWidth = 0;
          break;
        // The width box was filled out, use that value
        default:
          imgWidth = $inputWidth;
      }

      // The values could not be picked out,
      // Use 0 instead
      switch ($inputHeight) {
        case "":
          imgHeight = 0;
          break;
        // The height box was filled out, use that value
        default:
          imgHeight = $inputHeight;
      }

      // Add the image tag to `finalElements` for addition in document,
      // replacing the invalid values with valid ones
      imageCodeNew = imageCode.replace(/src-url/, $(".html-skeleton-image .image-src").text());
      imageCodeNew = imageCodeNew.replace(/size-x/, imgWidth);
      imageCodeNew = imageCodeNew.replace(/size-y/, imgHeight);
      finalElements.push(imageCodeNew);
    }

    // Finally, run process to add the selected elements
    _insertAllTheCodes(finalElements);
  }


  /**
   * @private
   * Open the file browse dialog for the user to select an image
   */
  function _showImageFileDialog(e) {
    // Only display the image if the user selects ones
    FileSystem.showOpenDialog(
      false, false, Strings.FILE_DIALOG_TITLE,
      null, ImageFiles, function (closedDialog, selectedFile) {
        if (!closedDialog && selectedFile && selectedFile.length > 0) {
          _handleImage(selectedFile[0]);
        }
      });
    e.preventDefault();
    e.stopPropagation();
  }


  /**
   * @private
   * Display dialog box
   */
  function _handleSkeletonButton() {
    var skeletonDialog = Dialogs.showModalDialogUsingTemplate(localizedDialog),
        $dialog        = skeletonDialog.getElement(),
        $doneButton    = $(".dialog-button[data-button-id='ok']", $dialog);

    // If the Browse button is clicked, proceed to open the browse dialog
    $(".dialog-button[data-button-id='browse']", $dialog).on("click", function(e) {
      _showImageFileDialog(e);
    });

    // Display logo (and any user images) using Brackets' ImageViewer
    new ImageViewer.ImageView(FileSystem.getFileForPath(skeletonLogo), $(".html-skeleton-image"));
    $(".html-skeleton-image .image-path").html("");

    // Hide image stats
    $(".html-skeleton-image .image-tip").remove();
    $(".html-skeleton-image .image-scale").remove();

    // Upon closing the dialog, run function to gather and apply choices
    $doneButton.on("click", _getOptions);
  }


  /**
   * @private
   * Create a usable, valid path the user's selected image relative to document into which it being inserted
   * @param {string} imageDir The full path to a user-selected image
   * @return {string} A usable, valid path to the image
   */
  function _createImageURL(imageDir) {
    // Get the directory to the file the image is being inserted into
    // and just the file name of the image
    var curFileDir  = EditorManager.getCurrentFullEditor().document.file.parentPath,
        imgFileName = FileUtils.getBaseName(imageDir);

    // Make sure this is a saved document
    if (!/_brackets_/.test(curFileDir)) {
      // If the document and image are in the same folder,
      // use only the image file name
      if (curFileDir.toLowerCase() === imageDir.replace(imgFileName, "").toLowerCase()) {
        imageDir = imgFileName;
      }
    }

    // Try to make the path as relative as possible
    imageDir = ProjectManager.makeProjectRelativeIfPossible(imageDir);

    // If the path is longer than 50 characters, split it up for better displaying
    if (imageDir.length > 50) {
      imageDir = imageDir.substring(0, 51) + "<br>" + imageDir.substring(51, imageDir.length);
    }
    return imageDir;
  }


  /**
   * @private
   * Display the user selected image
   */
  function _handleImage(imagePath) {
    var imageWidth     = 0,
        imageHeight    = 0,
        shortImagePath = "",
        isSvgImage     = false,
        supportedImage = true,
        $imgWidth      = $(".html-skeleton .image-width"),
        $imgHeight     = $(".html-skeleton .image-height"),
        $imgCheckBox   = $(".html-skeleton #img-tag"),
        $imgPreview    = $(".html-skeleton-image .image-preview"),
        $showImgPath   = $(".html-skeleton-image .image-src"),
        $imgErrorText  = $(".html-skeleton-image .image-error-text");

    if (brackets.platform !== "mac") {
      // Assume otherwise on other platforms as the file filter drop down
      // is ignored except on Mac (https://trello.com/c/430aXkpq)
      supportedImage = false;

      // Go through the supported image list and check if the image is supported
      ImageFiles.forEach(function(value, index) {
        if (FileUtils.getFileExtension(imagePath) === value) {
          // Yes, the image is supported
          supportedImage = true;

          // Check also if it is an SVG image
          isSvgImage = value === "svg" ? true : false;
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
      shortImagePath = _createImageURL(imagePath);

      // Update display for image and display extension logo
      $showImgPath.html(shortImagePath);
      $imgErrorText.html("<br>is not supported for previewing!");
      $showImgPath.css("color", "red");
      $imgPreview.removeClass("html-skeleton-image-shadow");
      $imgPreview.attr("src", skeletonLogo);
      return false;

      // The image is a supported file type, move on
    } else {
      // Display the image using the full path
      $imgPreview.attr("src", imagePath);

      // Clean possible CSS applied from previewing an invalid image
      $imgErrorText.html("");
      $showImgPath.css("color", "");

      // Position and add small shadow to container
      $(".html-skeleton-image").css("position", "relative");
      $imgPreview.addClass("html-skeleton-image-shadow");

      // Run process to trim the path
      shortImagePath = _createImageURL(imagePath);

      // Show the file path
      $showImgPath.html(shortImagePath);

      // Get the image width and height
      $imgPreview.bind("load", function() {
        imageWidth  = $imgPreview.prop("naturalWidth");
        imageHeight = $imgPreview.prop("naturalHeight");

        // Rigorously extract the SVG width and heights
//       if (isSvgImage && imageWidth === 270 && imageHeight === 240) {
//         var detectSizes = SvgSize.detectSVGSize(imagePath);
//         detectSizes.then(function(sizes) {
//           console.log(sizes);
//           if (!Number.isNaN(sizes[0]) && !Number.isNaN(sizes[1])) {
//             $imgWidth.val(sizes[0]);
//             $imgHeight.val(sizes[1]);
//           }
//         });
//         return true;
//      }

        // If the image width and heights are not zero,
        // update the size inputs with the values
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


  /**
   * @private
   * Load the extension after Brackets itself has finished loading
   */
  AppInit.appReady(function() {
    // Define the extension ID and CSS
    var EXTENSION_ID = "le717.html-skeleton";
    ExtensionUtils.loadStyleSheet(module, "css/style.css");

    // Create a menu item in the Edit menu
    CommandManager.register(Strings.INSERT_HTML_ELEMENTS, EXTENSION_ID, _handleSkeletonButton);
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuItem(EXTENSION_ID);

    // Create toolbar icon
//    var renderedToolbarButton = Mustache.render(toolbarButtonCode, Strings);
//    $(renderedToolbarButton).appendTo("#main-toolbar > .buttons")
    $(Mustache.render(toolbarButtonCode, Strings)).appendTo("#main-toolbar > .buttons")
                            .on("click", _handleSkeletonButton);
  });
});
