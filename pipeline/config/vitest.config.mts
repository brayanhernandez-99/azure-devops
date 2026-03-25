import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config.mts';
import path from 'path';
import fs from 'fs';

const resolvedViteConfig =
    typeof viteConfig === 'function' ? viteConfig({ mode: 'test' } as any) : viteConfig;

const mocksDir = path.resolve(__dirname, 'test/__mocks__');

const alias: Record<string, string> = {};

function walkMocks(dir: string, namespace: string = '') {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkMocks(fullPath, `${namespace}${entry.name}/`); // recorrer subcarpetas
        } else {
            const match = entry.name.match(/(.*)Mock\./);
            if (match) {
                const name = match[1];
                alias[`${namespace}${name}`] = fullPath;
            }
        }
    });
}

if (fs.existsSync(mocksDir)) {
    walkMocks(mocksDir);
}

console.log('Aliases de mocks generados:', alias);

export default mergeConfig(
    resolvedViteConfig,
    defineConfig({
        resolve: {
            alias,
        },
        test: {
            coverage: {
                provider: 'v8',
                reporter: ['text', 'lcov'],
                reportsDirectory: 'coverage',
                reportOnFailure: true,
                exclude: [
                    '*.cjs',
                    '*.js',
                    '*.mts',
                    'src/**/*.vue',
                    'src/main.ts',
                    'test/**',
                ],
            } as any,
            environment: 'jsdom',
            exclude: [...configDefaults.exclude, 'e2e/**', 'src/main.ts'],
        },
    })
);
 