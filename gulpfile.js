const { src, dest, watch, series, task } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rimraf = require('gulp-rimraf');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const ts = require("gulp-typescript");

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
    return src([wwwrootpath.images + '/*', wwwrootpath.fonts + '/*', wwwrootpath.js + '/*', wwwrootpath.css + '/*'], { read: false })
        .pipe(rimraf());
});

// copy govuk-frontend-toolkit to wwwroot
task('private:copy_gov_files', () => {
    src(govpath.govukimage)
        .pipe(dest(wwwrootpath.images));

    src(govpath.govukfonts)
        .pipe(dest(wwwrootpath.fonts));

    src('./node_modules/govuk-frontend/govuk/all.js')
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(wwwrootpath.js));

    return src(['./scss/**/frontend.scss'])
        .pipe(sass({ outputStyle: 'compressed', quietDeps: true }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(wwwrootpath.css));
});

task('private:compile_sass', () => {
    return src(['./scss/**/*.scss', '!./scss/**/frontend.scss'])
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest('./wwwroot/css'));
});

task('private:minify_scripts', () => {
    return src(['./script/**/*.js'])
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest('./wwwroot/js'));
});

task("private:typescript", function () {
    return src('script/**/*.ts')
        .pipe(ts())
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest('./wwwroot/js'));
});

// watch scss files for changes excluding frontend toolkit, 
task('private:watch', () => {
    watch(['./scss/**/*.scss'], series(['private:compile_sass']));
    watch(['./script/**/*.js'], series(['private:minify_scripts']));
    watch(['./script/**/*.ts'], series(['private:typescript']));
});

// default tasks - 
task('run:dev', series(['private:copy_gov_files', 'private:compile_sass', 'private:minify_scripts', 'private:typescript', 'private:watch']));