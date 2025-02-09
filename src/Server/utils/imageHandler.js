
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

export const saveImage = async (image, index = 0) => {
  if (image && image.startsWith('data:image')) {
    const imageBuffer = Buffer.from(image.split(',')[1], 'base64');
    if (imageBuffer.length > 5 * 1024 * 1024) {
      throw new Error('Image too large (max 5MB)');
    }
    const imagePath = path.join(uploadsDir, `${Date.now()}_${index}.jpg`);
    await fs.promises.writeFile(imagePath, imageBuffer);
    return `/uploads/${path.basename(imagePath)}`;
  }
  throw new Error('Invalid image format');
};
