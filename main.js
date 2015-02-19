/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50 */
/*global $, define, brackets, Mustache */

/*
 * HTML Skeleton
 * Created 2014-2015 Triangle717
 * <http://le717.github.io/>
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
      Strings            = require("strings"),
      SvgSize            = require("src/SvgSize"),
      IndentSize         = require("src/IndentSize"),
      skeletonLogo       = require.toUrl("img/HTML-Skeleton.svg"),
      toolbarButtonHTML  = require("text!htmlContent/toolbarButton.html"),
      skeletonDialogHTML = require("text!htmlContent/mainDialog.html");

  var indentUnits     = "",
      finalImages     = [],
      localizedDialog = Mustache.render(skeletonDialogHTML, Strings),
      localizedButton = Mustache.render(toolbarButtonHTML, Strings);

  // HTML snippets roster
  var skeletonBones = {
    image    : "<img alt='' width='size-x' height='size-y' src='src-url'>",
    inStyle  : "<style></style>",
    inScript : "<script></script>",
    extStyle : "<link rel='stylesheet' href=''>",
    viewport : "<meta name='viewport' content='width=device-width, initial-scale=1.0'>",
    extScript: "<script src=''></script>",

    basiSkel : "<!DOCTYPE html>\n<html lang=''>\n<head>\nindent-size<meta charset='UTF-8'>\n" +
    "indent-size<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
    "indent-size<title></title>\n</head>\n\n<body>\nindent-size\n</body>\n</html>\n",

    fullSkel : "<!DOCTYPE html>\n<html lang=''>\n<head>\nindent-size<meta charset='UTF-8'>\n" +
    "indent-size<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n" +
    "indent-size<title></title>\nindent-size<link rel='stylesheet' href=''>\n" +
    "</head>\n\n<body>\nindent-size<script src=''></script>\n</body>\n</html>\n"
  };


  // Get user's indentation settings
  // If the user ever changes their preferences,
  // we need to make sure we stay up-to-date
  PreferencesManager.on("change", function() {

    // Do NOT attempt to assign `indentUnits` directly to the function.
    // It will completely break otherwise
    var tempVar = IndentSize.getIndentation();
    indentUnits = tempVar;
  });


  /**
   * @private
   * Insert the selected elements into the document.
   * @param elements The elements to be inserted into the document.
   * @returns {Boolean} Always true.
   */
  function _insertSelectedElements(elements) {
    // Get the document in the full editor
    var editor = EditorManager.getCurrentFullEditor();

    if (editor) {
      // Get the elements from the list in reverse so everything is added in the proper order
      var cursor = editor.getCursorPos();

      elements.reverse().forEach(function(value) {
        editor.document.batchOperation(function() {
          // Do a regex search for the `indent-size` keyword
          // and replace it with the user's indent settings
          // Also replace all single quotes with double quotes
          value = value.replace(/indent-size/g, indentUnits).replace(/'/g, "\"");

          // Insert the selected elements at the current cursor position
          editor.document.replaceRange(value, cursor);
        });
      });
    }
    return true;
  }


  /**
   * @private
   * Get skeleton choices.
   */
  function _getSelectedElements() {
    var selections = [],
        optionIDs  = ["#basic-skeleton", "#viewport", "#ext-style",
                      "#in-style", "#ext-script", "#in-script", "#full-skeleton"
                     ];

    // For each option that is checked, keep track of the corresponding element
    optionIDs.forEach(function(value) {
      if (document.querySelector(".html-skeleton-form " + value).checked) {
        selections.push(skeletonBones[document.querySelector(".html-skeleton-form " + value).value]);
      }
    });

    // The picture/image box was checked
    if (document.querySelector(".html-skeleton-form #img").checked) {
      var widthInput  = document.querySelector(".html-skeleton-form .img-width").value,
          heightInput = document.querySelector(".html-skeleton-form .img-height").value;

      // Only one image was selected
      if (finalImages.length === 1) {
        var singleImage = finalImages[0];

        // Use input field values if they are different than extracted
        if (widthInput !== singleImage.width) {
          singleImage.width = widthInput;
        }

        if (heightInput !== singleImage.height) {
          singleImage.height = heightInput;
        }
      }

      // Replace placeholder values with actual ones
      finalImages.forEach(function(v) {
        var imgComplete = skeletonBones.image;
        imgComplete     = imgComplete.replace(/src-url/, v.relPath);
        imgComplete     = imgComplete.replace(/size-x/, v.width);
        imgComplete     = imgComplete.replace(/size-y/, v.height);
        selections.push(imgComplete);
      });
    }

    // Finally, add the selected elements to the document
    _insertSelectedElements(selections);
  }


  /**
   * @private
   * Create a usable, valid path to the user's selected image
   * relative to document into which it being inserted.
   * @param {string} image The full path to a user-selected image.
   * @param {boolean} [uiDisplay=false] If true, perform additional changes suitable for UI display.
   * @return {string} A usable, valid path to the image.
   */
  function _createImageURL(image, uiDisplay) {
    if (uiDisplay === undefined) {
      uiDisplay = false;
    }

    // Get the directory to the file the image is being inserted into
    // and just the file name of the image
    var curDir   = EditorManager.getCurrentFullEditor().document.file.parentPath,
        fileName = FileUtils.getBaseName(image);

    // If this is a saved document and image and document are in the same folder
    if (!/^_brackets_/.test(curDir) && (curDir.toLowerCase() === image.replace(fileName, "").toLowerCase())) {
      // Use only the image file name
      image = fileName;
    }

    // Try to make the path relative
    image = ProjectManager.makeProjectRelativeIfPossible(image);

    // If desired, if the path is longer than 50 characters split it up for better displaying
    if (uiDisplay && image.length > 50) {
      image = image.substring(0, 51) + "<br>" + image.substring(51, image.length);
    }
    return image;
  }


  /**
   * @private
   * Get the image size and relative path.
   * @param {Array.<string>} images Array containing absolute paths to an image.
   * @returns {Array} Populated with individual objects containing necessary image information.
   */
  function _getImageSize(images) {
    var storage = [];

    images.forEach(function(path) {
      // Create an image details object
      var details = {
        isSvg  : FileUtils.getFileExtension(path) === "svg",
        width  : 0,
        height : 0,
        absPath: path,
        relPath: _createImageURL(path)
      };

      // TODO The width/height is detected but will not be exposed to the needed scope

      // Special extraction routine for SVG graphics
      if (details.isSvg) {
        SvgSize.getSVGSize(path).then(function(sizes) {
          details.width  = sizes[0];
          details.height = sizes[1];
        });

        // Get the width and height for bitmap images
      } else {
        var $container = $("<img class='html-skeleton-img-size' src='" + path + "'/>");
        $container.trigger("load").one("load", function(e) {
          var $this = $(this);
          details.width  = $this.prop("naturalWidth");
          details.height = $this.prop("naturalHeight");
        });
      }
      storage.push(details);
    });
    return storage;
  }


  function _processImage(images) {
    var QimgCheckBox = document.querySelector(".html-skeleton-form #img");

    // The Image check box was not checked before now. Since the user has opened an image,
    // let's assume the user wants to use it and check the box for them.
    if (!QimgCheckBox.checked) {
      QimgCheckBox.checked = true;
    }

    // Clear the array if it was previously populated
    if (finalImages.length > 0) {
      finalImages = [];
    }

    // Get the size of each image
    finalImages = _getImageSize(images);

    // If only one image was selected, display it
    if (finalImages.length === 1) {
      _displayImage(finalImages[0]);

      // TODO "Multiple images were selected" display
    } else {

    }

    return true;
  }


  /**
   * @private
   * Update image width/height input fields.
   * @param imageObj {object} Image details object.
   * @return {boolean} true.
   */
  function _updateSizeInput(imageObj) {
    document.querySelector(".html-skeleton-form .img-width").value = imageObj.width;
    document.querySelector(".html-skeleton-form .img-height").value = imageObj.height;
    return true;
  }


  /**
   * @private
   * Display the user selected image.
   * @param imagePath {string} Absolute path to image file.
   */
  function _displayImage(imageObj) {
    var shortPath    = _createImageURL(imageObj.absPath, true),
        isSupported  = LanguageManager.getLanguageForPath(imageObj.absPath).getId() === "image" || imageObj.isSvg,
        $imgPreview  = $(".html-skeleton-img .image-preview"),
        QerrorText   = document.querySelector(".html-skeleton-img .img-error-text"),
        QpathDisplay = document.querySelector(".html-skeleton-img .img-src");

    // Appy the standard positioning
    $(".html-skeleton-img").css("position", "relative");
    $imgPreview.addClass("html-skeleton-img-container");

    // Update display
    QpathDisplay.innerHTML = shortPath;
    _updateSizeInput(imageObj);

    // The image is an unsupported file type
    if (!isSupported) {
      QpathDisplay.style.color = "red";
      $imgPreview.removeClass("html-skeleton-img-shadow");
      QerrorText.innerHTML = "<br>is not supported for previewing!";
      $imgPreview.attr("src", skeletonLogo);

      // The image is a supported file type
    } else if (isSupported) {
      // Clear possible CSS from unsupported image
      QerrorText.innerHTML = "";
      QpathDisplay.style.color = "";

      $imgPreview.addClass("html-skeleton-img-shadow");
      $imgPreview.attr("src", imageObj.absPath);
    }
    return;
  }


  /**
   * @private
   * Open the file browse dialog for the user to select an image.
   * @param {Object} e DOM event.
   */
  function _showFileDialog(e) {
    FileSystem.showOpenDialog(true, false, Strings.FILE_DIALOG_TITLE,
                              null, ImageFiles, function(cancel, selected) {
      if (!cancel && selected && selected.length > 0) {
        _processImage(selected);
      }
    });
    e.preventDefault();
    e.stopPropagation();
  }


  /**
   * Display HTML Skeleton dialog box.
   */
  function displaySkeletonDialog() {
    var skeletonDialog = Dialogs.showModalDialogUsingTemplate(localizedDialog),
        $dialog        = skeletonDialog.getElement(),
        $doneButton    = $(".dialog-button[data-button-id='ok']", $dialog);

    // Display logo (and any user images) using Brackets' ImageViewer
    new ImageViewer.ImageView(FileSystem.getFileForPath(skeletonLogo), $(".html-skeleton-img"));
    document.querySelector(".html-skeleton-img .image-preview").classList.add("html-skeleton-img-container");

    // Hide image stats
    var QimageTip   = document.querySelector(".html-skeleton-img .image-tip"),
        QimageScale = document.querySelector(".html-skeleton-img .image-scale");
    QimageTip.parentNode.removeChild(QimageTip);
    QimageScale.parentNode.removeChild(QimageScale);

    // If the Browse button is clicked, proceed to open the browse dialog
    $(".dialog-button[data-button-id='browse']", $dialog).on("click", function(e) {
      _showFileDialog(e);
    });

    // Upon closing the dialog, run function to gather and apply choices
    $doneButton.on("click", _getSelectedElements);
  }


  /**
   * @private
   * Load the extension after Brackets itself has finished loading.
   */
  AppInit.appReady(function() {
    // Define the extension ID and CSS
    var EXTENSION_ID = "le717.html-skeleton";
    ExtensionUtils.loadStyleSheet(module, "css/style.css");

    // Get the user's indentation settings
    indentUnits = IndentSize.getIndentation();

    // Create a menu item in the Edit menu
    CommandManager.register(Strings.INSERT_HTML_ELEMENTS, EXTENSION_ID, displaySkeletonDialog);
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuItem(EXTENSION_ID);

    // Create toolbar icon
    $(localizedButton).appendTo("#main-toolbar > .buttons").on("click", displaySkeletonDialog);
  });
});
