/* jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50 */

/*
 * HTML Skeleton
 * Created 2014 Triangle717
 * <http://Triangle717.WordPress.com/>
 *
 * Licensed under The MIT License
 * <http://opensource.org/licenses/MIT/>
 */


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
      ImageFiles         = LanguageManager.getLanguage("image")._fileExtensions.concat("svg"),
      SvgSize            = require("src/SvgSize"),
      Strings            = require("strings"),
      skeletonLogo       = require.toUrl("img/HTML-Skeleton.svg"),
      skeletonDialogHtml = require("text!htmlContent/mainDialog.html"),
      toolbarButtonCode  = "<a href='#' id='html-skeleton-toolbar'>";

      var EXTENSION_ID   = "le717.html-skeleton",
      indentUnits        = "",
      localizedDialog    = Mustache.render(skeletonDialogHtml, Strings);


  /* ------- Begin Polyfills ------- */

  /**
   * @private
   * Polyfill from http://stackoverflow.com/a/4550005
   * @param str // TODO Write me!!
   * @param num // TODO Write me!!
   * @return // TODO Write me!!
   */
  function _repeat(str, num) {
    return (new Array(num + 1)).join(str);
  }

  /* ------- End Polyfills ------- */


  /* ------- Begin Reading Indentation Preference ------- */

  /**
   * @private
   * Get the current indentation settings for use in inserted code
   * @return User's current indentation settings
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

  /* ------- End Reading Indentation Preference ------- */


  /* ------- Begin Available HTML Elements ------- */

  // Placeholder variables for image size
  var $imgWidth  = 0,
      $imgHeight = 0;

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

  /* ------- End Available HTML Elements ------- */


  /* ------- Begin HTML Element Adding ------- */

  /**
   * @private
   * Insert the selected elements into the document
   */
  function _insertAllTheCodes(finalElements) {
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
          // Also replace all single quotes with double quotes
          value = value.replace(/indent-size/g, indentUnits);
          value = value.replace(/'/g, "\"");

          // Insert the selected elements at the current cursor position
          editor.document.replaceRange(value, cursor);
        });
      });
    }
  }

  /* ------- End HTML Element Adding ------- */


  /* ------- Begin HTML Element Choices ------- */

  /**
   * @private
   * Get element choices
   */
  function _getOptions() {
    var imageCodeNew,
        finalElements = [],
        optionIDs     = ["#head-body", "#extern-style-tag", "#inline-style-tag",
                         "#extern-script-tag", "#inline-script-tag", "#full-skeleton"
                        ],
        $imgWidthID   = $(".html-skeleton #img-width"),
        $imgHeightID  = $(".html-skeleton #img-height");

    // For each option that is checked, add the corresponding element
    // to `finalElements` for addition in document
    optionIDs.forEach(function(value, index) {
      if ($(".html-skeleton " + value).prop("checked")) {

        // The inline script box was checked, reuse external script string
        if (index === 4) {
          finalElements.push(skeletonBones[3].replace(/\ssrc="">/, ">"));

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
      var $inputWidth  = $imgWidthID.val(),
          $inputHeight = $imgHeightID.val();

      // The values could not be picked out,
      // Use 0 instead
      switch ($inputWidth) {
        case "":
          $imgWidth = 0;
          break;
        // The width box was filled out, use that value
        default:
          $imgWidth = $inputWidth;
      }

      // The values could not be picked out,
      // Use 0 instead
      switch ($inputHeight) {
        case "":
          $imgHeight = 0;
          break;
        // The height box was filled out, use that value
        default:
          $imgHeight = $inputHeight;
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

  /**
   * @private
   * Display dialog box
   */
  function _handleSkeletonButton() {
    var skeletonDialog = Dialogs.showModalDialogUsingTemplate(localizedDialog),
        $dialog = skeletonDialog.getElement(),
        $doneButton = $(".dialog-button[data-button-id='ok']", $dialog);

    // If the Browse button is clicked, proceed to open the browse dialog
    $(".dialog-button[data-button-id='browse']", $dialog).on("click", function(e) {
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

  /**
   * @private
   * Open the file browse dialog for the user to select an image
   */
  function _showImageFileDialog(e) {
    // Only display the image if the user selects ones
    FileSystem.showOpenDialog(false, false, Strings.FILE_DIALOG_TITLE, null, ImageFiles,
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

  /**
   * @private
   * Various image path utilities
   */
  function _imgPathUtils(imgPath) {
    // Make the image path relative (if possible)
    imgPath = ProjectManager.makeProjectRelativeIfPossible(imgPath);

    // If the path is longer than 50 characters, split it up for better displaying
    if (imgPath.length > 50) {
      imgPath = imgPath.substring(0, 51) + "<br>" + imgPath.substring(51, imgPath.length);
    }
    return imgPath;
  }

  /**
   * @private
   * Display the user selected image
   */
  function _handleImage(imagePath) {
    var imageWidth     = 0,
        imageHeight    = 0,
        svgWidth       = 0,
        svgHeight      = 0,
        shortImagePath = "",
        isSvgImage     = false,
        supportedImage = true,
        $imgWidth      = $(".html-skeleton #img-width"),
        $imgHeight     = $(".html-skeleton #img-height"),
        $imgPreview    = $(".html-skeleton-image #img-preview"),
        $showImgPath   = $(".html-skeleton-image #img-src"),
        $imgCheckBox   = $(".html-skeleton #img-tag"),
        $imgErrorText  = $(".html-skeleton-image #img-error-text");

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
      shortImagePath = _imgPathUtils(imagePath);

      // Update display for image
      $showImgPath.html(shortImagePath);
      $imgErrorText.html("<br>is not supported for previewing!");
      $showImgPath.css("color", "red");
      $imgPreview.removeClass("html-skeleton-image-shadow");

      // Display extension logo
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
      shortImagePath = _imgPathUtils(imagePath);

      // Show the file path
      $showImgPath.html(shortImagePath);

      // Get the image width and height
      $imgPreview.bind("load", function() {
        imageWidth  = $imgPreview.prop("naturalWidth");
        imageHeight = $imgPreview.prop("naturalHeight");

        // Rigoursly extract the SVG width and heights
//       if (isSvgImage && imageWidth === 270 && imageHeight === 240) {
//         var detectSizes = SvgSize.detectSVGSize(imagePath);
//         svgWidth  = detectSizes[0];
//         svgHeight = detectSizes[1];
//         $imgWidth.val(svgWidth);
//         $imgHeight.val(svgHeight);
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

  /* ------- End user-selected image display ------- */

  /**
   * @private
   * Load the extension after Brackets itself has finished loading
   */
  AppInit.appReady(function() {
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
