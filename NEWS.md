# Changes #

## 1.3.3 ##
## ?? October, 2014 ###
* Split indentation-related code into seperate module
* Internally store skeleton snippets in an object
* Add viewport `<meta>` tag option
* Enlarge dialog height by `20px`
* Prevent horizontal scrollbar
* Remove some usage of jQuery

## 1.3.0 ##
### 12 September, 2014 ###
* Add Split View compatibility
* **_HTML Skeleton_ now requires Brackets 0.44 or newer**
* Properly detect image path relative to document ([#14](https://github.com/le717/brackets-html-skeleton/issues/14))
* Add image shadow for Brackets dark theme
* Properly detect non-SVG graphic image size ([#20](https://github.com/le717/brackets-html-skeleton/issues/20))
* More accurately extract SVG graphic size using custom extraction routine ([#15](https://github.com/le717/brackets-html-skeleton/issues/15))
* Many bugs fixed, including displaying 270x240 in input fields when an image could not be displayed
* Compress SVG graphics
* Refactor, simplify, improve, and lint much of the code base
* Add meta viewport tag to "Head & Body" and "Full HTML Skeleton" snippets
* Move toolbar button HTML into separate file

## 1.2.2 ##
### 8 August, 2014 ##
* Support package.json `i18n` key added in Brackets [Release 42](https://github.com/adobe/brackets/wiki/Release-Notes:-0.42#newimproved-extensibility-apis)

## 1.2.1 ##
### 30 June, 2014 ##
* Added Italian translation ([#17](https://github.com/le717/brackets-html-skeleton/issues/17), [#18](https://github.com/le717/brackets-html-skeleton/issues/18)), submitted by [@Denisov21](https://github.com/Denisov21)

## 1.2.0 ##
### 29 June, 2014 ##
* Updated minimum Brackets version to Sprint 37
* Use user indentation settings via new Preferences System from Sprint 37
* Add toolbar icon, design finalized by [@rioforce](https://github.com/rioforce)
* Allow user to browse for image, preview that image, and use the path to the image and the image width and height in code snippet
Supports all formats classified as images by Brackets core plus beta support for SVG images
* Various code improvements and cleanup

## 1.1.5 ##
### 2 April, 2014 ###
* Brackets' image preview is changed due to CSS conflict ([#10](https://github.com/le717/brackets-html-skeleton/issues/10))

## 1.1.4 ##
### 24 March, 2014 ###
* Replace `transform` CSS properties ([#8](https://github.com/le717/brackets-html-skeleton/issues/8))
* Removed duplicate value assignments
* Indent source HTML and CSS using two space soft tabs (per [http://mdo.github.io/code-guide/#html-syntax](http://mdo.github.io/code-guide/#html-syntax) and [http://mdo.github.io/code-guide/#css-syntax](http://mdo.github.io/code-guide/#css-syntax))
* Indent source JavaScript using two space soft tabs (per [https://github.com/styleguide/javascript](https://github.com/styleguide/javascript))
* Update HTML elements per aforementioned style guide
* Changed inserted code indentation to two spaces (was four spaces)
* Removed keyboard shortcut

## 1.1.3 ##
## 22 February, 2014 ##
* Added internationalization support and German translation ([#7](https://github.com/le717/brackets-html-skeleton/issues/7), submitted by [@mikeboy91](https://github.com/mikeboy917))
* Use Bracket's image viewer to display logo
* Adjust placement of dialog elements
* Use regex to substitute image dimensions in template string

## 1.1.2 ##
## 18 February, 2014 ##
* Fixed improper placement of external stylesheet when combined with "Head and body w/title & meta" option ([#4](https://github.com/le717/brackets-html-skeleton/issues/4))
* Added Cancel button to dialog
* Fixed incorrect HTML tags and attributes

## 1.1.1 ##
## 10 February, 2014 ##
* Fix extension not even working ([#3](https://github.com/le717/brackets-html-skeleton/issues/3))
* Fix Brackets UI guideline violations

## 1.1.0 ##
## 8 February, 2014 ##
* Inspired by [adobe/brackets#6707](https://github.com/adobe/brackets/issues/6707), HTML Skeleton has been completely rewritten
to support new HTML elements using a dialog box rather than a straight keyboard shortcut

## 8 February, 2014 ##
* HTML Skeleton was forked to support [Bootstrap 3](http://getbootstrap.com/). Check it out at [@mirorauhala/brackets-bootstrap-skeleton](https://github.com/mirorauhala/brackets-bootstrap-skeleton)!

## 0.7.4 ##
### 30 January, 2014 ###
 * Fixed pre-filled `<html lang="">` value

## 0.7.3 ##
### 25 January, 2014 ###
* Initial release
