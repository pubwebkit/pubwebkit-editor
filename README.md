# [Pubwebkit](http://www.pubwebkit.com/) editor

Powerful editor to create your ebook in various styles. It's includes: Cover Designer, Template Editor, Community Snippets and more.
Also, it's a part of [www.pubwebkit.com](http://www.pubwebkit.com/) portal.

## Initialize development enviroment:
- Run `npm install` from terminal to update all npm references
- Make sure you have installed Maven.
- Build Google Closure Compiler. Navigate to `libs/closure-compiler/` folder and run command `mvn -DskipTests`.
- Build Google Closure Templates for javascript usage. Navigate to `libs/closure-templates/` folder and run command `mvn`.
- Install Closure Linter from `libs/closure-linter` by next command `python ./setup.py install`.
    - Make gjslint.py executable `chmod +x libs/closure-linter/closure_linter/gjslint.py`.
    - Make gjslint.py executable `chmod +x libs/closure-linter/closure_linter/fixjsstyle.py`.

## Grunt task
To automate the build, cleaning, code style checking is used Grunt tasks runner.
Below list of the most important task that can used during development:
* `grunt build` - Compile JavaScript to better JavaScript by Google Closure Compiler, compile Less files to css and minimize. Compiled project will be placed to `build` folder.
* `grunt eslint` - Check JavaScript files of the project by  ESLint linting utility.
* `grunt closureLint` - Check JavaScript files for style issues by Google Closure Linter; 
* `grunt connect` - Run local server with root project directory. Web server will be available by http://localhost:9000.
* `grunt jsdoc` - Generate JSDoc based documentation.

## Supported Browsers:
* Internet Explorer 9+
* Opera 12 (PC and Mac looks good)
* Chrome (21+) (Looks good, not tested on previous builds)
* Firefox (4+)
