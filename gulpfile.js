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
const views = () => {
    // Find HTML
    return gulp.src(`${src}/views/*.*`)
        // Init Plumber
        .pipe(plumber())
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
const build = gulp.series(assets, storage, views, script);

// Default function (used when type gulp)
exports.build = build;
exports.default = build;