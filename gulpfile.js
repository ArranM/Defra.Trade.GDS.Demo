const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rimraf = require('gulp-rimraf');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const ts = require("gulp-typescript");

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
task('private:copy_gov_files', () => {
    gulp.src(govpath.govukimage)
        .pipe(gulp.dest(wwwrootpath.images));

    gulp.src(govpath.govukfonts)
        .pipe(gulp.dest(wwwrootpath.fonts));

    gulp.src('./node_modules/govuk-frontend/govuk/all.js')
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(wwwrootpath.js));

    return gulp.src(['./scss/**/frontend.scss'])
        .pipe(sass({ outputStyle: 'compressed', quietDeps: true }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(wwwrootpath.css));
});

task('private:compile_sass', () => {
    return gulp.src(['./scss/**/*.scss', '!./scss/**/frontend.scss'])
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./wwwroot/css'));
});

task('private:minify_scripts', () => {
    return gulp.src(['./script/**/*.js'])
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./wwwroot/js'));
});

task("private:typescript", function () {
    return gulp.src('script/**/*.ts')
        .pipe(ts())
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./wwwroot/js'));
});

// watch scss files for changes excluding frontend toolkit, 
task('private:watch', () => {
    gulp.watch(['./scss/**/*.scss'], series(['private:compile_sass']));
    gulp.watch(['./script/**/*.js'], series(['private:minify_scripts']));
    gulp.watch(['./script/**/*.ts'], series(['private:typescript']));
});

// default tasks - 
task('run:dev', series(['private:copy_gov_files', 'private:compile_sass', 'private:minify_scripts', 'private:typescript', 'private:watch']));