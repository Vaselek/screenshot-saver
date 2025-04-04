import Anthropic from "@anthropic-ai/sdk";
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
}

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

export async function analyzeImage(imagePath: string): Promise<string> {
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });

    const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 5000,
        temperature: 1,
        system: `You are an expert in analyzing UI screenshots and technical documentation. Analyze each image and respond in the following structured JSON format:
{
    "visual_elements": {
        "ui_components": [list of all UI elements with their properties (type, color, text, state)],
        "layout": "brief description of layout and positioning",
        "color_scheme": "dominant colors and color patterns"
    },
    "content_context": {
        "topic": "main subject or purpose of the screenshot",
        "technical_details": "any technical information (API references, code snippets, version numbers)",
        "documentation_type": "type of content (e.g., API docs, code editor, dashboard, settings page)",
        "references": "any specific product/service mentions (e.g., Stripe, AWS, specific libraries)"
    },
    "temporal_context": {
        "version_indicators": "any visible version numbers or dates",
        "ui_generation": "indicators if this is a modern or legacy interface"
    },
    "searchable_tags": ["comprehensive list of key terms for search matching without too common terms, for example 'screenshot'"]
}`,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "image",
                        source: {
                            type: "base64",
                            media_type: "image/png",
                            data: base64Image
                        }
                    }
                ]
            }
        ]
    });

    const content = response.content[0];
    if (!('text' in content)) {
        throw new Error('Unexpected response format from Anthropic API');
    }
    return content.text;
}
