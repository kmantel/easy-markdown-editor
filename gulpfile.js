'use strict';

var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var terser = require('gulp-terser');
var concat = require('gulp-concat');
var header = require('gulp-header');
var buffer = require('vinyl-buffer');
var pkg = require('./package.json');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');

var banner = ['/**',
    ' * <%= pkg.name %> v<%= pkg.version %>',
    ' * Copyright <%= pkg.author %>',
    ' * @link https://github.com/ionaru/easy-markdown-editor',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');


var css_files = [
    './node_modules/codemirror/lib/codemirror.css',
    './node_modules/codemirror/addon/dialog/dialog.css',
    './src/css/*.css',
    './node_modules/codemirror-spell-checker/src/css/spell-checker.css',
];

function lint() {
    return gulp.src('./src/js/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

function scripts() {
    return browserify({entries: './src/js/easymde.js', standalone: 'EasyMDE'}).bundle()
        .pipe(source('easymde.min.js'))
        .pipe(buffer())
        .pipe(terser())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
}

function scripts_dev() {
    return browserify({entries: './src/js/easymde.js', standalone: 'EasyMDE'}).bundle()
        .pipe(source('easymde.js'))
        .pipe(buffer())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
}

function styles() {
    return gulp.src(css_files)
        .pipe(concat('easymde.css'))
        .pipe(cleanCSS())
        .pipe(rename('easymde.min.css'))
        .pipe(buffer())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
}

function styles_dev() {
    return gulp.src(css_files)
        .pipe(concat('easymde.css'))
        .pipe(buffer())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
}

// Watch for file changes
function watch() {
    gulp.watch('./src/js/**/*.js', scripts);
    gulp.watch(css_files, styles);
}

function watch_dev() {
    gulp.watch('./src/js/**/*.js', scripts_dev);
    gulp.watch(css_files, styles_dev);
}

var build = gulp.parallel(gulp.series(lint, scripts), styles);
var build_dev = gulp.parallel(gulp.series(lint, scripts_dev), styles_dev);

gulp.task('default', build);
gulp.task('default_dev', build_dev);
gulp.task('watch', gulp.series(build, watch));
gulp.task('watch_dev', gulp.series(build_dev, watch_dev));
gulp.task('lint', lint);
