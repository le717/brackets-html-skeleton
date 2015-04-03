/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50 */
/*global describe, it, define, runs, expect, waitsFor */

/*
 * HTML Skeleton
 * Created 2014-2015 Triangle717
 * <http://le717.github.io/>
 *
 * Licensed under The MIT License
 * <http://opensource.org/licenses/MIT/>
 */


define(function (require, exports, module) {
  "use strict";

  var FileUtils = brackets.getModule("file/FileUtils"),
      SvgSize   = require("src/SvgSize");

  var extensionPath = FileUtils.getNativeModuleDirectoryPath(module);


  describe("HTML Skeleton", function () {

    describe("SVG graphic dimensions extraction", function () {
      var testPath       = extensionPath + "/unittest-files/svg/",
          SvgEBack       = testPath + "toolbar-enable-background.svg",
          SvgViewBox     = testPath + "toolbar-viewBox.svg",
          SvgAllProps    = testPath + "toolbar-all-props.svg",
          SvgWidthHeight = testPath + "toolbar-width-height.svg";


      function confirmDimensions(file, expectedSizes) {
        var complete  = false,
            extracted = null;

        SvgSize.get(file).then(function (obj) {
          complete = true;
          extracted = obj;
        });

        waitsFor(function () {
          return complete;
        }, "Expected dimensions did not resolve", 3000);

        runs(function () {
          expect(extracted).not.toBeNull();
          expect(extracted.width).toBe(expectedSizes.width);
          expect(extracted.height).toBe(expectedSizes.height);
        });
      }

      it("should extract the width and height values from an SVG", function () {
        confirmDimensions(SvgWidthHeight, {width: "24", height: "24"});
      });

      it("should extract the viewBox values from an SVG", function () {
        confirmDimensions(SvgViewBox, {width: "24", height: "24"});
      });

      it("should extract the enable-background values from an SVG", function () {
        confirmDimensions(SvgEBack, {width: "24", height: "24"});
      });

      it("should extract the width and height values from an SVG containing all supported properties", function () {
        confirmDimensions(SvgAllProps, {width: "24", height: "24"});
      });

    });

  });
});
