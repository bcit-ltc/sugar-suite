import fs from 'fs'; // file system operations for reading js files
import { resolve } from 'path'; // path resolution utilities
import { fileURLToPath } from 'url'; // convert file urls to paths
import { glob } from 'glob'; // file pattern matching
import { defineConfig } from 'vite'; // vite configuration helper
import autoprefixer from 'autoprefixer'; // css vendor prefixing
import cssnano from 'cssnano'; // css minification and optimization
import viteCompression from 'vite-plugin-compression'; // gzip/brotli compression

const __dirname = resolve(fileURLToPath(import.meta.url), '..'); // get current directory

export default defineConfig({
  // use default public folder (public/) - assets, html, and vendor files are already there
  // static files in public/ are served directly without copying

  plugins: [ // vite plugins array
    // custom plugin for js concatenation (replaces gulp's concat functionality)
    {
      name: 'js-concat', // plugin name for vite
      buildStart() { // runs at build start
        // add all source files to watch list so vite knows to rebuild when they change
        const allSourceFiles = glob.sync('source/**/*'); // find all files in source directory
        
        allSourceFiles.forEach(file => { // iterate through all files
          this.addWatchFile(file); // add each file to vite's watch list
        });
      },
      generateBundle() { // runs during bundle generation
        // process main js features (equivalent to gulp's scripts task)
        const mainJsContent = getModuleContent('source/js/features'); // get concatenated js content
        this.emitFile({ // emit the file to output
          type: 'asset', // file type
          fileName: 'js/lat.js', // output filename
          source: mainJsContent // file content
        });
        
        // process experimental js (equivalent to gulp's experimental task)
        const experimentalJsContent = getModuleContent('source/experimental/js'); // get experimental js content
        this.emitFile({ // emit experimental file
          type: 'asset', // file type
          fileName: 'js/experimental.js', // output filename
          source: experimentalJsContent // file content
        });
      }
    },
    // gzip compression plugin
    viteCompression({
      algorithm: 'gzip', // compression algorithm
      ext: '.gz', // file extension for compressed files
      threshold: 512, // compress files larger than 512 bytes
      minRatio: 0.7, // only compress if compression ratio is better than 70%
      deleteOriginFile: false, // keep original files
      // optimize compression for css files
      filter: (fileName) => { // filter which files to compress
        return fileName.endsWith('.css') || fileName.endsWith('.js') || fileName.endsWith('.html'); // only css, js, html files
      }
    }),
    // brotli compression plugin (better compression than gzip)
    viteCompression({
      algorithm: 'brotliCompress', // brotli compression algorithm
      ext: '.br', // file extension for brotli compressed files
      threshold: 512, // compress files larger than 512 bytes
      minRatio: 0.7, // only compress if compression ratio is better than 70%
      deleteOriginFile: false, // keep original files
      // optimize compression for css files
      filter: (fileName) => { // filter which files to compress
        return fileName.endsWith('.css') || fileName.endsWith('.js') || fileName.endsWith('.html'); // only css, js, html files
      }
    })
  ],

  // css processing (replaces gulp's sass, autoprefixer, cleancss tasks)
  css: { // css configuration
    preprocessorOptions: { // preprocessor options
      scss: { // scss specific options
        // scss options - add includepaths for proper imports
        includePaths: ['source/scss'], // paths to search for scss imports
        // allow all warnings to show
        quietDeps: false, // show dependency warnings
        // source maps disabled for production builds
        sourceMap: false, // disable source maps for smaller files
        // optimize scss compilation
        precision: 6, // decimal precision for calculations
        // enable modern scss features
        api: 'modern-compiler' // use modern scss compiler
      }
    },
    postcss: { // postcss configuration
      plugins: [ // postcss plugins array
        autoprefixer({ // autoprefixer plugin
          cascade: false, // disable cascade for cleaner output
          // optimize autoprefixer for better browser support
          overrideBrowserslist: ['> 1%', 'last 2 versions', 'not dead'] // browser support targets
        }),
        cssnano({ // cssnano minification plugin
          preset: ['default', { // use default preset with custom options
            // maximum css optimization for production
            discardComments: { removeAll: true }, // remove all comments
            normalizeWhitespace: true, // normalize whitespace
            minifyFontValues: true, // minify font declarations
            minifySelectors: true, // minify selectors
            mergeLonghand: true, // merge shorthand properties
            mergeRules: true, // merge duplicate rules
            // additional aggressive optimizations
            discardEmpty: true, // remove empty rules
            discardDuplicates: true, // remove duplicate rules
            discardOverridden: true, // remove overridden rules
            discardUnused: false, // keep unused rules for potential dynamic use
            mergeIdents: true, // merge identical selectors
            reduceIdents: true, // reduce identifier length
            zindex: false // keep z-index values as-is for safety
          }]
        })
      ]
    }
  },

  // build configuration
  build: { // build options
    outDir: 'dist', // output directory
    // disable esbuild css minification to avoid warnings with css hacks
    cssMinify: false, // disable esbuild css minification
    // optimize build performance
    target: 'es2015', // javascript target version
    // enable chunk splitting for better caching
    chunkSizeWarningLimit: 1000, // chunk size warning threshold
    rollupOptions: { // rollup bundler options
      input: { // entry points
        // scss entry points for themes (replaces gulp's sasssources)
        ...getScssEntries() // spread scss entries from helper function
      },
      output: { // output configuration
        // preserve directory structure for css
        assetFileNames: (assetInfo) => { // custom asset file naming
          if (assetInfo.names?.[0]?.endsWith('.css')) { // if file is css
            return 'css/[name][extname]'; // output to css directory
          }
          // don't copy fontawesome fonts to assets - they stay in public/
          if (assetInfo.names?.[0]?.includes('fontawesome')) { // if file is fontawesome
            return 'css/vendor/font-awesome-4.7.0/fonts/[name][extname]'; // output to fontawesome fonts directory
          }
          return 'assets/[name][extname]'; // default to assets directory
        }
      }
    },
    // source maps disabled for maximum file size reduction
    sourcemap: false, // disable source maps
    // minification (replaces gulp's uglify)
    minify: 'terser', // use terser for minification
    terserOptions: { // terser minification options
      compress: { // compression options
        drop_console: true, // remove console statements
        drop_debugger: true, // remove debugger statements
        // maximum javascript optimization
        pure_funcs: ['console.log', 'console.info', 'console.warn', 'console.error'], // remove pure function calls
        passes: 3, // number of optimization passes
        // additional aggressive optimizations
        dead_code: true, // remove dead code
        hoist_funs: true, // hoist function declarations
        hoist_vars: true, // hoist variable declarations
        if_return: true, // optimize if-return patterns
        join_vars: true, // join variable declarations
        loops: true, // optimize loops
        properties: true, // optimize property access
        reduce_vars: true, // reduce variable usage
        sequences: true, // optimize sequences
        side_effects: false, // assume no side effects
        switches: true, // optimize switch statements
        toplevel: true, // optimize top-level code
        unsafe: false, // keep safe for compatibility
        unsafe_comps: false, // keep safe comparisons
        unsafe_math: false, // keep safe math operations
        unsafe_proto: false // keep safe prototype access
      },
      mangle: { // name mangling options
        // maximum name mangling for smaller files
        keep_fnames: false, // mangle function names
        toplevel: true, // mangle top-level names
        properties: { // property mangling
          regex: /^_/ // mangle properties starting with underscore
        }
      },
      format: { // output formatting
        // remove all formatting
        comments: false, // remove comments
        beautify: false // no beautification
      }
    }
  },

  // public directory configuration - vite automatically copies public/ to dist/ root

  // development server (replaces browsersync)
  server: { // development server options
    port: 9000, // server port
    host: true, // allow external connections
    // enable hmr for scss and js files
    hmr: true // hot module replacement
  },

  // resolve configuration
  resolve: { // module resolution
    alias: { // path aliases
      '@': resolve(__dirname, 'source'), // alias for source directory
      '@scss': resolve(__dirname, 'source/scss'), // alias for scss directory
      '@js': resolve(__dirname, 'source/js') // alias for js directory
    }
  },

  // define global constants
  define: { // global variable definitions
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development') // development flag
  }
});

