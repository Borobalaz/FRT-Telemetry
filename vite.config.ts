import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import electron from 'vite-plugin-electron/simple'

export default defineConfig({
  plugins: [
    preact(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: 'electron/preload.ts',
      },
    }),
  ],
  base: "./",
})
