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

        // The path to the closure library
        closureLibrary: 'libs/closure-library',

        // The folder that contains all the externs files
        externsPath: 'app/externs/',

        // The compiled file
        destCompiled: 'build/pubwebkit.editor.min.js'
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
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-closure-tools');


    // Register tasks
    grunt.registerTask('deps', [
        'closureDepsWriter:app'
    ]);
};
