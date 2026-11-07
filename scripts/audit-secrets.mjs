import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const sensitivePatterns = [
  { name: 'GitHub Classic Token', regex: /ghp_[a-zA-Z0-9]{30,}/ },
  { name: 'GitHub Fine-grained PAT', regex: /github_pat_[a-zA-Z0-9_]{50,}/ },
  { name: 'OpenAI Secret Key', regex: /sk-[a-zA-Z0-9]{32,}/ },
  { name: 'Generic API Key Assignment', regex: /(?:api[_-]?key|apikey|secret|token)\s*[:=]\s*['"`]([a-zA-Z0-9_\-]{20,})['"`]/i },
  { name: 'Bearer Token Header', regex: /bearer\s+([a-zA-Z0-9_\-\.]{25,})/i },
  { name: 'Hardcoded Password', regex: /(?:password|passwd|pwd)\s*[:=]\s*['"`]([^\s'"`]{8,})['"`]/i },
  { name: 'Originkit Token', regex: /(?:originkit[_-]api[_-]key|originkit_secret)\s*[:=]\s*['"`]([a-zA-Z0-9_\-]{16,})['"`]/i },
];

const ignoredDirs = new Set(['node_modules', 'dist', '.git', 'screenshots']);
const ignoredExts = new Set(['.png', '.jpg', '.jpeg', '.glb', '.ico', '.svg', '.woff', '.woff2']);

let findings = 0;

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name) || entry.name.startsWith('.chrome')) continue;
      scan(path.join(dir, entry.name));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ignoredExts.has(ext)) continue;
      const fullPath = path.join(dir, entry.name);
      const relative = path.relative(root, fullPath);

      // Do not scan this audit script itself
      if (relative === 'scripts\\audit-secrets.mjs' || relative === 'scripts/audit-secrets.mjs') continue;

      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pat of sensitivePatterns) {
        if (pat.regex.test(content)) {
          console.warn(`[WARNING] Potential secret pattern matched: ${pat.name} in ${relative}`);
          findings++;
        }
      }
    }
  }
}

console.log('Scanning project files for secrets and credentials in:', root);
scan(root);
console.log(`Scan completed. Total potential secret findings: ${findings}`);
if (findings > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
