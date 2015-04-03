module.exports = function (grunt) {
  "use strict";
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    jsFiles: ["*.js", "src/*.js"],
    jsFilesi18n: ["strings.js", "nls/*.js", "nls/**/*.js"],
    jsFilesTests: ["unittests.js"],

    htmlhint: {
      html: {
        options: {
          htmlhintrc: ".htmlhintrc"
        },
        src: ["htmlContent/*.html"]
      }
    },

    csslint: {
      strict: {
        options: {
          csslintrc: ".csslintrc",
          "import": 2
        },
        src: "css/*.css",
      }
    },

    jshint: {
      options: {
        jshintrc: ".jshintrc"
      },
      src: {
        src: "<%= jsFiles %>"
      },
      i18n: {
        src: "<%= jsFilesi18n %>"
      },
      test: {
        src: "<%= jsFilesTests %>"
      },
    },

    jscs: {
      options: {
        config: ".jscs.json"
      },
      src: {
        src: "<%= jsFiles %>"
      },
      i18n: {
        src: "<%= jsFilesi18n %>",
        options: {
          maximumLineLength: null
        }
      },
      test: {
        src: "<%= jsFilesTests %>"
      },
    }
  });

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  grunt.registerTask("default", "List of commands", function () {
    grunt.log.writeln("");
    grunt.log.writeln("Run 'grunt lint' to lint the source files");
  });

  grunt.registerTask("lint", ["htmlhint", "csslint", "jshint", "jscs"]);
};
