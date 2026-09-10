import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

type MathBankDevServer = {
  middlewares: {
    use: (
      route: string,
      handler: (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => void,
    ) => void;
  };
};

const RUNTIME_FILES = ['search_documents.json.gz', 'catalog.json', 'exam_index_2026.json'];
const GRADE_FILE = /^by_grade\/grade-(?:5|6|7|8|9|10|11)\.json\.gz$/;

const toPosix = (filePath: string) => filePath.split(path.sep).join('/');

const isRuntimeAsset = (relativePath: string) =>
  RUNTIME_FILES.includes(relativePath) || GRADE_FILE.test(relativePath);

const copyRuntimeAssets = (srcDir: string, destDir: string) => {
  fs.mkdirSync(path.join(destDir, 'by_grade'), { recursive: true });

  for (const file of RUNTIME_FILES) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  }

  const gradesDir = path.join(srcDir, 'by_grade');
  for (const file of fs.readdirSync(gradesDir)) {
    const relativePath = `by_grade/${file}`;
    if (isRuntimeAsset(relativePath)) {
      fs.copyFileSync(path.join(gradesDir, file), path.join(destDir, 'by_grade', file));
    }
  }
};

export const mathBankAssetsPlugin = (workspaceRoot: string) => {
  const srcDir = path.resolve(workspaceRoot, 'packages/features.math.bank/public/math-bank');

  return {
    name: 'math-bank-assets',
    configureServer(server: MathBankDevServer) {
      server.middlewares.use(
        '/math-bank',
        (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
          const url = req.url?.split('?')[0] ?? '';
          const relativePath = toPosix(path.normalize(url).replace(/^[/\\]+/, ''));
          const filePath = path.resolve(srcDir, relativePath);
          if (
            !isRuntimeAsset(relativePath) ||
            !(filePath === srcDir || filePath.startsWith(`${srcDir}${path.sep}`)) ||
            !fs.existsSync(filePath) ||
            fs.statSync(filePath).isDirectory()
          ) {
            next();
            return;
          }

          const ext = path.extname(filePath);
          res.setHeader('Content-Type', ext === '.gz' ? 'application/gzip' : 'application/json');
          fs.createReadStream(filePath).pipe(res);
        },
      );
    },
    writeBundle(options: { dir?: string }) {
      if (options.dir) {
        copyRuntimeAssets(srcDir, path.join(options.dir, 'math-bank'));
      }
    },
  };
};
