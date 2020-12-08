const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const gulpWebp = require("gulp-webp");
const imagemin = require("gulp-imagemin");

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Images

const webp = () => {
  return gulp.src("source/img/*.{jpg, png}")
  .pipe(gulpWebp())
  .pipe(gulp.dest("source/img/"));
}

const optimizeImages = () => {
  return gulp.src("source/img/*.{jpg, png, svg}")
  .pipe(imagemin([
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("source/img"));
}

exports.imagemin = optimizeImages;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'source',
      index: 'photo.html'
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
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  styles, webp, server, watcher
);
