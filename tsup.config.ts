import { defineConfig } from 'tsup'

export default defineConfig({
   entry: ['src/index.ts'],
   format: ['esm'],
   dts: true,
   clean: true,
   sourcemap: true,
   minify: false,
   target: 'node22',
   outDir: 'dist',
   splitting: false,
   treeshake: true,
   onSuccess: 'echo Build completed successfully!',
})
