
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testProcess() {
    const filePath = path.join(process.cwd(), 'public', 'data', 'n3-questions.json');
    console.log(`Reading ${filePath}...`);

    if (!fs.existsSync(filePath)) {
        console.error("File not found");
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    const itemsToUpdate = data.filter((item: any) => !item.meaning_zh).slice(0, 3);
    console.log(`Testing with ${itemsToUpdate.length} items...`);
    console.log(`Sample item: ${JSON.stringify(itemsToUpdate[0])}`);

    if (itemsToUpdate.length === 0) return;

    try {
        const model = process.env.OPENAI_MODEL || "gpt-5-nano";
        console.log(`Using model: ${model}`);

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
                    `
                },
                {
                    role: "user",
                    content: JSON.stringify(itemsToUpdate.map((i: any) => ({ kanji: i.kanji, reading: i.reading })))
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        console.log("Response:", content);

        if (content) {
            const parsed = JSON.parse(content);
            const results = parsed.items || [];
            console.log(`Parsed ${results.length} results.`);

            // Do NOT save, just log
            for (const res of results) {
                console.log(`Would update ${res.kanji} -> ${res.meaning_zh}`);
            }
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

testProcess().catch(console.error);
