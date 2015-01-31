module.exports = function(grunt) {
  "use strict";
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    htmlhint: {
      html: {
        options: {
          "tag-pair": true,
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
        src: ["*.js", "src/*.js", "nls/*.js", "nls/**/*.js"],
      },
    }
  });

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
  require("jsonlint");
  require("jscs");

  grunt.registerTask("default", "List of commands", function() {
    grunt.log.writeln("");
    grunt.log.writeln("Run 'grunt lint' to lint the source files");
  });

  grunt.registerTask("lint", ["htmlhint", "jshint", "csslint"]);
};
