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


define(function (require, exports) {
  "use strict";
  var FileSystem = brackets.getModule("filesystem/FileSystem"),
      FileUtils  = brackets.getModule("file/FileUtils");

  /**
   * @private
   * Get SVG graphic file object.
   * @param {String} svgFile Absolute path to SVG graphic.
   * @return {$.Promise} Promise that contains a File object.
   */
  function _readSVGFile(svgfile) {
    return FileUtils.readAsText(FileSystem.getFileForPath(svgfile));
  }

  /**
   * @private
   * @param {Number} width The proposed width.
   * @param {Number} height The proposed height.
   * @return {Boolean} True if width and height are valid.
   */
  function _isValid(width, height) {
    return !Number.isNaN(width) && !Number.isNaN(height) && (width && height) !== null;
  }

  /**
   * Attempt to extract the size of an SVG graphic
   * from the width/height, viewBox and enable-background attributes.
   * @param {String} svgFile Absolute path to SVG graphic.
   * @return {$.Promise} Promise that resolves to an object
   *                     containing the respective width and height
   *                     or NaN if any size could not be extracted.
   */
  function getSVGSize(svgfile) {
    var result = new $.Deferred();

    _readSVGFile(svgfile).then(function (content) {
      // Regexs to extract the details
      var widthRegex            = /[^-]width=['"](.+?)['"]/i,
          heightRegex           = /[^-]height=['"](.+?)['"]/i,
          viewBoxRegex          = /viewBox=['"](.+?)['"]/i,
          enableBackgroundRegex = /enable-background=['"](.+?)['"]/i;

      // Check the SVG for the needed attributes
      var results = {
        width: widthRegex.test(content) ? content.match(widthRegex)[1] : null,
        height: heightRegex.test(content) ? content.match(heightRegex)[1] : null,
        viewBox: viewBoxRegex.test(content) ? content.match(viewBoxRegex)[1] : null,
        enableBackground: enableBackgroundRegex.test(content) ? content.match(enableBackgroundRegex)[1] : null
      };

      // The viewBox values are present, extract them
      if (results.viewBox) {
        var individualVB = results.viewBox.split(" ");
        results.viewBoxWidth = individualVB[2];
        results.viewBoxHeight = individualVB[3];
        delete results.viewBox;
      }

      // The enable-background values are present, extract them
      if (results.enableBackground) {
        var individualEB = results.enableBackground.split(" ");
        results.enableBackgroundWidth = individualEB[3];
        results.enableBackgroundHeight = individualEB[4];
        delete results.enableBackground;
      }

      // Check the validity of the extracted values,
      var svgSize = {
        width: NaN,
        height: NaN
      };

      // Width/height
      if (_isValid(results.width, results.height)) {
        svgSize.width = results.width;
        svgSize.height = results.height;

        // viewBox
      } else if (_isValid(results.viewBoxWidth, results.viewBoxHeight)) {
        svgSize.width = results.viewBoxWidth;
        svgSize.height = results.viewBoxHeight;

        // enable-background
      } else if (_isValid(results.enableBackgroundWidth, results.enableBackgroundHeight)) {
        svgSize.width = results.enableBackgroundWidth;
        svgSize.height = results.enableBackgroundHeight;
      }

      // Resolve the promise
      result.resolve(svgSize);
    });
    return result.promise();
  }

  exports.getSVGSize = getSVGSize;
});
