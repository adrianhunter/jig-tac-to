import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";
import getPreprocessor from "svelte-preprocess";
import replace from "rollup-plugin-replace";
// import { config } from '@sveltech/routify';
// import { routify } from '@sveltech/routify';
import typescript from "@wessberg/rollup-plugin-ts";
import globals from "rollup-plugin-node-globals";

const svelteOptions = require("./svelte.config");
const production = process.env.NODE_ENV == "production";
export default {
  input: "src/main.ts",
  output: {
    sourcemap: true,
    name: "app",
    format: "iife",
    dir: "public/bundle"
    // format: split ? 'esm' : 'iife',
    // [split ? 'dir' : 'file']: split
    // 	? 'public/build'
    // 	: 'public/build/bundle.js'
  },
  plugins: [
    svelte({
      ...svelteOptions,
      emitCss: true,
      // enable run-time checks when not in production
      dev: !production,
      css: css => {
        css.write("public/components.css");
      }
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    // postcss({
    // 	plugins: require('./postcss.config.js')(production),
    // 	extract: 'public/utils.css'
    // }),
    postcss({
      extract: true,
      minimize: true,
      use: [
        [
          "sass",
          {
            includePaths: ["./src/theme", "./node_modules"]
          }
        ]
      ]
    }),

    // routify({ dynamicImports: true }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs

    resolve({
      browser: true,
      dedupe: importee =>
        importee === "svelte" || importee.startsWith("svelte/")
      // dedupe: importee =>
      // 	importee === 'svelte' || importee.startsWith('svelte/')
    }),
    commonjs(),
    typescript({
      objectHashIgnoreUnknownHack: true
    }),
    //The plugin uses rollup config as part of cache key. object-hash is used to generate a hash, but it can't hash certain elements at the moment. Setting this option to true will make object-hash ignore unknowns, at the cost of not invalidating the cache if ignored elements are changed. Only enable this if you need it (Error: Unknown object type "asyncfunction" for example) and make sure to run with clean: true once in a while and definitely before a release. (See #105)
    //https://github.com/ezolenko/rollup-plugin-typescript2/blob/master/README.md
    // run clean before production

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),

    globals()
  ],
  watch: {
    clearScreen: false
  }
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      const script = "start";

      // const script = !split ? 'start' : 'start:split';
      if (!started) {
        started = true;

        require("child_process").spawn("npm", ["run", script, "--", "--dev"], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true
        });
      }
    }
  };
}
