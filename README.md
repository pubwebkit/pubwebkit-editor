# [Pubwebkit](http://www.pubwebkit.com/) editor

[![CircleCI](https://circleci.com/gh/pubwebkit/pubwebkit-editor.svg?style=shield&circle-token=3752c66c0d775a9f309ab8b150f98a6ffd0289fe)](https://circleci.com/gh/pubwebkit/pubwebkit-editor) [![License](https://img.shields.io/badge/License-GNU%20AGPL%20V3-green.svg?style=flat)](http://www.gnu.org/licenses/agpl-3.0.ru.html)

Powerful editor to create your ebook in various styles. It's includes: Cover Designer, Template Editor, Community Snippets and more.
Also, it's a part of [www.pubwebkit.com](http://www.pubwebkit.com/) portal.

## Initialize development enviroment:
* Run `npm install` from terminal to update all npm references
* Make sure you have installed Maven.
* Build Google Closure Compiler. Run command `npm run build:closure-compiler` on the root of the pubwebkit-editor project.
* Build Google Closure Templates for javascript usage. Navigate to `vendors/closure-templates/` folder and run command `mvn`.

## Available npm commands
* `npm run build` - Build project.
* `npm run build:closure-compiler` - Build Google Closure Compiler.
* `npm test` - Run tests.

## File structure
* `app` - Pubwebkit editor source.
* `dist` - Contains compiled editor after build process.
* `docs` - API documentation.
* `jsdoc_template` - API documentation templates.
* `less` - LESS files related to Pubwebkit Editor
* `vendors` - Libraries, plugins, modules, components, etc. Not just libraries, but anything that's provided by a third party.
* `Gruntfile.js` - is used to configure or define tasks and load Grunt plugins.

## Grunt task
GruntJS is a JavaScript based command line build tool that helps developers automate repetitive tasks. It perform tasks like minification, compilation, unit testing, linting, etc.
Below list of the most important task that can used during development:
* `grunt build` - Compile JavaScript to better JavaScript by Google Closure Compiler, compile Less files to css and minimize. Compiled project will be placed to `dist/` folder.
* `grunt eslint` - Check JavaScript files of the project by  ESLint linting utility.
* `grunt connect` - Run local server with root project directory. Web server will be available by http://localhost:9000.
* `grunt jsdoc` - Generate JSDoc based documentation. All documentation available under `docs/` folder. If you will run local web server, then you can access documentation by http://localhost:9000/documentation.
Also, you can browse latest API documentation by this [link](http://htmlpreview.github.io/?https://github.com/pubwebkit/pubwebkit-editor/blob/master/docs/index.html) using GitHub & BitBucket HTML Preview tool.
* `grunt shell:compileClosureCompiler` - Compile Google Closure Compiler.

## Supported Browsers
* Internet Explorer 9+
* Opera 12 (PC and Mac looks good)
* Chrome (21+) (Looks good, not tested on previous builds)
* Firefox (4+)
