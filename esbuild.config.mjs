import * as esbuild from 'esbuild';

/** @type {esbuild.BuildOptions} */
const shared = {
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  // Inline all npm dependencies; only externalize Node.js builtins
  external: [
    'node:*',
    'child_process',
    'fs',
    'path',
    'os',
    'url',
    'util',
    'events',
    'stream',
    'buffer',
    'crypto',
    'net',
    'tty',
    'http',
    'https',
    'readline',
    'string_decoder',
    'assert',
    'constants',
    'process',
  ],
  sourcemap: true,
  // Banner to add shebang for CLI entry
  minify: false,
  // Keep readable for debugging
  keepNames: true,
};

async function build() {
  // MCP Server entry point (main extension entry)
  await esbuild.build({
    ...shared,
    entryPoints: ['src/mcp-server.ts'],
    outfile: 'dist/mcp-server.js',
  });

  // CLI entry point
  await esbuild.build({
    ...shared,
    entryPoints: ['src/cli.ts'],
    outfile: 'dist/cli.js',
    banner: {
      js: '#!/usr/bin/env node',
    },
  });

  // Library exports (index)
  await esbuild.build({
    ...shared,
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
  });

  // AfterAgent hook entry point
  await esbuild.build({
    ...shared,
    entryPoints: ['src/hooks/after-agent.ts'],
    outfile: 'dist/after-agent-hook.js',
  });

  console.log('Build complete: dist/mcp-server.js, dist/cli.js, dist/index.js, dist/after-agent-hook.js');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
