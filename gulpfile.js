var gulp = require('gulp');
var ts = require("gulp-typescript");
var tsProject = ts.createProject('tsconfig.json', {typescript: require('typescript')});
var sourcemaps = require('gulp-sourcemaps');
const spawn = require('child_process').spawn;
var node;

gulp.task('ts', function () {
	return gulp.src(['./server/**/*.ts', '!./server/**/*.spec.ts'])
	.pipe(sourcemaps.init())
	.pipe(ts(tsProject))
	.pipe(sourcemaps.write("./"))
	.pipe(gulp.dest('./server'));
});


gulp.task('watch', function() {
	process.env['MONGODB_URI'] = 'mongodb://localhost:27017/csrf-sample';
	gulp.start(["ts", "server"]);
	gulp.watch(['./server/**/*.{ts,hbs}'], ['ts', "server"]);
});


gulp.task('server',["ts"], function() {
  if (node) {
	  node.kill()
  }
  node = spawn('node', ['./server/application.js'], {stdio: 'inherit'})
});

gulp.task('default', ["ts"]);