const path = require('path');
const gulp = require('gulp');
const replace = require('gulp-replace');
const intercept = require('gulp-intercept');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const cssSlam = require('css-slam').gulp;
const htmlMinifier = require('gulp-html-minifier');
const vulcanize  = require('gulp-vulcanize');
const mergeStream = require('merge-stream');

// const PolymerProject = require('polymer-build').PolymerProject;

// const project = new PolymerProject(require('../polymer.json'));

// const sourcesStream = project.sources()
//   .pipe(project.splitHtml())
//   .pipe(gulpif(/\.css$/, cssSlam()))
//   // .pipe(gulpif(/\.html$/, replace('/public/', '/src/public/')))
//   .pipe(project.rejoinHtml());
  

// const dependenciesStream = project.dependencies()
  // .pipe(replace('/public/', '/src/public/'))


// // Create a build pipeline to bundle our application before writing to the 'build/' dir
// mergeStream(sourcesStream, dependenciesStream)
//   // .pipe(project.bundler)
//   // .pipe(replace('/public/', '/src/public/'))
//   .pipe(intercept(function(file){
//     console.log('FILE: ' + file.path );
//     console.log('OLD CONTENT: ' + file.contents.toString() );
//     return file;
//   }))
//   .pipe(gulp.dest('src/public/build/'));

gulp.src(['*.html'], {
  cwd: 'src/pages'
})
  .pipe(intercept((file) => {
    console.log('FILE: ' + file.path);
    // console.log('OLD CONTENT: ' + file.contents.toString() );
    return file;
  }))
  // .pipe(replace('/public/', 'src/public/'))
  .pipe(vulcanize({
    // abspath: path.resolve('src'),
    // inputUrl: '/pages/chulaexpo-staff-app.html',
    excludes: [
      '/public/lib/'
    ],
    stripComments: true,
    inlineScripts: true,
    inlineCss: true,
    stripExcludes: true
  }))
  .pipe(intercept((file) => {
    console.log('FILE: ' + file.path);
    // console.log('OLD CONTENT: ' + file.contents.toString() );
    return file;
  }))
  .pipe(gulp.dest('src/public/build'));