import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
import autoprefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import cleanCSS from 'gulp-clean-css';
import browserSyncLib from 'browser-sync';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import jshint from 'gulp-jshint';
import gulpIf from 'gulp-if';
import replace from 'gulp-replace';
const config = {
	sassSources: [
		"source/scss/themes/**/*.scss",
		"source/scss/**/*.scss",
		"source/experimental/scss/**/*.scss"
	],
	jsSources: [
		"source/js/vendor/jquery-3.1.1.min.js",
		"source/js/features/*.js",
		"!source/js/features/-WIP-*.js"
	],
	jsVendorSources: [
		"source/js/vendor/*.js"
	],
	experimentalSources: [
		"source/experimental/js/*.js",
		"!source/experimental/js/-WIP-*.js"
	],
	htmlSources: [
		"index.html",
		"html/*.html"
	]
};

const sass = gulpSass(dartSass);
const browserSync = browserSyncLib.create();
const jshintReporter = 'default'; // Consider stylish
import fs from 'fs';
const jshintrc = JSON.parse(fs.readFileSync('./.jshintrc').toString());

const sassSources = config.sassSources;
const jsSources = config.jsSources;
const jsVendorSources = config.jsVendorSources;
const experimentalSources = config.experimentalSources;
const htmlSources = config.htmlSources;

export const build = gulp.series(css, scripts, jsVendor, experimental);

export const watch = gulp.series(build, function () {
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
});

// bs, Compiles Sass, autoprefixes, minifies, and creates sourcemaps
export function css() {
       return gulp.src(sassSources)
	       .pipe(sourcemaps.init())
	       .pipe(sass().on('error', sass.logError))
	       .pipe(autoprefixer({ cascade: false }))
	       .pipe(gulpIf(function (file) {
		       return /themes[\/\\]custom/.test(file.path);
	       }, replace(/(?:\.\.\/)?assets\/icons\//g, '../../../assets/icons/')))
	       .pipe(cleanCSS({
		       level: 1
	       }))
		   .pipe(sourcemaps.write('maps', {
				mapSources: sourcePath => {
					// Map source paths for scss and experimental scss
					const match = sourcePath.match(/source[\\/](experimental[\\/]scss|scss)[\\/](.*)/);
					if (match) {
						const isExperimental = match[1].startsWith('experimental');
						return (isExperimental ? '../../scss/' : '../') + match[2];
					}
					return sourcePath;
				}
			}))
	       .pipe(gulp.dest('./css'))
	       .pipe(browserSync.stream());
}


const jshintSuccess = (file) => file.jshint.success;

// bs, Concats, minifies, sourcemaps 
export function scripts() {
       return gulp.src(jsSources)
       	.pipe(sourcemaps.init())
       	.pipe(jshint(jshintrc))
       	.pipe(babel({
       		presets: ['@babel/env']
       	}))
       	.pipe(jshint.reporter(jshintReporter))
       	.pipe(gulpIf(jshintSuccess, uglify({
       		output: { semicolons: true }
       	})))
       	.pipe(concat('lat.js'))
       	.pipe(sourcemaps.write('maps'))
       	.pipe(gulp.dest('./js/'))
       	.pipe(browserSync.stream());
}


export function jsVendor() {
       return gulp.src(jsVendorSources)
	       .pipe(gulp.dest('./js/vendor/'))
	       .pipe(browserSync.stream());
}


export function experimental() {
       return gulp.src(experimentalSources)
       	.pipe(sourcemaps.init())
       	.pipe(jshint(jshintrc))
       	.pipe(babel({
       		presets: ['@babel/env']
       	}))
       	.pipe(jshint.reporter(jshintReporter))
       	.pipe(gulpIf(jshintSuccess, uglify({
       		output: { semicolons: true }
       	})))
       	.pipe(concat('experimental.js'))
       	.pipe(sourcemaps.write('maps'))
       	.pipe(gulp.dest('./js/'))
       	.pipe(browserSync.stream());
}
// TODO: Look into using pump instead of pipe as per gulp-uglify docs
