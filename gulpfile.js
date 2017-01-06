var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('default', function () {
    gulp.src('public/app/controllers/*.js').pipe(uglify()).pipe(gulp.dest('public/app/controllers/'));
    gulp.src('public/app/services/*.js').pipe(uglify()).pipe(gulp.dest('public/app/services/'));
});