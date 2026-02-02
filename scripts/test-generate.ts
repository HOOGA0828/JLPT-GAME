
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testGeneration() {
    console.log("Running small test generation (5 items)...");
    const csvPath = path.join(process.cwd(), 'public', 'data', 'n1.csv');

    if (!fs.existsSync(csvPath)) {
        console.error(`File not found: ${csvPath}`);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    // Take only first 5 items
    const testBatch = parsed.data.slice(0, 5).map((row: any) => ({
        kanji: row.kanji || row.Kanji || row.vocabulary || row.expression || "Unknown",
        reading: row.reading || row.Reading || row.hiragana || "Unknown",
        meaning: row.meaning || row.Meaning || ""
    })).filter((item: any) => item.kanji !== "Unknown");

    console.log("Input Batch:", JSON.stringify(testBatch, null, 2));

    try {
        const model = process.env.OPENAI_MODEL || "gpt-5-nano";
        console.log(`Using model: ${model}`);

        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "system",
                    content: `You are a Japanese language teacher. 
                    For each vocabulary item provided, generate 3 distractor readings (wrong options) that look/sound similar to the correct reading but are incorrect.
                    
                    CRITICAL: You MUST return a valid JSON object with a strict structure.
                    Example Input: [{"kanji": "猫", "reading": "ねこ"}]
                    Example Output: { "items": [{ "kanji": "猫", "reading": "ねこ", "distractors": ["ぬこ", "ねろ", "わこ"] }] }`
                },
                {
                    role: "user",
                    content: JSON.stringify(testBatch)
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        console.log("\n--- Raw OpenAI Output ---");
        console.log(content);
        console.log("-------------------------\n");

        if (content) {
            const parsed = JSON.parse(content);
            const items = Array.isArray(parsed) ? parsed : (parsed.items || parsed.data || []);
            console.log("Parsed Items:", JSON.stringify(items, null, 2));
        }

    } catch (err: any) {
        console.error("Error during test:", err.message);
        if (err.response) {
            console.error(err.response.data);
        }
    }
}

testGeneration();
