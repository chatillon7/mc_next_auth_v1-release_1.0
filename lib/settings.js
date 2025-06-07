import fs from 'fs/promises';
const SETTINGS_PATH = process.env.SETTINGS_PATH || 'db/settings.json';

export async function getSettings() {
  try {
    const data = await fs.readFile(SETTINGS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function saveSettings(newSettings) {
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(newSettings, null, 2), 'utf-8');
}
