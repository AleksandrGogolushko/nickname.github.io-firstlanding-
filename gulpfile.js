const gulp = require("gulp");
const htmlmin = require("gulp-htmlmin");
const shorthand = require("gulp-shorthand");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const browserSync = require("browser-sync").create();
const postcss     = require('gulp-postcss');
const reporter    = require('postcss-reporter');
const stylelint   = require('stylelint');
const terser = require("gulp-terser");
const del = require("del");

//all files
const cssFiles = ["./src/css/style.css"];
const jsFiles = ["./src/js/main.js"];
const images = ["./src/images/*"];

// Task for HTML
function index(){
    return gulp.src('*.html')
    .pipe(htmlmin())
    .pipe(gulp.dest("./build"))
}

//Task for CSS
function styles(){
    var stylelintConfig = {
        "rules": {
          "block-no-empty": true,
          "color-no-invalid-hex": true,
          "declaration-colon-space-after": "always",
          "declaration-colon-space-before": "never",
          "function-comma-space-after": "always",
          "media-feature-colon-space-after": "always",
          "media-feature-colon-space-before": "never",
          "media-feature-name-no-vendor-prefix": true,
          "max-empty-lines": 5,
          "number-leading-zero": "never",
          "number-no-trailing-zeros": true,
          "property-no-vendor-prefix": true,
          "selector-list-comma-space-before": "never",
          "selector-list-comma-newline-after": "always",
          "string-quotes": "double",
          "value-no-vendor-prefix": true
        }
      }
      var processors = [
        stylelint(stylelintConfig),
        reporter({
          clearMessages: true,
          throwError: true
        })
      ];
      return gulp.src(cssFiles)
      //проверяем правильность CSS
        .pipe(postcss(processors))
      //сокращаем CSS свойства
        .pipe(shorthand())
      //расстановка префиксов для старых браузеров
        .pipe(autoprefixer({
            cascade: false
        }))
      //минификация CSS
        .pipe(cleanCSS({level: 2}))
        .pipe(gulp.dest("./build/css"))
        .pipe(browserSync.stream());
}

//Task for JS
function scripts(){
    return gulp.src(jsFiles)
    //конвертируем код в более старую версию
    .pipe(babel({
        presets: ['@babel/env']
    }))
    // минификация и оптимизация 
    .pipe(terser())
    .pipe(gulp.dest("./build/js"))
    .pipe(browserSync.stream());

}

//Task for Image
function image(){
    return gulp.src(images)
    .pipe(imagemin({
        progressive: true
      }))
    .pipe(gulp.dest("./build/images"))

}

function watch(){
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    //следит за css файлами
    gulp.watch("./src/css/**/*.css",styles)
    //следит за js файлами
    gulp.watch("./src/js/**/*.js",scripts)
    //следит за изображениями
    gulp.watch("./src/images/*",image)
    //показывает изменение в браузере
    gulp.watch("./*.html").on('change', browserSync.reload); 
}

function clean(){
    return del(["build/*"])
}
//HTML
gulp.task("index",index);
//CSS
gulp.task("styles",styles);
//JS
gulp.task("scripts",scripts);
//Image
gulp.task("image",image);
//Отслеживает изменение
gulp.task("watch",watch);
//Очищаем корневую папку build
gulp.task("del",clean);
//final
//Удаляем все в папке build и запускаем таски для HTML, CSS, JS, images.
gulp.task("build",gulp.series(clean, gulp.parallel(index,styles,scripts,image)));

gulp.task("dev",gulp.series("build","watch"));

