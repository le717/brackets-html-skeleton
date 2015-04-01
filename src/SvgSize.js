/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50 */
/*global $, define, brackets */

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
  var FileSystem = brackets.getModule("filesystem/FileSystem"),
      FileUtils  = brackets.getModule("file/FileUtils");

  /**
   * @private
   * Get SVG graphic file object.
   * @param {String} svgFile Absolute path to SVG graphic.
   * @return {$.Promise} Promise that contains a File object.
   */
  function _readSVG(svgFile) {
    return FileUtils.readAsText(FileSystem.getFileForPath(svgFile));
  }

  /**
   * @private
   * @param {Number} width The proposed width.
   * @param {Number} height The proposed height.
   * @return {Boolean} True if width and height are valid.
   */
  function _checkIfValid(width, height) {
    return !Number.isNaN(width) && !Number.isNaN(height) && (width && height) !== "";
  }

  /**
   * Attempt to extract the size of an SVG graphic
   * from the width/height, viewBox and enable-background attributes.
   * @param {String} svgFile Absolute path to SVG graphic.
   * @return {$.Promise} Promise that resolves to a
   *                             two-index array containing the respective width and height or NaN
   *                             if the size could not be extracted.
   */
  function getSVGSize(svgFile) {
    var result = new $.Deferred();

    _readSVG(svgFile).then(function(content) {
      // Add the SVG to the DOM
      var $svgContainer    = $("<div class='html-skeleton-svg'/>").css("display", "none").html(content),
          $svgElement      = $svgContainer.find("svg");

      // Extract every instance a width/height might be present
      var attrWidth        = $svgElement.attr("width") !== undefined ? $svgElement.attr("width") : "",
          attrHeight       = $svgElement.attr("height") !== undefined ? $svgElement.attr("height") : "",
          viewBoxWidth     = $svgElement.prop("viewBox").baseVal.width,
          viewBoxHeight    = $svgElement.prop("viewBox").baseVal.height,
          enableBackground = $svgElement.attr("enable-background") !== undefined ?
                             $svgElement.attr("enable-background") : "";

      // Extract the width and height values from the background
      var backgroundSizes  = enableBackground.split(" ");
      var backgroundWidth  = parseInt(backgroundSizes[3], 10),
          backgroundHeight = parseInt(backgroundSizes[4], 10);

      // Check the validity of the extracted values
      var svgSize = [0, 0];

      // Width/height attributes
      if (_checkIfValid(attrWidth, attrHeight)) {
        svgSize = [attrWidth, attrHeight];

        // viewBox values
      } else if (_checkIfValid(viewBoxWidth, viewBoxHeight)) {
        svgSize = [viewBoxWidth, viewBoxHeight];

        // `enable-background` attribute
      } else if (_checkIfValid(backgroundWidth, backgroundHeight)) {
        svgSize = [backgroundWidth, backgroundHeight];
      }

      // Remove container from DOM, resolve the promise
      $svgContainer.remove();
      result.resolve(svgSize);
    });
    return result.promise();
  }

  exports.getSVGSize = getSVGSize;
});
