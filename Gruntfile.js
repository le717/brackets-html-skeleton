module.exports = function(grunt) {
  "use strict";
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    jsFiles: ["*.js", "src/*.js"],
    i18nJsFiles: ["nls/*.js", "nls/**/*.js"],

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
      src: {
        options: {
          jshintrc: ".jshintrc"
        },
        src: ["<%= jsFiles %>", "<%= i18nJsFiles %>"]
      },
    },

    jscs: {
      main: {
        src: "<%= jsFiles %>"
      },
      i18n: {
        src: "<%= i18nJsFiles %>",
        options: {
          maximumLineLength: null
        }
      },
      options: {
        config: ".jscs.json"
      }
    }
  });

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  grunt.registerTask("default", "List of commands", function() {
    grunt.log.writeln("");
    grunt.log.writeln("Run 'grunt lint' to lint the source files");
  });

  grunt.registerTask("lint", ["htmlhint", "csslint", "jshint", "jscs"]);
};
