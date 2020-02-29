/* eslint-disable no-console */
import * as util from 'util';
import { exec as execSync } from 'child_process';
import { promises as fs, existsSync } from 'fs';
import * as path from 'path';
import * as svelte from 'svelte/compiler';
import * as chokidar from 'chokidar';
import * as babel from '@babel/core';
import * as glob from 'glob';
import * as terser from 'terser';
import pLimit from 'p-limit';
// import { preprocess } from '@pyoner/svelte-ts-preprocess';
import preprocess from 'svelte-preprocess';
// import * as ts from 'typescript';
const exec = util.promisify(execSync);

import * as swc from '@swc/core';

const SWC_TS_OPTIONS: any = {
    jsc: {
        target: 'es2019',
        parser: {
            syntax: 'typescript',
        },
        transform: {},
    },
};

const IS_PRODUCTION_MODE = process.env.NODE_ENV === 'production';

// Check for and load a custom babel config file
const BABEL_CONFIG = existsSync('./babel.config.js')
    ? require(path.join(process.cwd(), 'babel.config.js'))
    : {
          plugins: [
              [
                  'snowpack/assets/babel-plugin.js',
                  {
                      // Append .js to all src file imports
                      optionalExtensions: true,
                  },
              ],
          ],
      };
import * as cheerio from 'cheerio';
async function compile(
    srcPath: string
): Promise<{
    destPath: string | null;
    logSvelteWarnings: () => void;
}> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let logSvelteWarnings = (): void => {};

    try {
        let start = +new Date();
        let source = await fs.readFile(srcPath, 'utf8');
        const isSvelte = srcPath.endsWith('.svelte');
        const isTypescriptFile = srcPath.endsWith('.ts');
        const $ = cheerio.load(source);

        const tsScriptContent = $('script[lang="typescript"]').html();

        let newSource = source;

        if (isSvelte) {
            if (tsScriptContent) {
                console.log('tsScriptContent', tsScriptContent);

                const tsResult = await swc.transform(
                    tsScriptContent,
                    SWC_TS_OPTIONS
                );

                console.log('tsResult', tsResult);

                // let tsResult = ts.transpileModule(tsScriptContent, {
                //     compilerOptions: {
                //         module: ts.ModuleKind.ESNext,
                //         lib: ['ESNext'],
                //         importHelpers: true,
                //     },
                // });

                source = source
                    .replace(tsScriptContent, tsResult.code)
                    .replace('<script lang="typescript">', '<script>');
                console.log('source', source);
            }

            // if(isTypescript) {

            // }

            const tspreprocess: any = (preprocess as any)({
                // transpileOnly: true,
                // compilerOptions: {
                //     transpileOnly: true,
                //     // allowNonTsExtensions: true,
                // },
            });
            const preprocessed = await svelte.preprocess(
                source,
                [tspreprocess],
                {
                    filename: srcPath,
                }
            );

            console.log(`preprocessed ${srcPath} in ${+new Date() - start} ms`);

            const result = svelte.compile(
                (preprocessed && preprocessed.code) || source,
                {
                    // https://svelte.dev/docs#Compile_time
                    filename: srcPath,
                    dev: !IS_PRODUCTION_MODE,
                    hydratable: process.argv.includes('--hydratable'),
                    immutable: process.argv.includes('--immutable'),
                }
            );
            console.log(
                `svelte compiled ${srcPath} in ${+new Date() - start} ms`
            );

            logSvelteWarnings = (): void => {
                result.warnings.forEach(warning => {
                    console.log('');
                    console.warn(
                        '\x1b[33m%s\x1b[0m',
                        `SVELTE WARNING (${warning.filename}) -> ${warning.message}`
                    );
                    console.warn(warning.frame);
                });
            };

            newSource = result.js.code;
        }

        let destPath = srcPath
            .replace(/^src\//, 'dist/')
            .replace(/.svelte$/, '.js');

        if (isTypescriptFile) {
            newSource = (await swc.transform(source, SWC_TS_OPTIONS)).code;
            destPath = destPath.substr(0, destPath.lastIndexOf('.')) + '.js';
        }

        // Create all ancestor directories for this file
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.writeFile(destPath, newSource);

        console.info(
            `Svelte compiled and written to disk in ${+new Date() -
                start} ms ${destPath}`
        );

        return {
            destPath,
            logSvelteWarnings,
        };
    } catch (err) {
        console.log('');
        console.error(`Failed to compile with svelte: ${srcPath}`);
        console.error(err);
        console.log('');
        return {
            destPath: null,
            logSvelteWarnings,
        };
    }
}

