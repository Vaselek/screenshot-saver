import db from '../db/init.js';

export interface Screenshot {
    filepath: string;
    visual_elements: any;
    content_context: any;
    temporal_context: any;
    searchable_tags: string;
}

export const saveScreenshot = (screenshot: Screenshot) => {
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO screenshots 
    (filepath, visual_elements, content_context, temporal_context, searchable_tags)
    VALUES (?, ?, ?, ?, ?)
  `);

    return stmt.run(
        screenshot.filepath,
        JSON.stringify(screenshot.visual_elements),
        JSON.stringify(screenshot.content_context),
        JSON.stringify(screenshot.temporal_context),
        screenshot.searchable_tags
    );
};