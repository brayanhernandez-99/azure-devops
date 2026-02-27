import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.mts'

const resolvedViteConfig = typeof viteConfig === 'function' ? viteConfig({ mode: 'test' } as any) : viteConfig;
export default mergeConfig(
    resolvedViteConfig,
    defineConfig({
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
                ],
            } as any,
            environment: 'jsdom',
            exclude: [...configDefaults.exclude, 'e2e/**', 'src/main.ts'],
        }
    })
)
