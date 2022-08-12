const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rimraf = require('gulp-rimraf');
const minify = require('gulp-minify');

const { series, task } = gulp;

const govpath = {
    govukimage: './node_modules/govuk-frontend/govuk/assets/images/*',
    govukfonts: './node_modules/govuk-frontend/govuk/assets/fonts/*',
    govukjs: './node_modules/govuk-frontend/govuk/all.js',
};

const wwwrootpath = {
    images: './wwwroot/assets/images',
    fonts: './wwwroot/assets/fonts',
    js: './wwwroot/assets/js',
    css: './wwwroot/assets/css'
}

// Remove copied and compiled files from wwwroot
task('run:clean', function () {
    return gulp.src([wwwrootpath.images + '/*', wwwrootpath.fonts + '/*', wwwrootpath.js + '/*', wwwrootpath.css + '/*'], { read: false })
        .pipe(rimraf());
});

// copy govuk-frontend-toolkit to wwwroot
task('private:copyGovTask', () => {
    gulp.src(govpath.govukimage)
        .pipe(gulp.dest(wwwrootpath.images));

    gulp.src(govpath.govukfonts)
        .pipe(gulp.dest(wwwrootpath.fonts));

    gulp.src('./node_modules/govuk-frontend/govuk/all.js')
        .pipe(minify({ ext: { min: '.js' }, noSource: true }))
        .pipe(gulp.dest(wwwrootpath.js));

    return gulp.src(['./scss/**/frontend.scss'])
        .pipe(sass({ outputStyle: 'compressed', quietDeps: true }))
        .pipe(gulp.dest(wwwrootpath.css));
});

task('private:sassTask', () => {
    return gulp.src(['./scss/**/*.scss', '!./scss/**/frontend.scss'])
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(gulp.dest('./wwwroot/css'));
});

task('private:jsTask', () => {
    return gulp.src(['./javascript/**/*.js'])
        .pipe(minify({ ignoreFiles: ['.min.js'], noSource: true }))
        .pipe(gulp.dest('./wwwroot/js'));
});

// watch scss files for changes excluding frontend toolkit, 
task('private:watchTask', () => {
    gulp.watch(['./scss/**/*.scss'], series(['private:sassTask']));
    gulp.watch(['./javascript/**/*.js'], series(['private:jsTask']));
});

// default tasks - 
task('private:initTask', series(['private:copyGovTask', 'private:sassTask', 'private:jsTask']));
task('run:dev', series(['private:initTask', 'private:watchTask']));