// helper function to get scss entries (replaces gulp's sasssources config)
function getScssEntries() { // function to get scss entry points
  // only include the main theme files that should be built as separate css files
  const themeFiles = [ // array of theme file paths
    'source/scss/themes/bcit.scss', // main bcit theme
    'source/scss/themes/business.scss', // business theme
    'source/scss/themes/energy.scss', // energy theme
    'source/scss/themes/health.scss', // health theme
    // custom theme files
    'source/scss/themes/custom/business/business-administration.scss', // business administration theme
    'source/scss/themes/custom/business/retail-marketing-management.scss', // retail marketing theme
    'source/scss/themes/custom/health/bachelor-science-nursing.scss', // nursing theme
    'source/scss/themes/custom/health/specialty-nursing-perinatal.scss', // perinatal theme
    'source/scss/themes/custom/computing/computing.scss', // computing theme
    'source/scss/themes/custom/construction/construction.scss', // construction theme
    // 'source/scss/themes/custom/energy/energy.scss', // commented out duplicate energy theme
    'source/scss/themes/custom/transportation/transportation.scss', // transportation theme
    // experimental theme
    'source/experimental/scss/experimental.scss' // experimental theme
  ];

  const entries = {}; // object to store entry points

  themeFiles.forEach(file => { // iterate through theme files
    // create proper entry names that match the original structure
    let name = file.replace('source/scss/', '').replace('source/experimental/scss/', 'experimental/').replace('.scss', ''); // clean up file path

    // handle custom themes path structure
    if (name.includes('custom/')) { // if custom theme
      name = name.replace('themes/custom/', 'custom/'); // replace themes/custom with custom
    } else if (name.startsWith('themes/')) { // if main theme
      name = name.replace('themes/', ''); // remove themes prefix
    }

    entries[name] = resolve(__dirname, file); // add entry point
  });

  return entries; // return entries object
}

// helper function to get module content for js concatenation
function getModuleContent(sourceDir) { // function to concatenate js files
  const jsFiles = glob.sync(`${sourceDir}/*.js`, { // find all js files in directory
    ignore: [`${sourceDir}/-WIP-*.js`] // ignore work-in-progress files
  });

  let content = ''; // initialize content string

  // add jquery first if this is the main features bundle
  if (sourceDir === 'source/js/features') { // if main features directory
    content += '// jQuery\n'; // add jquery comment
    content += fs.readFileSync('public/js/vendor/jquery-3.7.1.min.js', 'utf8'); // read jquery file
    content += '\n\n'; // add newlines
  }

  jsFiles.forEach(file => { // iterate through js files
    content += `// ${file}\n`; // add file comment
    content += fs.readFileSync(file, 'utf8'); // read file content
    content += '\n\n'; // add newlines
  });

  return content; // return concatenated content
}