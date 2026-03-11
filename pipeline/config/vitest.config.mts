// vitest.config.mts
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config.mts';
import path from 'path';
import fs from 'fs';

const resolvedViteConfig =
  typeof viteConfig === 'function' ? viteConfig({ mode: 'test' } as any) : viteConfig;

const mocksDir = path.resolve(__dirname, 'test/__mocks__');

const alias: Record<string, string> = {};

function walkMocks(dir: string) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkMocks(fullPath);
    } else {
      const match = entry.name.match(/(.*)Mock\./);
      if (match) {
        const name = match[1];
        const relPath = path.relative(mocksDir, fullPath);
        const parts = relPath.split(path.sep);
        const namespace = parts.length > 1 ? parts[0] : 'unknown';
        alias[`${namespace}/${name}`] = fullPath;
      }
    }
  });
}

if (fs.existsSync(mocksDir)) {
  walkMocks(mocksDir);
}

// Remotos federados en test: reutilizar TheLayoutMock.ts existente (sin crear archivos)
const layoutMockPath = path.resolve(mocksDir, 'TheLayoutMock.ts');
alias['users/CustomerSeller'] = layoutMockPath;
alias['dashboard/PayMethod'] = layoutMockPath;
// TooltipVersion y otros puntos usan múltiples remotos de VersionApp
[
  'astro/VersionApp',
  'awards/VersionApp',
  'betplay/VersionApp',
  'biometrics/VersionApp',
  'cashier/VersionApp',
  'commissions/VersionApp',
  'conciliation/VersionApp',
  'credits/VersionApp',
  'dashboard/VersionApp',
  'dynamic_storage/VersionApp',
  'external/VersionApp',
  'external_wager/VersionApp',
  'hierarchies/VersionApp',
  'login/VersionApp',
  'millonario/VersionApp',
  'money_control/VersionApp',
  'papelery/VersionApp',
  'raffles/VersionApp',
  'recharges/VersionApp',
  'users/VersionApp',
  'chance/VersionApp',
  'generic/VersionApp',
  // SignIn remoto usado en el router público
  'login/SignIn',
].forEach(key => {
  alias[key] = layoutMockPath;
});

const mergedAlias = {
  ...(resolvedViteConfig.resolve?.alias as Record<string, string> || {}),
  ...alias,
};

export default mergeConfig(
  resolvedViteConfig,
  defineConfig({
    resolve: {
      alias: mergedAlias,
    },
    test: {
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
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