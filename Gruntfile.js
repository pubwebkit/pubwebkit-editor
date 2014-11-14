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
                        '"' + CONFIGURATION.appPath + ' ../../"'
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
                    only_closure_dependencies: null,
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

        clean: {
            dist: ['build/*']
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-closure-tools');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Register tasks
    grunt.registerTask('build', [
        'clean:dist',
        'closureDepsWriter:app',
        'closureBuilder:app'
    ]);
    grunt.registerTask('deps', [
        'closureDepsWriter:app'
    ]);
};
