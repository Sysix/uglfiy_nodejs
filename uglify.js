var UglifyJS = require("uglify-js");
var uglifycss = require('uglifycss');
var replace_css_url = require('replace-css-url');
var path = require('path');
var fs = require('fs');

var files = {
    js: [
        "js/jquery.min.js",
        "js/scripts.js"
    ],
    css: [
        "css/bootstrap.min.css",
        "css/style.css"
    ]
};

var uglifyJsObject = {};
var uglifyCSSObject = {};

var cacheFileName = "./tmp/cache-js.json";
var options = {
    nameCache: JSON.parse(fs.readFileSync(cacheFileName, "utf8")),
    output: {
        beautify: false
    }
};

files.js.forEach((file) => {
    uglifyJsObject[file] = fs.readFileSync(file, 'utf8');
});

fs.writeFileSync("js/public.min.js", UglifyJS.minify(uglifyJsObject, options).code, "utf8");
fs.writeFileSync(cacheFileName, JSON.stringify(options.nameCache), "utf8");

var rootPath = path.dirname(__dirname);

files.css.forEach((file) => {
    uglifyCSSObject[file] = replace_css_url(fs.readFileSync(file, 'utf8'), (filepath) => {
        if (filepath.indexOf('http') === -1 && filepath.indexOf('data:') === -1) {
            filepath = path.resolve(path.dirname(file), filepath);

            return filepath
                .replace(rootPath, '')
                .split(path.sep).join('/');
        }
    });
});

var uglified = uglifycss.processString(
    Object.values(uglifyCSSObject).join(''),
    {maxLineLen: 500, expandVars: true}
);

fs.writeFileSync("css/public.min.css", uglified, 'utf8');

