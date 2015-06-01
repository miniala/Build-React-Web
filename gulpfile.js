var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var streamify = require('gulp-streamify');
var connect = require('gulp-connect');
var stylus = require('gulp-stylus');

var path = {
  SRC_HTML: 'src/html/index.html',
  DEST_HTML: 'dist/index.html',
  MINIFIED_OUT: 'build.min.js',
  OUT: 'build.js',
  DEST: 'dist',
  DEST_BUILD: 'dist/build/js',
  DEST_SRC: 'dist/src/js',
  ENTRY_POINT: './src/js/app.js',
  SRC_CSS: './src/css/',
  DEST_BUILD_CSS: 'dist/build/css',
  DEST_SRC_CSS: 'dist/src/css',
  OUT_CSS: 'style.css',
  MINIFIED_OUT_CSS: 'style.min.css'
};

// Liveload
gulp.task('connect', function() {
  connect.server({
    root: './',
    livereload: true
  });
});

// reload when js change, use build.js
gulp.task('js', function() {
  gulp.src(path.DEST_SRC + '/*.js')
    .pipe(connect.reload());
});
// reload when css change, use style.css
gulp.task('css', function() {
  gulp.src(path.DEST_SRC_CSS + '/*.css')
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch([path.DEST_SRC + '/*.js'], ['js']); // watch for reload
  gulp.watch([path.DEST_SRC_CSS + '/*.css'], ['css']); // watch for reload

  // watch && transform styl to css
  gulp.watch(['./src/css/style.styl'], function() {
    gulp.src('./src/css/style.styl')
      .pipe(stylus({ set:['compress', path.OUT_CSS] }))
      .pipe(gulp.dest(path.DEST_SRC_CSS))
  });

  // watch && transform jsx to js
  var watcher  = watchify(browserify({
    entries: [path.ENTRY_POINT],
    transform: [reactify],
    debug: true,
    cache: {}, packageCache: {}, fullPaths: true
  }));

  watcher.on('update', function () {
    watcher.bundle()
      .pipe(source(path.OUT))
      .pipe(gulp.dest(path.DEST_SRC))
      console.log('Updated Js');
  })
    .bundle()
    .pipe(source(path.OUT))
    .pipe(gulp.dest(path.DEST_SRC));
});

gulp.task('build', function(){
  browserify({
    entries: [path.ENTRY_POINT],
    transform: [reactify],
  })
    .bundle()
    .pipe(source(path.MINIFIED_OUT))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest(path.DEST_BUILD));

  // css
  gulp.src('./src/css/style.styl')
      .pipe(stylus({compress: true, set:['compress', path.MINIFIED_OUT_CSS] }))
      .pipe(gulp.dest(path.DEST_BUILD_CSS))
});

gulp.task('replaceBuildJs', function(){
  gulp.src(path.SRC_HTML)
    .pipe(htmlreplace({
      'js': 'build/js/' + path.MINIFIED_OUT
    }))
    .pipe(gulp.dest(path.DEST));
});

gulp.task('replaceSrcJs', function(){
  gulp.src(path.SRC_HTML)
    .pipe(htmlreplace({
      'js': 'src/js/' + path.OUT
    }))
    .pipe(gulp.dest(path.DEST));
});

gulp.task('production', ['replaceBuildJs', 'build']);

gulp.task('default', ['connect', 'watch', 'replaceSrcJs']);