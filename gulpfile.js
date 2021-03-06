var gulp = require('gulp'),
    rollup = require('rollup'),
    resolve = require('rollup-plugin-node-resolve'),
    vue = require('rollup-plugin-vue'),
    replace = require('rollup-plugin-replace'),
    babel = require('rollup-plugin-babel'),
    imagemin = require('gulp-imagemin'),
    fs = require("fs"),
    del = require('del'),
    rename = require("gulp-rename"),
    uglify = require('gulp-uglify'),
    path = require('path');

var paths = {
    scripts: ['src/**/*.js', 'src/**/*.vue'],
    assets: 'src/assets/**/*'
};

var target = {
    path: "./dist/",
    js: "./dist/js/",
    styles: "./dist/styles/",
    assets: "./dist/assets/"
}

var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;

//使用时第二个参数可以忽略  
function mkdir(dirpath, dirname) {
    //判断是否是第一次调用  
    if (typeof dirname === "undefined") {
        if (fs.existsSync(dirpath)) {
            return;
        } else {
            mkdir(dirpath, path.dirname(dirpath));
        }
    } else {
        //判断第二个参数是否正常，避免调用时传入错误参数  
        if (dirname !== path.dirname(dirpath)) {
            mkdir(dirpath);
            return;
        }
        if (fs.existsSync(dirname)) {
            fs.mkdirSync(dirpath)
        } else {
            mkdir(dirname, path.dirname(dirname));
            fs.mkdirSync(dirpath);
        }
    }
}

gulp.task("clean", function () {
    del(["dist"])
})

gulp.task('assets', function () {
    return gulp.src(paths.assets)
        // Pass in options to the task
        .pipe(imagemin({ optimizationLevel: 5 }))
        .pipe(gulp.dest(target.assets))
        .pipe(browserSync.stream());
});

gulp.task("index", function () {
    return gulp.src("index.html")
        .pipe(gulp.dest(target.path))
        .pipe(browserSync.stream());
})

gulp.task("vue", function () {
    mkdir(target.styles)
    mkdir(target.js)
    return rollup.rollup({
        entry: "./src/main.js",
        plugins: [
            vue({
                css(style, styles, compiler) {
                    fs.writeFileSync(target.styles + 'bundle.css', style)
                }
            }),
            replace({
                'process.env.NODE_ENV': JSON.stringify('development'),
                'process.env.VUE_ENV': JSON.stringify('browser')
            }),
            resolve(),
            babel()
        ],
    }).then(function (bundle) {
        bundle.write({
            format: "umd",
            moduleName: "library",
            dest: target.js + "bundle.js",
            sourceMap: true
        });
    })
})

gulp.task("js", ["vue"], function(){
    return gulp.src(target.js + "bundle.js")
        .pipe(uglify())
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest(target.js))
        .pipe(browserSync.stream());
})

gulp.task('build', ["assets", "index", "js"], function () {
    
});

gulp.task("watch", function () {
    browserSync.init({
        server: target.path
    });
    gulp.watch(paths.scripts, ['js']);
    gulp.watch(paths.assets, ['assets']);
    gulp.watch("index.html", ["index"])
    gulp.watch("*.html").on('change', reload);
})

gulp.task("default", ["build", "watch"])