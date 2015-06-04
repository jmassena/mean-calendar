/* File: gulpfile.js */

/* jshint strict: false */

//TODO: update this to use a json file with config info like
// John Papa's example in his module project
// And while your at it have it minify to a build directory

// packages
var gulp = require('gulp'),
  gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
  karma = require('karma').server,
  protractor = require('gulp-protractor').protractor,
  browserSync = require('browser-sync'),
  nodemon = require('gulp-nodemon'),
  mocha = require('gulp-spawn-mocha'),
  runSequence = require('run-sequence'),
  del = require('del'),
  angularTemplatecache = require('gulp-angular-templatecache'),
  inject = require('gulp-inject'),
  path = require('path');

var paths = {
  css: './src/client/content/*.css',
  img: './src/client/content/img/*.*',
  html: './src/client/app/**/*.html',
  indexHtml: './src/client/index.html',
  js: './src/client/app/**/*.js',
  bower: './bower_components/**',

  // NOTE: I added the maps because I don't like seeing the 404 error for them but I don't think it matters if they are there.
  vendorCss: ['./bower_components/bootstrap/dist/css/bootstrap.css',
    './bower_components/bootstrap/dist/css/bootstrap.css.map',
    './bower_components/bootstrap/dist/css/bootstrap-theme.css',
    './bower_components/bootstrap/dist/css/bootstrap-theme.css.map',

  ],
  vendorJs: ['./bower_components/jquery/dist/jquery.js',
    './bower_components/bootstrap/dist/js/bootstrap.js',
    './bower_components/angular/angular.js',
    './bower_components/angular-ui-router/release/angular-ui-router.js',
    './bower_components/angular-resource/angular-resource.js',
    './bower_components/moment/moment.js',
    './bower_components/angular-cookies/angular-cookies.js'
  ],
  build: './dist/'
};

var fileNames = {
  htmlTemplates: 'templates.js',
  indexHtml: 'index.html'
};

gulp.task('clean', function (cb) {
  return del(['dist'],
    cb);
});
gulp.task('copy-css', ['clean'], function () {
  return gulp
    .src(paths.css)
    .pipe(gulp.dest(paths.build + 'content/'));
});
gulp.task('copy-js', ['clean', 'jshint'], function () {
  return gulp
    .src(paths.js)
    .pipe(gulp.dest(paths.build + 'app/'));
});

gulp.task('copy-vendor-css', ['clean'], function () {
  return gulp
    .src(paths.vendorCss)
    //.pipe(gulp.dest(paths.build + 'bower_components/'));
    .pipe(gulp.dest(function (file) {
      // I am not loving this solution.
      return path.join(paths.build, file.path.substring(
        file.path.indexOf('bower_components'),
        file.path.lastIndexOf('/')));
    }));
});

gulp.task('copy-vendor-js', ['clean'], function () {
  return gulp
    .src(paths.vendorJs)
    //.pipe(gulp.dest(paths.build + 'bower_components/'));
    .pipe(gulp.dest(function (file) {
      // I am not loving this solution.
      return path.join(paths.build, file.path.substring(
        file.path.indexOf('bower_components'),
        file.path.lastIndexOf('/')));
    }));
});

gulp.task('copy-img', ['clean'], function () {
  return gulp
    .src(paths.img)
    .pipe(gulp.dest(paths.build + 'content/img/'));
});

gulp.task('copy-html', ['clean'], function () {
  // NOTE: we don't need this html since we are already loading it in the templates.js file
  //       but for now I will load it for debugging purpose.
  return gulp
    .src(['src/client/**/*.html', '!' + paths.indexHtml])
    .pipe(gulp.dest(paths.build));
});

