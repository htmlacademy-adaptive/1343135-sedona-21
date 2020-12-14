const gulp = require("gulp");
const del = require("del");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const gulpWebp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const svgStore = require("gulp-svgstore");
const minifyJS = require("gulp-minify");
const sync = require("browser-sync").create();

// Clear

const clear = () => {
  return del("build/");
}

// HTML

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build/"))
    .pipe(sync.stream());
}

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Copy

const copyFonts = () => {
  return gulp.src("source/fonts/*")
    .pipe(gulp.dest("build/fonts/"))
    .pipe(sync.stream());
}

const copyImages = () => {
  return gulp.src("source/img/*", {ignore: "source/img/sprite/"})
    .pipe(gulp.dest("build/img/"))
    .pipe(sync.stream());
}

const copy = gulp.parallel(copyFonts, copyImages);

// Images

const webp = () => {
  return gulp.src("source/img/*.{jpg, png}")
  .pipe(gulpWebp())
  .pipe(gulp.dest("build/img/"));
}

const optimizeImages = () => {
  return gulp.src("source/img/*")
  .pipe(imagemin([
    imagemin.mozjpeg({ quality: 75, progressive: true }),
    imagemin.optipng({ optimizationLevel: 3 }),
    imagemin.svgo({
      plugins: [
        { removeViewBox: false },
        { removeDimensions: true }
      ]
    })
  ]))
  .pipe(gulp.dest("build/img/"));
}

exports.imagemin = optimizeImages;

// SVG sprite

const sprite = () => {
  return gulp.src("source/img/sprite/*.svg")
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [
          { removeXMLNS: true },
          { removeViewBox: false },
          { removeDimensions: true }
        ]
      })
    ]))
    .pipe(svgStore({ inlineSvg: true }))
    .pipe(gulp.dest("build/img/"))
    .pipe(sync.stream());
}

exports.sprite = sprite;

// JS

const js = () => {
  return gulp.src("source/js/*.js")
    .pipe(minifyJS({
      ext: { min: ".min.js" },
      noSource: true,
      preserveComments: "all"
    }))
    .pipe(gulp.dest("build/js/"))
    .pipe(sync.stream());
}

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/*.html", html);
  gulp.watch("source/sass/**/*.scss", styles);
  gulp.watch("source/*.js", js);
  gulp.watch("source/fonts/*", copyFonts);
  gulp.watch("source/img/*", copyImages);
  gulp.watch("source/img/sprite/*.svg", sprite);
}

// Start

exports.default = gulp.series(
  clear,
  gulp.parallel(html, styles, copy, webp, sprite, js),
  server,
  watcher
);

// Build

exports.build = gulp.series(
  clear,
  gulp.parallel(html, styles, copyFonts, optimizeImages, webp, sprite, js)
);
