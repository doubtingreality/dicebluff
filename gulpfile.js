const gulp       = require('gulp');
const del        = require('del');
const babel      = require("gulp-babel");
const concat     = require("gulp-concat");

const source_server = 'src/dicebluff-server/**/*.js';
const destination_server = 'dist/dicebluff-server/';

gulp.task('clean', () => {
  // Clean dest folder
  del([destination_server + '**']);
});

gulp.task("babel", function () {
  return gulp.src(source_server)
		.pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulp.dest(destination_server));
});

gulp.task('default', [ 'clean', 'babel' ]);
