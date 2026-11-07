import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const findings = [];

function checkFile(filePath) {
  const rel = path.relative(root, filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check 1: dangerouslySetInnerHTML
  if (content.includes('dangerouslySetInnerHTML')) {
    findings.push({ severity: 'High', type: 'XSS', file: rel, detail: 'dangerouslySetInnerHTML detected' });
  }

  // Check 2: innerHTML
  if (/\.innerHTML\s*=/.test(content)) {
    findings.push({ severity: 'High', type: 'XSS', file: rel, detail: 'direct innerHTML assignment' });
  }

  // Check 3: target="_blank" without noopener
  const blankMatches = content.match(/<a[^>]*target=["']_blank["'][^>]*>/gi) || [];
  for (const m of blankMatches) {
    if (!m.includes('noopener') || !m.includes('noreferrer')) {
      findings.push({ severity: 'Low', type: 'Reverse Tabnabbing', file: rel, detail: `target="_blank" without rel="noopener noreferrer": ${m}` });
    }
  }

  // Check 4: javascript: pseudo-protocol
  if (/href=["']javascript:/i.test(content)) {
    findings.push({ severity: 'High', type: 'XSS', file: rel, detail: 'javascript: URI found in href' });
  }

  // Check 5: eval() or Function()
  if (/\beval\s*\(/.test(content) || /\bnew\s+Function\s*\(/.test(content)) {
    findings.push({ severity: 'Critical', type: 'Code Injection', file: rel, detail: 'eval or Function constructor found' });
  }

  // Check 6: Fake reviews / fake testimonials / fake statistics
  if (/(?:98% success rate|guaranteed scholarship|100% funded|50,000\+ students funded)/i.test(content)) {
    findings.push({ severity: 'Medium', type: 'Misleading Claim', file: rel, detail: 'Potentially misleading statistic or guarantee claim' });
  }

  // Check 7: Aadhaar / SSN / Bank account collection
  if (/(?:aadhaar|aadhar|bank account number|ifsc|pan card)\s*:/i.test(content)) {
    findings.push({ severity: 'Medium', type: 'Privacy / Data Minimization', file: rel, detail: 'Sensitive personal identifier field found' });
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git' || entry.name === 'screenshots') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.html'))) {
      checkFile(p);
    }
  }
}

console.log('Running comprehensive security & privacy scan across source files...');
walk(path.join(root, 'src'));
checkFile(path.join(root, 'index.html'));

console.log(`Scan completed with ${findings.length} findings:`);
console.log(JSON.stringify(findings, null, 2));
