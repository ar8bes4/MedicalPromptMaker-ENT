import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// ローカル配布・単一ファイル用ビルド設定
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-local',
    emptyOutDir: true,
  }
});