async function copyFile(srcPath: string): Promise<void> {
    const destPath = srcPath.replace(/^src\//, 'dist/');
    // Create all ancestor directories for this file
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(srcPath, destPath);
    console.info(`Copied asset ${destPath}`);
    console.log('-------');
}

// Update the import paths to correctly point to web_modules.
async function transform(destPath: string): Promise<void> {
    try {
        let source = await fs.readFile(destPath, 'utf8');

        if (destPath.endsWith('.ts')) {
            source = (await swc.transform(source, SWC_TS_OPTIONS)).code;
            destPath = destPath.substr(0, destPath.lastIndexOf('.')) + '.js';
        }

        const transformed = (await babel.transformAsync(
            source,
            BABEL_CONFIG
        )) as babel.BabelFileResult;

        await fs.writeFile(destPath, transformed.code);
        console.info(`Babel transformed ${destPath}`);
    } catch (err) {
        console.log('');
        console.error(`Failed to transform with babel: ${destPath}`);
        console.error(err);
        console.log('');
    }
}

// Minify file with terser.
async function minify(destPath: string): Promise<void> {
    try {
        const source = await fs.readFile(destPath, 'utf8');

        const result = terser.minify(source, {
            module: true,
        });

        await fs.writeFile(destPath, result.code);
        console.info(`Terser minified ${destPath}`);
    } catch (err) {
        console.log('');
        console.error(`Failed to minify with terser: ${destPath}`);
        console.error(err);
        console.log('');
    }
}

// Only needs to run during the initial compile cycle. If a developer adds a new package dependency,
// they should restart svelvet.
const snowpack = async (): Promise<void> => {
    const maybeOptimize = IS_PRODUCTION_MODE ? '--optimize' : '';

    console.info(`\nBuilding web_modules with snowpack...`);

    try {
        const snowpackLocation = path.resolve(
            require.resolve('snowpack'),
            '../index.bin.js'
        );

        console.log('snowpackLocation', snowpackLocation);
        const { stdout, stderr } = await exec(
            // `cd dist && ${snowpackLocation} ${maybeOptimize}`

            `${snowpackLocation} --include 'dist/**/*' --dest dist/web_modules ${maybeOptimize}`
        );

        // TODO: hide behind --verbose flag
        // Show any output from snowpack...
        stdout && console.info(stdout);
        stderr && console.info(stderr);
    } catch (err) {
        console.log('');
        console.error('Failed to build with snowpack');
        console.error(err.stderr || err);
        // Don't continue trying to build if snowpack fails.
        process.exit(1);
    }
};

async function initialBuild(): Promise<void> {
    if (IS_PRODUCTION_MODE) console.info(`Building in production mode...`);

    const concurrencyLimit = pLimit(8);
    const globConfig = { nodir: true };
    const svelteAndJsAndTsFiles = glob.sync(
        'src/**/!(*+(spec|test)).+(js|mjs|svelte|ts)',
        globConfig
    );
    const otherAssetFiles = glob.sync(
        'src/**/*.!(spec.[tj]s|test.[tj]s|[tj]s|mjs|svelte)',
        globConfig
    );

    // Just copy all other asset types, no point in reading them.
    await Promise.all(
        otherAssetFiles.map(srcPath =>
            concurrencyLimit(async () => copyFile(srcPath))
        )
    );

    // Compile all source files with svelte.
    const svelteWarnings: Array<() => void> = [];
    const destFiles = await Promise.all(
        svelteAndJsAndTsFiles.map(srcPath =>
            concurrencyLimit(async () => {
                const { destPath, logSvelteWarnings } = await compile(srcPath);
                svelteWarnings.push(logSvelteWarnings);
                return destPath;
            })
        )
    );

    // Need to run this (only once) before transforming the import paths, or else it will fail.
    await snowpack();

    // Transform all generated js files with babel.
    await Promise.all(
        destFiles.map(destPath =>
            concurrencyLimit(async () => {
                if (!destPath) return;
                await transform(destPath);
            })
        )
    );

    // Minify js files with terser if in production.
    if (IS_PRODUCTION_MODE && !process.argv.includes('--no-minify')) {
        await Promise.all(
            destFiles.map(destPath =>
                concurrencyLimit(async () => {
                    if (!destPath) return;
                    await minify(destPath);
                })
            )
        );
    }

    // Log all svelte warnings
    svelteWarnings.forEach(f => f());
}

function startWatchMode(): void {
    console.info(`Watching for files...`);

    const handleFile = async (srcPath: string): Promise<void> => {
        // Copy updated non-js/svelte files
        console.log('handleFile', srcPath);
        if (
            !srcPath.endsWith('.svelte') &&
            !srcPath.endsWith('.js') &&
            !srcPath.endsWith('.ts') &&
            !srcPath.endsWith('.mjs')
        ) {
            copyFile(srcPath);
            return;
        }

        let start = +new Date();

        const { destPath, logSvelteWarnings } = await compile(srcPath);
        if (!destPath) return;
        await transform(destPath);

        console.log('compiled ', srcPath, ' in ', (+new Date() - start) / 1000);

        logSvelteWarnings();
    };

    const srcWatcher = chokidar.watch('src', {
        ignored: /(^|[/\\])\../, // Ignore dotfiles
        ignoreInitial: true, // Don't fire "add" events when starting the watcher
    });

    srcWatcher.on('add', handleFile);
    srcWatcher.on('change', handleFile);
}

async function main(): Promise<void> {
    await initialBuild();
    if (!IS_PRODUCTION_MODE) startWatchMode();
}

main();
