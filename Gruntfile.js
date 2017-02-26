/*!
 * PubWebkit editor project Gruntfile
 * https://github.com/pubwebkit/pubwebkit-editor
 * Copyright 2016 Dmytro Antonenko
 */

var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
  'use strict';

  var CONFIGURATION = {

    // The base file of project. The full path will result by concatenating appPath + bootstrapFile
    bootstrapFile: 'app.js',

    // Path to the app
    appPath: 'app/',

    // Path to the tests
    testsPath: 'tests/',

    // define the main namespace of your app.
    entryPoint: 'app',

    // The path to the closure library
    closureLibrary: 'vendors/closure-library',

    // Path to closure compiler source
    closureCompilerSrc: 'vendors/closure-compiler',

    // Path to closure linter
    closureLinter: 'vendors/closure-linter/closure_linter',

    // The folder that contains all the externs files
    externsPath: 'app/externs/',

    // Distribution folder
    distFolder: 'dist',

    // The compiled file
    destCompiled: 'dist/pubwebkit.editor.min.js',

    // The location of the source map
    sourceMap: 'dist/pubwebkit.editor.js.map',

    //local filename|remote url
    source_map_location_mapping: ['vendors/|http://localhost:63342/pubwebkit-editor/vendors/', 'app/|http://localhost:63342/pubwebkit-editor/app/'],

    // Closure Compiler
    compiler: 'vendors/closure-compiler/target/closure-compiler-1.0-SNAPSHOT.jar',

    // This sting will wrap your code marked as %output%
    // Take care to edit the sourcemap path
    outputWrapper: '(function(){%output%}).call(this);'
  };

  // Configure
  grunt.initConfig({

    pkg: '<json:package.json>',

    eslint: {
      target: ['app/**/*.js']
    },

    file_append: {
      default_options: {
        files: [
          function() {
            return {
              append: "\n/*\n//@ sourceMappingURL=testing2.js.map\n*/",
              input: CONFIGURATION.destCompiled
            };
          }
        ]
      }
    },

    // grunt-closure-tools tasks
    closureDepsWriter: {
      options: {
        closureLibraryPath: CONFIGURATION.closureLibrary
      },
      app: {
        options: {
          root_with_prefix: [
            '"' + CONFIGURATION.appPath + ' ../../../../app/"'
          ]
        },
        dest: '' + CONFIGURATION.appPath + '/deps.js'
      }
    },

    clangFormat: {
      src: [ 'app/**/*.js', 'tests/**/*.js' ]
    },

    closureBuilder: {
      options: {
        closureLibraryPath: CONFIGURATION.closureLibrary,
        inputs: [CONFIGURATION.appPath + CONFIGURATION.bootstrapFile],
        compile: true,
        compilerFile: CONFIGURATION.compiler,
        compilerOpts: {
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          language_in: 'ECMASCRIPT6_STRICT',
          externs: [
            CONFIGURATION.externsPath + '*.js'
          ],
          define: ["'goog.DEBUG=false'"],
          warning_level: 'verbose',
          jscomp_off: [],
          summary_detail_level: 3,
          only_closure_dependencies: false,
          closure_entry_point: CONFIGURATION.entryPoint,
          create_source_map: CONFIGURATION.sourceMap,
          source_map_format: 'V3',
          source_map_location_mapping: CONFIGURATION.source_map_location_mapping,
          output_wrapper: CONFIGURATION.outputWrapper,
          jscomp_warning: ['lintChecks',
                          'accessControls',
                          'ambiguousFunctionDecl',
                          'checkEventfulObjectDisposal',
                          'checkRegExp',
                          'checkTypes',
                          'checkVars',
                          'commonJsModuleLoad',
                          'conformanceViolations',
                          'const',
                          'constantProperty',
                          'deprecated',
                          'deprecatedAnnotations',
                          'duplicateMessage',
                          'es3',
                          'es5Strict',
                          'externsValidation',
                          'fileoverviewTags',
                          'functionParams',
                          'globalThis',
                          'internetExplorerChecks',
                          'invalidCasts',
                          'misplacedTypeAnnotation',
                          'missingGetCssName',
                          'missingOverride',
                          'missingPolyfill',
                          'missingProperties',
                          'missingProvide',
                          //'missingRequire',
                          'missingReturn',
                          'msgDescriptions',
                          // 'newCheckTypes',
                          // 'nonStandardJsDocs',
                          // 'reportUnknownTypes',
                          'suspiciousCode',
                          'strictModuleDepCheck',
                          'typeInvalidation',
                          'undefinedNames',
                          'undefinedVars',
                          'unknownDefines',
                          'unusedLocalVariables',
                          //'unusedPrivateMembers',
                          'uselessCode',
                          'useOfGoogBase',
                          'underscore',
                          'visibility'],
          hide_warnings_for: CONFIGURATION.closureLibrary
        }
      },
      app: {
        src: [
          CONFIGURATION.appPath,
          CONFIGURATION.closureLibrary
        ],
        dest: CONFIGURATION.destCompiled
      },
    },

    copy: {
      html: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app',
          dest: 'dist/',
          src: ['index-prod.html'],
          rename: function(dest, src) {
            return dest + src.replace('-prod.html', '.html');
          }
        }]
      }
    },

    clean: {
      dist: ['dist/*']
    },

    less: {
      build: {
        options: {
          paths: ["less"],
          cleancss: true
        },
        files: {
          "dist/editor.min.css": "less/theme.less"
        }
      }
    },

    connect: {
      options: {
        port: 9000,
        hostname: 'localhost',
        keepalive: true
      },
      app: {
        options: {
          middleware: function(connect) {
            return [
              mountFolder(connect, './')
            ];
          }
        }
      }
    },

    jsdoc: {
      dist: {
        src: ['app/**/*.js'],
        options: {
          destination: 'docs',
          template: "jsdoc_template",
          configure: "jsdoc_template/jsdoc.conf.json",
          private: true,
          recurse: true,
          readme: 'README.md'
        }
      }
    },

    shell: {
      compileClosureCompiler: {
        command: () => 'cd ' + CONFIGURATION.closureCompilerSrc + ' && '
                  + 'mvn install -DskipTests -pl com.google.javascript:closure-compiler-linter  && '
                  + 'mvn -DskipTests -pl "!pom-gwt.xml"'
      },
      options: {
        execOptions: {
          maxBuffer: Infinity
        }
      }
    },

    concat: {
    }
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-clang-format');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-file-append');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-shell');

  // Register tasks
  grunt.registerTask('build', [
    'clean:dist',
    'copy:html',
    'less:build',
    'closureDepsWriter:app',
    'closureBuilder:app',
    'file_append'
  ]);
  grunt.registerTask('deps', [
    'closureDepsWriter:app'
  ]);
};
