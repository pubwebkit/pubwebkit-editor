module.exports = function(config) {
  config.set({

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['closure', 'jasmine'],

    files: [
      // closure base
      'vendors/closure-library/closure/goog/base.js',

      // included files - tests
      {pattern: 'tests/*.js'},
      {pattern: 'tests/deps.js', included: false, served: false},

      // source files - these are only watched and served
      {pattern: 'app/**/*.js', included: false},
      {pattern: 'app/deps.js', included: false, served: false},

      // external deps
      {pattern: 'vendors/closure-library/closure/goog/deps.js', included: false, served: false},
      {pattern: 'vendors/closure-library/closure/goog/**/*.js', included: false}
    ],

    reporters: ['mocha', 'coverage'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // tests are preprocessed for dependencies (closure) and for iits
      'tests/*.js': ['closure', 'closure-iit'],
      'tests/deps.js': ['closure-deps'],

      // source files are preprocessed for dependencies
      'app/**/*.js': ['closure'],
      'app/deps.js': ['closure-deps'],

      // external deps
      'vendors/closure-library/closure/goog/**/*.js': ['closure'],
      'vendors/closure-library/closure/goog/deps.js': ['closure-deps'],
    }
  });
};
