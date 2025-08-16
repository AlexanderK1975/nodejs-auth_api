import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.argv.includes('--watch');

const pkg = JSON.parse(await fs.readFile(path.resolve(__dirname, 'package.json'), 'utf-8'));
const externalModules = pkg.dependencies ? Object.keys(pkg.dependencies) : [];

async function build() {
    const ctx = await esbuild.context({
        entryPoints: [path.resolve(__dirname, 'src/server.js')],
        bundle: true,
        platform: 'node',
        format: 'esm',
        outfile: path.resolve(__dirname, 'dist/server.js'),
        sourcemap: true,
        external: externalModules,
        alias: {
            '@data': path.resolve(__dirname, 'src/dataLayer'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@constants': path.resolve(__dirname, 'src/constants'),
            '@controllers': path.resolve(__dirname, 'src/controllers'),
            '@builders': path.resolve(__dirname, 'src/builders'),
            '@services': path.resolve(__dirname, 'src/services'),
            '@validators': path.resolve(__dirname, 'src/validators'),
        }
    });

    if (isDev) {
        console.log('Watching for changes...');
        await ctx.watch();
    } else {
        await ctx.rebuild();
        await ctx.dispose();
        console.log('Build completed successfully!');
    }
}

build().catch((err) => {
    console.error(err);
    process.exit(1);
});