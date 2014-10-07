/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50 */
/*global define, brackets, $ */

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
  var FileSystem = brackets.getModule("filesystem/FileSystem"),
      FileUtils  = brackets.getModule("file/FileUtils");

  /**
   * @private
   * Get SVG graphic file object
   * @param svgfile {string} absolute path to SVG graphic
   * @return {jQuery.Promise} promise that contains a File object
   */
  function _readSVG(svgfile) {
    return FileUtils.readAsText(FileSystem.getFileForPath(svgfile));
  }

  /**
   * @private
   * @param width the proposed width
   * @param height the proposed height
   * @return {boolean} true if width and height are valid
   */
  function _checkIfValid(width, height) {
    return !Number.isNaN(width) && !Number.isNaN(height) && (width && height) !== 0 && (width && height) !== "";
  }

  /**
   * Attempt to extract the size of an SVG graphic
   * from the width/height, viewBox and enable-background attributes
   * @param svgfile {string} absolute path to SVG graphic
   * @return {jQuery.Promise} promise that resolves to a
   * two-index array containing the respective width and height or NaN
   * if the size could not be extracted
   */
  function getSVGSize(svgfile) {
    var result = new $.Deferred();

    _readSVG(svgfile).then(function (content) {
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

      // Check the validity of the extracted values,
      // preferring width/height attributes, then viewBox values
      var svgSize = [NaN, NaN];

      if (_checkIfValid(attrWidth, attrHeight)) {
        svgSize = [attrWidth, attrHeight];
      } else if (_checkIfValid(viewBoxWidth, viewBoxHeight)) {
        svgSize = [viewBoxWidth, viewBoxHeight];
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
