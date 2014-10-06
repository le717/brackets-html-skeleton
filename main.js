/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50 */
/*global define, brackets, Mustache, $ */

/*
 * HTML Skeleton
 * Created 2014 Triangle717
 * <http://le717.github.io/>
 *
 * Licensed under The MIT License
 * <http://opensource.org/licenses/MIT/>
 */


define(function (require, exports, module) {
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
      SvgSize            = require("src/SvgSize"),
      Strings            = require("strings"),
      skeletonLogo       = require.toUrl("img/HTML-Skeleton.svg"),
      skeletonDialogHTML = require("text!htmlContent/mainDialog.html"),
      toolbarButtonHTML  = require("text!htmlContent/toolbarButton.html");

  var indentUnits     = "",
      localizedDialog = Mustache.render(skeletonDialogHTML, Strings),
      localizedButton = Mustache.render(toolbarButtonHTML, Strings);

  var skeletonBones = [
      // Only the head and body tags + title and meta
      "<!DOCTYPE html>\n<html lang=''>\n<head>\nindent-size<meta charset='UTF-8'>\n" +
        "indent-size<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
        "indent-size<title></title>\n</head>\n\n<body>\nindent-size\n</body>\n</html>\n",

      // External stylesheet
      "<link rel='stylesheet' href=''>",

      // Inline stylesheet
      "<style></style>",

      // External (and edited to be inline) script
      "<script src=''></script>",

      // Full HTML skeleton
      "<!DOCTYPE html>\n<html lang=''>\n<head>\nindent-size<meta charset='UTF-8'>\n" +
        "indent-size<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
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
  function _repeatString(str, num) {
    return (new Array(num + 1)).join(str);
  }


  /**
   * @private
   * Get the current indentation settings for use in inserted code
   * @return {string} User's current indentation settings
   */
  function _getIndentSize() {
    // Check the current project's preference on tabs and
    // update the indentation settings for either tabs for spaces
    return (PreferencesManager.get("useTabChar", PreferencesManager.CURRENT_PROJECT) ?
            _repeatString("\u0009", PreferencesManager.get("tabSize")) :
            _repeatString("\u0020", PreferencesManager.get("spaceUnits")));
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
  function _insertSelectedElements(elements) {
    // Get the document in the full editor
    var editor = EditorManager.getCurrentFullEditor();

    if (editor) {
      // Get the elements from the list in reverse so everything is added in the proper order
      var cursor = editor.getCursorPos();
      elements.reverse().forEach(function (value, index) {
        editor.document.batchOperation(function () {
          // Do a regex search for the `indent-size` keyword
          // and replace it with the user's indent settings
          // Also replace all single quotes with double quotes
          value = value.replace(/indent-size/g, indentUnits)
                       .replace(/'/g, "\"");

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
  function _getSelectedElements() {
    var $imgWidthInput   = $(".html-skeleton-form .img-width"),
        $imgHeightInput  = $(".html-skeleton-form .img-height"),
        finalElements    = [],
        optionIDs        = [
          "#head-body", "#extern-style-tag", "#inline-style-tag",
          "#extern-script-tag", "#inline-script-tag", "#full-skeleton"
      ];

    // For each option that is checked, add the corresponding element
    // to `finalElements` for addition in document
    optionIDs.forEach(function (value, index) {
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
      var $inputWidth  = $imgWidthInput.val(),
          $inputHeight = $imgHeightInput.val();

      // Get the width/height values from the input fields
      var imgWidth  = $inputWidth  !== "" ? $inputWidth : 0,
          imgHeight = $inputHeight !== "" ? $inputHeight : 0;

      // Mark the image tag for addition in document,
      // replacing the placeholder values with actual ones
      var imageCodeFill = imageCode.replace(/src-url/, $(".html-skeleton-img .img-src").text());
      imageCodeFill     = imageCodeFill.replace(/size-x/, imgWidth);
      imageCodeFill     = imageCodeFill.replace(/size-y/, imgHeight);
      finalElements.push(imageCodeFill);
    }

    // Finally, add the selected elements to the document
    _insertSelectedElements(finalElements);
  }


  /**
   * @private
   * Create a usable, valid path to the user's selected image
   * relative to document into which it being inserted
   * @param {string} imageDir The full path to a user-selected image
   * @return {string} A usable, valid path to the image
   */
  function _createImageURL(imageDir) {
    // Get the directory to the file the image is being inserted into
    // and just the file name of the image
    var curFileDir  = EditorManager.getCurrentFullEditor().document.file.parentPath,
        imgFileName = FileUtils.getBaseName(imageDir);

    // If this is a saved documentand image and document are in the same folder
    if (!/^_brackets_/.test(curFileDir) && (curFileDir.toLowerCase() === imageDir.replace(imgFileName, "").toLowerCase())) {
      // Use only the image file name
      imageDir = imgFileName;
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
   * Check if the dark theme is enabled and return
   * the appropriate class name for a slight shadow
   * on the image preview
   * @return {string} Appropriate shadow class name
   */
  function _getImageShadow() {
    return $("body").hasClass("dark") ? "html-skeleton-img-shadow-dark" : "html-skeleton-img-shadow";
  }


  /**
   * @private
   * Update image width/height input fields
   * @param imageWidth
   * @param imageHeight
   */
  function _updateSizeInput(imageWidth, imageHeight) {
    var $imgWidthInput  = $(".html-skeleton-form .img-width"),
        $imgHeightInput = $(".html-skeleton-form .img-height");

    $imgWidthInput.val(imageWidth);
    $imgHeightInput.val(imageHeight);
    return;
  }


  /**
   * @private
   * Display the user selected image
   * @param imagePath
   */
  function _displayImage(imagePath) {
    var shortImagePath  = "",
        isSvgImage      = false,
        isSupported     = false,
        $imgCheckBox    = $(".html-skeleton #img-tag"),
        $imgPreview     = $(".html-skeleton-img .image-preview"),
        $imgErrorText   = $(".html-skeleton-img .img-error-text"),
        $imgPathDisplay = $(".html-skeleton-img .img-src");

    // Check if the image is supported and if it is an SVG image
    isSupported = LanguageManager.getLanguageForPath(imagePath).getId() === "image";
    isSvgImage  = FileUtils.getFileExtension(imagePath) === "svg" ? true : false;

    // The Image check box was not checked before now. Since the user has opened an image,
    // let's assume the user wants to use it and check the box for them.
    if (!$imgCheckBox.prop("checked")) {
      $imgCheckBox.prop("checked", true);
    }

    // Quickly remove the size constraints to get an accurate image size
    $imgPreview.removeClass("html-skeleton-img-container");

    // Trim the file path for nice displaying
    shortImagePath = _createImageURL(imagePath);

    // The image is an unsupported file type
    if (!isSupported && !isSvgImage) {

      // Update display for image and display extension logo
      $(".html-skeleton-img").css("position", "relative");
      $imgPreview.addClass("html-skeleton-img-container");
      $imgPathDisplay.css("color", "red");
      $imgPreview.removeClass(_getImageShadow());

      $imgPathDisplay.html(shortImagePath);
      $imgErrorText.html("<br>is not supported for previewing!");
      $imgPreview.attr("src", skeletonLogo);

      _updateSizeInput("", "");
      return false;

      // The image is a supported file type
    } else if (isSupported || isSvgImage) {

       // Clear possible CSS applied from previewing an unsupported image
      $imgErrorText.empty();
      $imgPathDisplay.css("color", "");

      // Position and add small shadow to container
      $(".html-skeleton-img").css("position", "relative");
      $imgPreview.addClass(_getImageShadow());

      // Show the file path and display the image
      $imgPathDisplay.html(shortImagePath);
      $imgPreview.attr("src", imagePath);
      $imgPreview.addClass("html-skeleton-img-container");
    }

    // Get the image width and height
    $imgPreview.one("load", function () {
      if (isSupported && !isSvgImage) {
        var imageWidth  = $imgPreview.prop("naturalWidth"),
            imageHeight = $imgPreview.prop("naturalHeight");
        _updateSizeInput(imageWidth, imageHeight);

        // Special routine for SVG graphics only
      } else if (isSvgImage) {
        SvgSize.getSVGSize(imagePath).then(function (sizes) {
          _updateSizeInput(sizes[0], sizes[1]);
        });
      }
    });
    return;
  }


  /**
   * @private
   * Open the file browse dialog for the user to select an image
   */
  function _showFileDialog(e) {
    FileSystem.showOpenDialog(
      false, false, Strings.FILE_DIALOG_TITLE,
      null, ImageFiles, function (closedDialog, selectedFile) {
        if (!closedDialog && selectedFile && selectedFile.length > 0) {
          _displayImage(selectedFile[0]);
        }
      }
    );
    e.preventDefault();
    e.stopPropagation();
  }


  /**
   * @private
   * Display HTML Skeleton dialog box
   */
  function _displaySkeletonDialog() {
    var skeletonDialog = Dialogs.showModalDialogUsingTemplate(localizedDialog),
        $dialog        = skeletonDialog.getElement(),
        $doneButton    = $(".dialog-button[data-button-id='ok']", $dialog);

    // Display logo (and any user images) using Brackets' ImageViewer
    new ImageViewer.ImageView(FileSystem.getFileForPath(skeletonLogo), $(".html-skeleton-img"));
    $(".html-skeleton-img .image-preview").addClass("html-skeleton-img-container");

    // Hide image stats
    $(".html-skeleton-img .image-tip").remove();
    $(".html-skeleton-img .image-scale").remove();

    // If the Browse button is clicked, proceed to open the browse dialog
    $(".dialog-button[data-button-id='browse']", $dialog).on("click", function (e) {
      _showFileDialog(e);
    });

    // Upon closing the dialog, run function to gather and apply choices
    $doneButton.on("click", _getSelectedElements);
  }


  /**
   * @private
   * Load the extension after Brackets itself has finished loading
   */
  AppInit.appReady(function () {
    // Define the extension ID and CSS
    var EXTENSION_ID = "le717.html-skeleton";
    ExtensionUtils.loadStyleSheet(module, "css/style.css");

    // Create a menu item in the Edit menu
    CommandManager.register(Strings.INSERT_HTML_ELEMENTS, EXTENSION_ID, _displaySkeletonDialog);
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuItem(EXTENSION_ID);

    // Create toolbar icon
    $(localizedButton).appendTo("#main-toolbar > .buttons")
                      .on("click", _displaySkeletonDialog);
  });
});
