// jshint node: true

var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var magicImporter = require('node-sass-magic-importer');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');
var browserSync = require('browser-sync').create();
var babel = require("gulp-babel");
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var jshintReporter = 'default'; // Consider stylish
var gulpif = require('gulp-if');
const replace = require('gulp-replace');
var config = require("./config.json");
var fs = require("fs");
var jshintrc = JSON.parse(fs.readFileSync("./.jshintrc").toString());

var sassSources = config.sassSources;
var jsSources = config.jsSources;
var jsVendorSources = config.jsVendorSources;
var experimentalSources = config.experimentalSources;
var htmlSources = config.htmlSources;

// Build files once
gulp.task('build', gulp.series(css, scripts, jsVendor, experimental));

// Watch and build files on change
gulp.task('watch', gulp.series('build', function () {
	browserSync.init({
		server: "./",
		open: false,
		port: 80,
		ui: false,
		logLevel: "error"
	}, function() {
        console.log('--------------------------------------------------');
        console.log('Open your app at: http://localhost:8080');
        console.log('--------------------------------------------------');
    });
	gulp.watch(htmlSources).on('change', browserSync.reload);
	gulp.watch(sassSources, gulp.series(css));
	gulp.watch(jsSources, gulp.series(scripts));
	gulp.watch(jsVendorSources, gulp.series(jsVendor));
	gulp.watch(experimentalSources, gulp.series(experimental));
}));

// bs, Compiles Sass, autoprefixes, minifies, and creates sourcemaps
function css() {
	return gulp.src(sassSources)
		.pipe(sourcemaps.init())
		.pipe(sass({
			importer: magicImporter()
		}).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(gulpif(function (file) {
			return /themes[\/\\]custom/.test(file.path);
		}, replace(/(?:\.\.\/)?assets\/icons\//g, '../../../assets/icons/')))
		.pipe(cleanCSS({
			level: 1
		}))
		.pipe(sourcemaps.write('maps'))
		.pipe(gulp.dest('./css'))
		.pipe(browserSync.stream());
}
exports.css = css;


var jshintSuccess = function (file) {
	return file.jshint.success;
};

// bs, Concats, minifies, sourcemaps 
function scripts() {
	return gulp.src(jsSources)
		.pipe(sourcemaps.init())
		.pipe(jshint(jshintrc))
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(jshint.reporter(jshintReporter))
		.pipe(gulpif(jshintSuccess, uglify()))
		.pipe(concat('lat.js'))
		.pipe(sourcemaps.write('maps'))
		.pipe(gulp.dest('./js/'))
		.pipe(browserSync.stream());
}
exports.scripts = scripts;


function jsVendor() {
	return gulp.src(jsVendorSources)
		.pipe(gulp.dest('./js/vendor/'))
		.pipe(browserSync.stream());
}
exports.scripts = jsVendor;


function experimental() {
	return gulp.src(experimentalSources)
		.pipe(sourcemaps.init())
		.pipe(jshint(jshintrc))
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(jshint.reporter(jshintReporter))
		.pipe(gulpif(jshintSuccess, uglify()))
		.pipe(concat('experimental.js'))
		.pipe(sourcemaps.write('maps'))
		.pipe(gulp.dest('./js/'))
		.pipe(browserSync.stream());
}
exports.experimental = experimental;
// TODO: Look into using pump instead of pipe as per gulp-uglify docs
