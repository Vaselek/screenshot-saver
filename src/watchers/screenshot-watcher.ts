import chokidar from 'chokidar';
import path from 'path';
import os from 'os';
import { analyzeImage } from '../services/anthropicService.js';
import { saveScreenshot } from '../services/dbService.js';

// Expand the home directory for macOS
const SCREENSHOT_DIR = path.join(os.homedir(), 'Documents/NewScreenshots');

// Create a type guard for screenshots
const isScreenshot = (filepath: string): boolean => {
    const ext = path.extname(filepath).toLowerCase();
    return ['.png', '.jpg', '.jpeg'].includes(ext);
};

// Process the screenshot
const processNewScreenshot = async (filepath: string): Promise<void> => {
    try {
        console.log('Processing new screenshot:', filepath);
        const analysisText = await analyzeImage(filepath);

        // Parse the response content
        const analysisContent = JSON.parse(analysisText);

        // Save to database
        await saveScreenshot({
            filepath,
            visual_elements: analysisContent.visual_elements,
            content_context: analysisContent.content_context,
            temporal_context: analysisContent.temporal_context,
            searchable_tags: analysisContent.searchable_tags.join(', ')
        });
        console.log('Screenshot analyzed and saved to database:', filepath);
    } catch (error) {
        console.error('Error processing screenshot:', error);
    }
};

// Initialize the watcher
export const initializeWatcher = (): void => {
    console.log(`Starting screenshot watcher for directory: ${SCREENSHOT_DIR}`);

    const watcher = chokidar.watch(SCREENSHOT_DIR, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });

    watcher
        .on('add', async (filepath) => {
            if (isScreenshot(filepath)) {
                await processNewScreenshot(filepath);
            }
        })
        .on('error', (error) => {
            console.error('Watcher error:', error);
        });
};