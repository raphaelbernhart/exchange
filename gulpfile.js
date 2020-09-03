// Import everything important
const gulp = require('gulp');
const plumber = require("gulp-plumber");

// HTML
const htmlmin = require('gulp-htmlmin');

// JavaScript/TypeScript
const ts = require('gulp-typescript')
var tsProject = ts.createProject('tsconfig.json')

// Define Important Varaibles
const src = './src';
const dest = './dist';

// Function to copy assets
const assets = () => {
    return gulp.src(`${src}/public/**/*`)
        .pipe(gulp.dest(`${dest}/public`))
}

// Copy storage
const storage = () => {
    return gulp.src(`${src}/storage/**/*`)
        .pipe(gulp.dest(`${dest}/storage`))
}

// Compile .html to minify .html
const html = () => {
    // Find HTML
    return gulp.src(`${src}/views/*.html`)
        // Init Plumber
        .pipe(plumber())
        // Compile HTML -> minified HTML
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            html5: true,
            removeEmptyAttributes: true,
            removeTagWhitespace: true,
            sortAttributes: true,
            sortClassName: true
        }))
        // Write everything to destination folder
        .pipe(gulp.dest(`${dest}/views/`));
};

// Compile .ts to .js
const script = () => {
    // Find TS
    var tsResult = gulp.src("src/**/*.ts") // or tsProject.src()
        .pipe(tsProject());
 
    return tsResult.js.pipe(gulp.dest(`${dest}/`));
};

// Just Build the Project
const build = gulp.series(assets, storage, html, script);

// Default function (used when type gulp)
exports.build = build;
exports.default = build;