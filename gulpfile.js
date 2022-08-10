const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rimraf = require('gulp-rimraf');

const { series, task, parallel } = gulp;

let govpath = {
    govukimage: './node_modules/govuk-frontend/govuk/assets/images/*',
    govukfonts: './node_modules/govuk-frontend/govuk/assets/fonts/*',
    govukjs: './node_modules/govuk-frontend/govuk/all.js',
};

let wwwrootpath = {
    images: './wwwroot/assets/images',
    fonts: './wwwroot/assets/fonts',
    js: './wwwroot/assets/js',
    css: './wwwroot/assets/css'
}
// Remove copied and compiled files from wwwroot
task('clean', function () {
    return gulp.src([wwwrootpath.images + '/*', wwwrootpath.fonts + '/*', wwwrootpath.js + '/*', wwwrootpath.css + '/*'], { read: false })
        .pipe(rimraf());
});

// copy govuk-frontend-toolkit images to public folder
task('copyGovImageTask', () => {
    return gulp.src(govpath.govukimage)
        .pipe(gulp.dest(wwwrootpath.images));
});

// copy govuk-frontend-toolkit image to public folder
task('copyGovFontTask', () => {
    return gulp.src(govpath.govukimage)
        .pipe(gulp.dest(wwwrootpath.fonts));
});

task('copyGovJavascriptTask', () => {
    return gulp.src('./node_modules/govuk-frontend/govuk/all.js')
        .pipe(gulp.dest(wwwrootpath.js));
});

task('copyGovSassTask', () => {
    return gulp.src(['./scss/**/frontend.scss'])
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(gulp.dest(wwwrootpath.css));
});

task('sassTask', () => {
    return gulp.src(['./scss/**/*.scss', '!./scss/**/frontend.scss'])
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(gulp.dest('./wwwroot/css'));
});

// watch scss files for changes excluding frontend toolkit, 
task('watchTask', () => {
    gulp.watch(['./scss/**/*.scss', '!./scss/**/frontend.scss'], series(['sassTask']));
});

// default tasks - 
task('initTask', parallel(['copyGovSassTask', 'sassTask', 'copyGovImageTask', 'copyGovFontTask', 'copyGovJavascriptTask']));
task('run:dev', series(['clean', 'initTask', 'watchTask']));