import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '../EVENTHUB');
const destDir = path.join(__dirname, 'src/public');

// Ensure destination exists
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

function copyRecursive(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath);
            }
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log(`📦 Copying Frontend from ${sourceDir} to ${destDir}...`);
try {
    copyRecursive(sourceDir, destDir);
    console.log("✅ Frontend copied successfully!");
    console.log("🚀 You can now commit and push the 'Backend' folder to GitHub for deployment.");
} catch (err) {
    console.error("❌ Error copying frontend:", err);
}
