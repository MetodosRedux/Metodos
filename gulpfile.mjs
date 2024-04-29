import gulp from "gulp";
import concat from "gulp-concat";

const { series, parallel, src, dest } = gulp;

//bundle JavaScript files
function bundleJS() {
  return (
    src([
       'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js', 
            'node_modules/three/build/three.module.js',
             'node_modules/three/examples/jsm/loaders/GLTFLoader.js',
            'node_modules/three/examples/jsm/controls/OrbitControls.js',
            'node_modules/three/examples/jsm/utils/BufferGeometryUtils.js'  
    ])
      /* .pipe(concat('bundle.mjs')) // Concatenate all files into one bundle */
      .pipe(dest("./public/dist/mjs"))
  ); // Output bundled file to dist/js directory
}

// Task to copy Bootstrap CSS files
function copyBootstrapCSS() {
  return src([
    "node_modules/bootstrap/dist/css/bootstrap.min.css",
    "node_modules/bootstrap/dist/css/bootstrap.min.css.map",
  ]).pipe(dest("./public/dist/css")); // Output to dist/css directory
}

export default series(bundleJS, copyBootstrapCSS);
