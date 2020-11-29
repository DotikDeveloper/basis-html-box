let projectFolder = require("path").basename(__dirname);
let sourceFolder = "#src";

let fs = require('fs');

let path = {
    build: {
        html: projectFolder + "/",
        css: projectFolder + "/css/",
        js: projectFolder + "/js/",
        jsmap: projectFolder + "/js/",
        doc: projectFolder + "/doc/",
        img: projectFolder + "/img/",
        fonts: projectFolder + "/fonts/",
    },
    src: {
        html: [sourceFolder + "/**/*.html", "!" + sourceFolder + "/_*.html"],
        css: sourceFolder + "/scss/style.scss",
        js: sourceFolder + "/js/bundle.js",
        jsmap: sourceFolder + "/js/bundle.js.map",
        doc: sourceFolder + "/doc/*.pdf",
        img: sourceFolder + "/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
        fonts: sourceFolder + "/fonts/**/*.ttf",
    },
    watch: {
        html: sourceFolder + "/**/*.html",
        css: sourceFolder + "/scss/**/*.scss",
        js: sourceFolder + "/js/**/*.js",
        jsmap: sourceFolder + "/js/bundle.js.map",
        doc: sourceFolder + "/doc/*.pdf",
        img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + projectFolder + "/"
};

let {
    src,
    dest
} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileincluder = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    groupMedia = require('gulp-group-css-media-queries'),
    cleanCss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    webpcss = require("gulp-webp-css"),
    svgSprite = require('gulp-svg-sprite'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    fonter = require('gulp-fonter');

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + projectFolder + "/"
        },
        port: 3000,
        notify: false

    });
}

function html(params) {
    return src(path.src.html)
        .pipe(fileincluder())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

function css(params) {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: 'expanded' // сжатие файлов
            })
        )
        .pipe(groupMedia())
        .pipe(autoprefixer({
            grid: true,
            overrideBrowserslist: ['last 5 versions'],
            cascade: true
        }))
        .pipe(webpcss())
        .pipe(dest(path.build.css))
        .pipe(cleanCss())
        .pipe(
            rename({
                extname: '.min.css'
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}

function js(params) {
    return src(path.src.js)
        .pipe(fileincluder())
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: '.min.js'
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

function jsmap(params) {
    return src(path.src.jsmap)
        .pipe(dest(path.build.jsmap));
}

function doc(params) {
    return src(path.src.doc)
        .pipe(dest(path.build.doc));
}

function images(params) {
    return src(path.src.img)
        .pipe(webp({
            quality: 70
        }))
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            interlaced: true,
            optimizationLevel: 3 // 0 to 7
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());
}

function fonts(params) {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

gulp.task('otf2ttf', function () { // запускается отдельно через командную строку svgSprite
    return src([sourceFolder + '/fonts/*.otf'])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(sourceFolder + '/fonts/'));
});

gulp.task('svgSprite', function () { // запускается отдельно через командную строку svgSprite
    return gulp.src([sourceFolder + '/iconsprite/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../icons/icons.svg', //sprite file name
                    //example: true // включить настройку если нужен файл с примерами иконок 
                }
            }
        }));
});

function fontsStyle(params) {
    let fileContent = fs.readFileSync(sourceFolder + '/scss/_fonts.scss');
    if (fileContent == '') {
        fs.writeFile(sourceFolder + '/scss/_fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, 
            function (err, items) {
                if (items) {
                    let cFontname;
                    for (let i = 0; i < items.length; i++) {
                        let fontname = items[i].split('.');
                        fontname = fontname[0];
                        if (cFontname !== fontname) {
                            fs.appendFile(sourceFolder + '/scss/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400","normal");\r\n', cb);
                        }
                        cFontname = fontname;

                    }
                }
            }
            );
        }
    }


    function cb() {

    }

    function watchFiles(params) {
        gulp.watch([path.watch.html], html);
        gulp.watch([path.watch.css], css);
        gulp.watch([path.watch.js], js);
        gulp.watch([path.watch.img], images);
        gulp.watch([path.watch.doc], doc);
    }

    function clean(params) {
        return del(path.clean);
    }

    let build = gulp.series(clean, gulp.parallel(js, jsmap, doc, css, html, images, fonts), fontsStyle);
    let watch = gulp.parallel(build, watchFiles, browserSync);

    exports.fontsStyle = fontsStyle;
    exports.fonts = fonts;
    exports.images = images;
    exports.js = js;
    exports.jsmap = jsmap;
    exports.doc = doc;
    exports.css = css;
    exports.html = html;
    exports.build = build;
    exports.watch = watch;
    exports.default = watch;