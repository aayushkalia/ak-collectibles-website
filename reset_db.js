const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Resetting database...');

const filesToDelete = ['database.db', 'database.db-shm', 'database.db-wal'];

filesToDelete.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted ${file}`);
    } catch (e) {
      console.log(`Failed to delete ${file}: ${e.message}`);
    }
  }
});

console.log('Running seed script...');
try {
  execSync('node src/lib/seed.js', { stdio: 'inherit' });
  console.log('Database reset complete.');
} catch (e) {
  console.error('Seed script failed:', e.message);
}
