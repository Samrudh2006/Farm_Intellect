import { execFile } from 'child_process';
import { promisify } from 'util';
import { logger } from './logger.js';

const execFileAsync = promisify(execFile);

export const scanFileForThreats = async (filePath) => {
  const scannerPath = process.env.CLAMAV_PATH;
  if (!scannerPath) {
    return { status: 'skipped' };
  }

  try {
    const { stdout } = await execFileAsync(scannerPath, ['--no-summary', filePath]);
    if (stdout.includes('OK')) {
      return { status: 'clean' };
    }
    return { status: 'infected', details: stdout.trim() };
  } catch (error) {
    logger.warn('File scan failed', { error: error.message });
    return { status: 'failed', details: error.message };
  }
};
