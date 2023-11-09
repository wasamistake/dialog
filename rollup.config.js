import { readFileSync } from 'fs'
import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'

const pkg = JSON.parse(readFileSync(new URL('package.json', import.meta.url)))

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  external: ['react', 'react-dom'],
  plugins: [
    typescript({
      exclude: [
        '**/*.test.{ts,tsx}',
        'vitest.config.ts',
        'vitest.setup.ts',
        '**/*.stories.{ts,tsx}',
      ],
    }),
    terser(),
  ],
})
