# [Pubwebkit](http://www.pubwebkit.com/) editor

Powerful editor to create your ebook in various styles. It's includes: Cover Designer, Template Editor, Community Snippets and more.
Also, it's a part of [www.pubwebkit.com](http://www.pubwebkit.com/) portal.

## Installation:
- Run `npm install` from terminal to update all npm references
- Make sure you have installed Maven.
- Build Google Closure Compiler. Navigate to `libs/closure-compiler/` folder and run command `mvn -DskipTests`.
- Build Google Closure Templates for javascript usage. Navigate to `libs/closure-templates/` folder and run command `mvn`.
- Install Closure Linter from `libs/closure-linter` by next command `python ./setup.py install`.
    - Make gjslint.py executable `chmod +x libs/closure-linter/closure_linter/gjslint.py`.
    - Make gjslint.py executable `chmod +x libs/closure-linter/closure_linter/fixjsstyle.py`.

## Supported Browsers:
* Internet Explorer 9+
* Opera 12 (PC and Mac looks good)
* Chrome (21+) (Looks good, not tested on previous builds)
* Firefox (4+)
