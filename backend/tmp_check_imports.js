import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkDirectory(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  let hasError = false;
  for (const file of files) {
    try {
      await import(`file://${path.join(dir, file)}`);
    } catch (error) {
      console.error(`Error loading ${file}:`, error.message);
      hasError = true;
    }
  }
  return hasError;
}

async function main() {
  console.log('Checking controllers...');
  const ctrlError = await checkDirectory(path.join(__dirname, 'controllers'));
  console.log('Checking routes...');
  const routeError = await checkDirectory(path.join(__dirname, 'routes'));
  
  if (ctrlError || routeError) {
    process.exit(1);
  } else {
    console.log('All controllers and routes imported successfully!');
  }
}

main();
