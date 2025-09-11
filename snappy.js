import snappy from 'snappyjs';
import fs from 'fs-extra';
import path from 'path';

async function compressFile(filePath) {
  try {
    const data = await fs.readFile(filePath);
    const compressed = snappy.compress(data);
    await fs.writeFile(`${filePath}.sz`, compressed);
  } catch (err) {
    console.error('Error compressing file:', err);
  }
}

async function compressDirectory(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);

    for (const file of files) {
      const fullPath = path.join(directoryPath, file);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await compressDirectory(fullPath);
      } else if (stat.isFile() && ['.js', '.css'].includes(path.extname(fullPath))) {
        await compressFile(fullPath);
      }
    }
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}

compressDirectory('./js');
compressDirectory('./css');
