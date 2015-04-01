/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 2, maxerr: 50 */
/*global define, brackets */

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
  var PreferencesManager = brackets.getModule("preferences/PreferencesManager");

  // Store the indentation values,
  // initializing them as 2 space indentation
  var indentation = {
    char: "\u0020",
    size: 2,
    isTab: false
  };

  /**
   * @private
   * Helper from http://stackoverflow.com/a/4550005
   * @param {String} str Text to be repeated.
   * @param {Number} num Number of times text repeated should occur.
   * @returns {String}
   */
  function _repeatString(str, num) {
    return new Array(num + 1).join(str);
  }

  /**
   * Create a complete indentation level by repeating
   * the user's desired character by their chosen size.
   * @return {String} Complete indentation level.
   */
  function getIndentation() {
    return _repeatString(indentation.char, indentation.size);
  }

  /**
   * Get the current indentation settings for use in inserted code
   * @return {String} User's current indentation settings
   */
  function getIndentType() {
    // \u0009 is a tab, \u0020 is a space
    var isTab = PreferencesManager.get("useTabChar", PreferencesManager.CURRENT_PROJECT);

    if (isTab) {
      indentation.char  = "\u0009";
      indentation.isTab = true;
    } else {
      indentation.char  = "\u0020";
      indentation.isTab = false;
    }
    return indentation.char;
  }

  /**
   * Get the user's indentation level size depending on if they use spaces or tabs.
   * @return {String} Indentation level size.
   */
  function getIndentSize() {
    indentation.size = indentation.isTab ? PreferencesManager.get("tabSize") : PreferencesManager.get("spaceUnits");
    return indentation.size;
  }

  // A relevant preference was changed, update our settings
  PreferencesManager.on("change", function (e, data) {
    if (data.ids.indexOf("useTabChar") > -1) {
      getIndentType();
    }

    if (data.ids.indexOf("tabSize") > -1 || data.ids.indexOf("spaceUnits") > -1) {
      getIndentSize();
    }
  });

  exports.getIndentType   = getIndentType;
  exports.getIndentSize   = getIndentSize;
  exports.getIndentation  = getIndentation;
});
