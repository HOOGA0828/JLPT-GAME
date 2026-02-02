
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const LEVELS = ['n3', 'n2', 'n1'];
const BATCH_SIZE = 50;

async function processLevel(level: string) {
    const filePath = path.join(process.cwd(), 'public', 'data', `${level}-questions.json`);

    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }

    console.log(`Processing ${level}...`);
    const content = fs.readFileSync(filePath, 'utf-8');
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        console.error(`Failed to parse ${level}:`, e);
        return;
    }

    // Filter items currently missing Chinese meaning
    // We update in place, so we find indices of items needing update
    const itemsToUpdate = data.filter((item: any) => !item.meaning_zh);

    if (itemsToUpdate.length === 0) {
        console.log(`All items in ${level} already have meanings.`);
        return;
    }

    console.log(`Found ${itemsToUpdate.length} items needing translation in ${level}.`);
    fs.appendFileSync('translation_log.txt', `Found ${itemsToUpdate.length} items needing translation in ${level}.\n`);

    for (let i = 0; i < itemsToUpdate.length; i += BATCH_SIZE) {
        const batch = itemsToUpdate.slice(i, i + BATCH_SIZE);
        const logMsg = `translating batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(itemsToUpdate.length / BATCH_SIZE)} for ${level}...\n`;
        console.log(logMsg);
        fs.appendFileSync('translation_log.txt', logMsg);

        const promptItems = batch.map((item: any) => ({ kanji: item.kanji, reading: item.reading }));

        try {
            const model = process.env.OPENAI_MODEL || "gpt-5-nano";
            const response = await openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: `You are a Japanese to Traditional Chinese translator.
                        Translate the following Japanese vocabulary items into Traditional Chinese (Taiwan).
                        
                        Requirements:
                        1. Meanings must be concise (max 10 characters).
                        2. Output specific JSON format: { "items": [{ "kanji": "...", "meaning_zh": "..." }] }
                        3. Ensure the order matches the input or use kanji as key to map back.
                        `
                    },
                    {
                        role: "user",
                        content: JSON.stringify(promptItems)
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (content) {
                const parsed = JSON.parse(content);
                const results = parsed.items || [];

                // Merge back to data
                for (const result of results) {
                    const originalItem = data.find((d: any) => d.kanji === result.kanji && !d.meaning_zh);
                    if (originalItem) {
                        originalItem.meaning_zh = result.meaning_zh;
                    }
                }

                // Save incrementally to avoid data loss on crash
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            }

        } catch (err: any) {
            console.error(`Error in batch: ${err.message}`);
            // Continue to next batch
        }

        // Rate limit kindness
        await new Promise(res => setTimeout(res, 200));
    }

    console.log(`Completed ${level}.`);
}

async function main() {
    for (const level of LEVELS) {
        await processLevel(level);
    }
}

main().catch(console.error);
