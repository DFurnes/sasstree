var gulp = require('gulp');
var benchmark = require('gulp-bench');

gulp.task('default', function () {
    return gulp.src('tests/benchmark.js', {read: false})
        .pipe(benchmark())
});