gulp.task('htmlTemplates', ['clean'], function () {
  return gulp
    .src(['src/client/app/**/*.html', '!' + paths.indexHtml])
    .pipe(angularTemplatecache(fileNames.htmlTemplates, {
      module: 'app',
      standalone: false,
      root: 'app/'
    }))
    .pipe(gulp.dest(paths.build + 'app/'));
});
gulp.task('inject-angular-templates', ['htmlTemplates'], function () {
  // this copies index.html to dist dir and injects template.js ref to it.
  return gulp
    .src(paths.indexHtml)
    .pipe(inject(gulp.src('app/' + fileNames.htmlTemplates, {
      cwd: paths.build,
      read: false
    })))
    .pipe(gulp.dest(paths.build));
});

/*
  file paths are the same in dist as in dev so no need to inject new file path.
  We could do it but then need to maintain order. When we do this for real will
  concattenate all js files in order, minify and save as one file.
  Then we will inject that. Same for css.
*/
// gulp.task('inject-vendor', ['inject-angular-templates', 'copy-vendor-js', 'copy-vendor-css'], function () {
//   // this copies index.html to dist dir and injects template.js ref to it.
//   var injectOpts = {
//     name: 'inject-vendor'
//   };
//   var srcOpts = {
//     cwd: paths.build,
//     read: false
//   };
//
//   var srcFiles = paths.vendorJs.map(function (val) {
//       return 'bower_components/' + path.basename(val);
//     })
//     .concat(
//       paths.vendorCss.map(function (val) {
//         return 'bower_components/' + path.basename(val);
//       }));
//
//   return gulp
//     .src(paths.build + fileNames.indexHtml)
//     .pipe(inject(gulp.src(srcFiles, srcOpts), injectOpts))
//     .pipe(gulp.dest(paths.build));
// });

gulp.task('build', ['htmlTemplates', 'copy-html', 'copy-css', 'copy-vendor-css', 'copy-js', 'copy-vendor-js',
  'copy-img', 'inject-angular-templates'
]);
// gulp.task('build', ['copy-html', 'copy-css', 'copy-img', 'copy-js',
//   'copy-bower-components'
// ]);

// jshint
gulp.task('jshint', function () {
  return gulp.src('src/client/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jshint-watch', function () {
  return gulp.watch(['src/client/**/*.js'], ['jshint']);
});

gulp.task('karma', function (done) {
  return karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done);
});

gulp.task('protractor', function () {
  return gulp.src(['src/client/test/e2e/*test-e2e.js'])
    .pipe(protractor({
      'configFile': 'protractor.conf.js'
    }))
    .on('error', function (e) {
      gutil.log(e.message);
    });
});

gulp.task('mocha', function () {
  return gulp
    .src(['src/server/test/e2e/*.*Spec.js'])
    .pipe(mocha());
});

gulp.task('mocha-report', function () {
  return gulp
    .src(['src/server/test/e2e/*.*Spec.js'])
    .pipe(mocha({
      istanbul: true
    }));
});

gulp.task('protractor-watch', function () {
  gulp.watch(['src/client/**/*.*', './protractor.conf.js'], ['protractor']);
});

gulp.task('mocha-watch', function () {
  gulp.watch(['src/server/**/*.js'], ['mocha']);
});

gulp.task('karma-watch', function () {
  return gulp.watch(['src/client/**/*.js'], ['karma']);
});

// build
// copy all html,js,css

// TODO: need to make sure the node server is running before karma
gulp.task('test', function (cb) {
  runSequence('protractor', 'karma', 'mocha-report', cb);
});

gulp.task('browser-sync', function () {
  browserSync({
    proxy: 'localhost:' + 3000,
    port: 3000,
    files: ['src/client' + '/**/*.*'],
    ghostMode: { // these are the defaults t,f,t,t
      clicks: true,
      location: false,
      forms: true,
      scroll: true
    },
    //logLevel: 'debug',
    logPrefix: 'gulp-patterns',
    notify: true,
    reloadDelay: 0 //ms
  });
});

gulp.task('default', function (cb) {
  runSequence('browser-sync', 'jshint-watch', 'karma-watch', 'mocha-watch', cb);
});
