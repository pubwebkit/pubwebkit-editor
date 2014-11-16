/*!
 * PubWebkit editor project Gruntfile
 * https://github.com/banguit/hedgehog-site
 * Copyright 2014 Dmitry Antonenko
 */

module.exports = function (grunt) {
    'use strict';

    var CONFIGURATION = {

        // The base file of project. The full path will result by concatenating appPath + bootstrapFile
        bootstrapFile: 'app.js',

        // Path to the app
        appPath: 'app/',

        // define the main namespace of your app.
        entryPoint: 'pwk',

        // The path to the closure library
        closureLibrary: 'libs/closure-library',

        // The folder that contains all the externs files
        externsPath: 'app/externs/',

        // The compiled file
        destCompiled: 'build/pubwebkit.editor.min.js',

        // The location of the source map
        sourceMap: 'build/pubwebkit.editor.js.map',

        // Closure Compiler
        compiler: 'libs/closure-compiler/build/compiler.jar',

        // This sting will wrap your code marked as %output%
        // Take care to edit the sourcemap path
        outputWrapper: '(function(){%output%}).call(this);' + '//# sourceMappingURL=build/pubwebkit.editor.js.map'
    };

    // Configure
    grunt.initConfig({

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

        closureBuilder: {
            options: {
                closureLibraryPath: CONFIGURATION.closureLibrary,
                inputs: [CONFIGURATION.appPath + CONFIGURATION.bootstrapFile],
                compile: true,
                compilerFile: CONFIGURATION.compiler,
                compilerOpts: {
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    externs: [CONFIGURATION.externsPath + '*.js'],
                    define: [
                        '\'goog.DEBUG=false\''
                    ],
                    warning_level: 'verbose',
                    jscomp_off: [],
                    summary_detail_level: 3,
                    only_closure_dependencies: false,
                    closure_entry_point: CONFIGURATION.entryPoint,
                    create_source_map: CONFIGURATION.sourceMap,
                    source_map_format: 'V3',
                    output_wrapper: CONFIGURATION.outputWrapper

                }
            },
            app: {
                src: [
                    CONFIGURATION.appPath,
                    CONFIGURATION.closureLibrary
                ],
                dest: CONFIGURATION.destCompiled
            }
        },

        copy: {
            html: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'app',
                    dest: 'build/',
                    src: [ 'index-prod.html' ],
                    rename: function(dest, src) {
                        return dest + src.replace('-prod.html','.html');
                    }
                }]
            }
        },

        clean: {
            dist: ['build/*']
        },

        less: {
            build: {
                options: {
                    paths: ["less"],
                    cleancss: true
                },
                files: {
                    "build/editor.min.css": "less/theme.less"
                }
            }
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-closure-tools');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');

    // Register tasks
    grunt.registerTask('build', [
        'clean:dist',
        'copy:html',
        'less:build',
        'closureDepsWriter:app',
        'closureBuilder:app'
    ]);
    grunt.registerTask('deps', [
        'closureDepsWriter:app'
    ]);
};
