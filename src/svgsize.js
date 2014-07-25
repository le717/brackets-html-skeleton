/* jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50 */
/* global define, brackets, $, require, Mustache, document */

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
  var FileSystem = brackets.getModule("filesystem/FileSystem"),
      FileUtils  = brackets.getModule("file/FileUtils");

  /**
   * @private
   * Get SVG file object information
   * @param {String} Absolute path to SVG file
   * @return {$.promise}
   */
  function _readSVG(svgFile) {
    return FileUtils.readAsText(FileSystem.getFileForPath(svgFile));
  }

  /**
   * Attempt to extract the width and height of SVG images
   * from the viewBox and enable-background attributes when
   * dedicated width and height attributes are missing.
   * @param {String} Absolute path to SVG file
   * @return {String[]} If available, the width and height of the SVG. Otherwise, NaN for both values.
   */
  function detectSVGSize(svgFile) {
    _readSVG(svgFile).then(function(content) {
      var sizeFound       = false,
          viewBoxIndex    = content.indexOf("viewBox"),
          backgroundIndex = content.indexOf("enable-background");

      var $svgContainer     = $("<div/>").css("display", "none").html(content);
      var $viewBoxWidth     = $svgContainer.find("svg").prop("viewBox").baseVal.width,
          $viewBoxHeight    = $svgContainer.find("svg").prop("viewBox").baseVal.height,
          $enableBackground = $svgContainer.find("svg").attr("enable-background");

      // Get the values of the viewBox and enable-background attributes
      // FIXME Inkscape SVGs need more trimming to get enable-background
      // FIXME What if the attributes are not present at all?
      // FIXME More than 2-value numbers break this entirely
      var viewBox    = content.slice(viewBoxIndex, backgroundIndex).replace(/viewBox="/i, ""),
          background = content.slice(backgroundIndex, backgroundIndex + content.indexOf(">")).replace(/enable-background="new\s/i, "");
      viewBox        = viewBox.slice(0, viewBox.lastIndexOf('"'));
      background     = background.slice(0, background.lastIndexOf('"'));

//      console.log(viewBox);
//      console.log(background);

      // Now that we have the values, get only the relevant parts
      var viewBoxSizes    = viewBox.split(" "),
          backgroundSizes = background.split(" ");
      viewBoxSizes.splice(0, 2);
      backgroundSizes.splice(0, 2);

//      console.log("viewBoxSizes " + viewBoxSizes);
//      console.log("backgroundSizes " + backgroundSizes);

      // If the size is present in the viewBox values (they usually are),
      // use those values for the width and height
      // FIXME This is very bad logic (0????)
      viewBoxSizes.forEach(function(value, index) {
        if (parseInt(value) !== 0) {
          sizeFound = true;
        }
      });
      if (sizeFound) {
        return viewBoxSizes;
      }

      // If the width and height are not in viewBox, look for them in enable-background
      // FIXME This is very bad logic (0????)
      backgroundSizes.forEach(function(value, index) {
        if (parseInt(value) !== 0) {
          sizeFound = true;
        }
      });

//      console.log(sizeFound);

      if (sizeFound) {
        return backgroundSizes;
        // The width and height could not be found at all,
        // send back NaN values to signal this
      } else {
        return [NaN, NaN];
      }
    });
  }

  exports.detectSVGSize = detectSVGSize;
});
