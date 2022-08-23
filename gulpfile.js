const { src, dest, watch, series, task } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rimraf = require('gulp-rimraf');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const ts = require("gulp-typescript");
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');

const isDev = () => {
    return !!process.argv.find(el => el === '--config-dev');
};

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
};

const jsFiles =
{
    "bundle1": ['script/hello.ts', 'script/goodbye.ts'],
    "bundle2": ['script/add2numbers.ts', 'script/date-time.ts']
};

let tsProject = ts.createProject('tsconfig.json');
let defaultTasks = Object.keys(jsFiles);

defaultTasks.forEach(function (libName) {
    task('scripts:' + libName, function () {
        return src(jsFiles[libName])
            .pipe(gulpif(isDev(), sourcemaps.init()))
            .pipe(tsProject())
            .pipe(concat(libName + '.js'))
            .pipe(uglify())
            .pipe(rename({ suffix: '.min' }))
            .pipe(gulpif(isDev(), sourcemaps.write()))
            .pipe(dest('./wwwroot/js'));
    });
});

task('private:bundle_typescript',
    series(
        defaultTasks.map(function (name) { return 'scripts:' + name; })
    )
);

// Remove copied and compiled files from wwwroot
task('clean', function () {
    return src([wwwrootpath.images + '/*', wwwrootpath.fonts + '/*', wwwrootpath.js + '/*', wwwrootpath.css + '/*', './wwwroot/js/*', './wwwroot/css/*'], { read: false })
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

task('private:minify_javascript', () => {
    return src(['./script/**/*.js'])
        .pipe(gulpif(isDev(), sourcemaps.init()))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulpif(isDev(), sourcemaps.write()))
        .pipe(dest('./wwwroot/js'));
});

// watch scss files for changes excluding frontend toolkit, 
task('private:watch', () => {
    watch(['./scss/**/*.scss'], series(['private:compile_sass']));
    watch(['./script/**/*.js'], series(['private:minify_javascript']));
    watch(['./script/**/*.ts'], series(['private:bundle_typescript']));
});

// default tasks - 
task('default', series(['private:copy_gov_files', 'private:compile_sass', 'private:minify_javascript', 'private:bundle_typescript', 'private:watch']));