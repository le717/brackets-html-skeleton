/* jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50 */
/* global define, brackets, $ */

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
   * @param svgFile {string} Absolute path to SVG file
   * @return {$.promise}
   */
  function _readSVG(svgFile) {
    return FileUtils.readAsText(FileSystem.getFileForPath(svgFile));
  }

  /**
   * @private
   * @param width The proposed width of the SVG.
   * @param height The proposed height of the SVG.
   * @return {boolean} True if width and height are not zero, false otherwise.
   */
  function _checkIfValid(width, height) {
    return (width && height) !== 0;
  }

  /**
   * Attempt to extract the width and height of SVG images
   * from the viewBox and enable-background attributes when
   * dedicated width and height attributes are missing.
   * @param svgFile {string} Absolute path to SVG file
   * @return {number[]} If available, the width and height of the SVG. Otherwise, NaN for both values.
   */
  function detectSVGSize(svgFile) {

    var svgSize = [NaN, NaN];
    _readSVG(svgFile).then(function(content) {
      // Add the SVG to the DOM, then extract the viewBox and
      // enable-background attribute values from the SVG
      var $svgContainer    = $("<div/>").css("display", "none").html(content),
          $svgElement      = $svgContainer.find("svg");
      var viewBoxWidth     = $svgElement.prop("viewBox").baseVal.width,
          viewBoxHeight    = $svgElement.prop("viewBox").baseVal.height,
          enableBackground = $svgElement.attr("enable-background");

      // Extract the width and hight values from the background
      var backgroundSizes  = enableBackground.split(" ");
      var backgroundWidth  = parseInt(backgroundSizes[3]),
          backgroundHeight = parseInt(backgroundSizes[4]);

      if (_checkIfValid(viewBoxWidth, viewBoxHeight)) {
        svgSize = [viewBoxWidth, viewBoxHeight];
      } else if (_checkIfValid(backgroundWidth, backgroundHeight)) {
        svgSize = [backgroundWidth, backgroundHeight];
      } //else {
//        svgSize = [NaN, NaN];
//      }
//      console.log(viewBoxWidth);
//      console.log(viewBoxHeight);
//      console.log(backgroundWidth);
//      console.log(backgroundHeight);
//      console.log(svgSize);
      return svgSize;
    });
//    console.log(svgSize);
//    return svgSize;
  }

  exports.detectSVGSize = detectSVGSize;
});
