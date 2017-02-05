var gulp = require('gulp');
var polybuild = require('polybuild');

gulp.task('build', () => {
  return gulp.src('index.html')
  .pipe(polybuild())
  .pipe(gulp.dest('.'));
})