var gulp = require('gulp');
var uglify = require('gulp-uglify');

// create a default task and just log a message
gulp.task('default', function () {
    gulp.src('public/app/controllers/*.js').pipe(uglify()).pipe(gulp.dest('public/app/controllers/'));
    gulp.src('public/app/services/*.js').pipe(uglify()).pipe(gulp.dest('public/app/services/'));
});