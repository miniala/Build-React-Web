var gulp         = require('gulp');
var uglify       = require('gulp-uglify');
var source       = require('vinyl-source-stream');
var browserify   = require('browserify');
var watchify     = require('watchify');
var reactify     = require('reactify');
var streamify    = require('gulp-streamify');
var connect      = require('gulp-connect');
var rename       = require('gulp-rename');
var clean        = require('gulp-clean');
var base64       = require('gulp-base64');

// 路径
var paths = {
	html       : './public/html',
	local      : './public/local',
	staging    : './public/staging',
	production : './public/production',
}

// 入口
var entries = 'app';

// 公用模块，打包至bundle-require
var external = ['react', 'react-dom', 'react-router'];

// Liveload
gulp.task('connect', function () {
	connect.server({
		root: './public',
		livereload: true
	})
})

// 监视，游览器实时更新，打包到 staging 目录
gulp.task('watch', function () {
	// Css
	gulp.watch([paths.local + '/**/*.css'], function () {
		gulp.src(paths.local + '/**/*.css')
			.on('error', function(err){console.log(err.message);})
			.on('end', function(){ console.log('Updated Css: ' + new Date()); })
			.pipe(autoprefixer('last 2 versions'))
			.pipe(gulp.dest(paths.staging))
			.pipe(connect.reload())
	})
	// Js
	var b = browserify({
		entries      : [paths.local + '/js/' + entries + '.js'],
		transform    : [reactify],
		debug        : true,
		cache        : {},
		packageCache : {},
		fullPaths    : true,
		plugin       : [watchify]
	})

	var bundle = function () {
		b.external(external);
		b.bundle()
			.on('error', function(err){console.log(err.message);})
			.on('end', function(){ console.log('Updated Js: ' + entries + ' ' + new Date()); })
			.pipe(source('bundle-' + entries + '.js'))
			.pipe(gulp.dest(paths.staging + '/js/bundle-' + entries))
			.pipe(connect.reload())
	}

	b.on('update', function () {
		bundle()
	})

	bundle();
})

// 开发环境
gulp.task('staging', function () {
	var b = browserify({
		entries      : [paths.local + '/js/' + entries + '.js'],
		transform    : [reactify],
		debug        : true,
		cache        : {},
		packageCache : {},
		fullPaths    : true,
	})
	// 来自公用包模块
	b.external(external);
	b.bundle()
		.on('error', function(err){console.log(err.message);})
		.on('end', function(){ console.log('Updated Js: ' + entries + ' ' + new Date()); })
		.pipe(source('bundle-' + entries + '.js'))
		.pipe(gulp.dest(paths.staging + '/js/bundle-' + entries))
})

// 公用 require 包
gulp.task('require-staging', function () {
	var b = browserify({
		require : external
	})
	b.bundle()
		.on('error', function(err){console.log(err.message);})
		.on('end', function(){ console.log('Updated Js: require ' + new Date()); })
		.pipe(source('bundle-require.js'))
		.pipe(gulp.dest(paths.staging + '/js/bundle-require'))
})

// 生产环境：app 包
gulp.task('production', function () {
	// 清除该文件夹文件
	gulp.src(paths.production + '/js/bundle-' + entries + '/*.js', {read: false})
		.pipe(clean());
	// 重命名，压缩
	gulp.src(
		paths.staging + '/js/bundle-' + entries + '/bundle-' + entries + '.js'
	)
	  .pipe(rename('bundle-' + entries + '-min.js'))
	  .pipe(streamify(uglify()))
	  .pipe(gulp.dest(paths.production + '/js/bundle-' + entries));
})

// 生产环境：公用 require 包 
gulp.task('require-production', function () {
	// 清除该文件夹文件
	gulp.src(paths.production + '/js/bundle-require/*.js', {read: false})
		.pipe(clean());
	// 重命名，压缩
	gulp.src(
		paths.staging + '/js/bundle-require/bundle-require.js'
	)
	  .pipe(rename('bundle-require-min.js'))
	  .pipe(streamify(uglify()))
	  .pipe(gulp.dest(paths.production + '/js/bundle-require'));
})

gulp.task('default', ['connect', 'watch']);
