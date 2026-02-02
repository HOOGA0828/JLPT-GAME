
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function processLevel(level: string) {
    console.log(`Processing ${level}...`);
    const csvPath = path.join(process.cwd(), 'public', 'data', `${level}.csv`);

    if (!fs.existsSync(csvPath)) {
        console.warn(`File not found: ${csvPath}`);
        return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    const rawData = parsed.data.map((row: any) => ({
        kanji: row.kanji || row.Kanji || row.vocabulary || row.expression || "Unknown",
        reading: row.reading || row.Reading || row.hiragana || "Unknown",
        meaning: row.meaning || row.Meaning || ""
    })).filter((item: any) => item.kanji !== "Unknown" && item.reading !== "Unknown");

    console.log(`Loaded ${rawData.length} items for ${level}.`);

    // Process in batches to save tokens and requests
    const BATCH_SIZE = 20;
    const processedData = [];

    // Clear previous error log
    if (fs.existsSync('generation_error_log.txt') && processedData.length === 0) {
        fs.unlinkSync('generation_error_log.txt');
    }

    for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
        const batch = rawData.slice(i, i + BATCH_SIZE);
        console.log(`Generating batch ${i / BATCH_SIZE + 1} / ${Math.ceil(rawData.length / BATCH_SIZE)}...`);

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
                        content: JSON.stringify(batch)
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (content) {
                try {
                    const parsedResponse = JSON.parse(content);
                    const items = Array.isArray(parsedResponse) ? parsedResponse : (parsedResponse.items || parsedResponse.data || []);

                    if (items.length > 0) {
                        processedData.push(...items);
                    } else {
                        const msg = `Batch returned empty items. Preview: ${content.substring(0, 100)}...`;
                        console.warn(msg);
                        fs.appendFileSync('generation_error_log.txt', `\n--- Empty/Invalid Batch ---\nRaw Content:\n${content}\n`);

                        // Fallback logic
                        processedData.push(...batch.map((b: any) => ({ ...b, distractors: ["incorrect1", "incorrect2", "incorrect3"] })));
                    }
                } catch (parseError) {
                    const msg = `JSON Parse Error: ${parseError}`;
                    console.error(msg);
                    fs.appendFileSync('generation_error_log.txt', `\n--- JSON Parse Error ---\nError: ${parseError}\nRaw Content:\n${content}\n`);

                    processedData.push(...batch.map((b: any) => ({ ...b, distractors: ["incorrect1", "incorrect2", "incorrect3"] })));
                }
            }
        } catch (err: any) {
            const msg = `API/Network Error: ${err.message}`;
            console.error(msg);
            fs.appendFileSync('generation_error_log.txt', `\n--- API Error ---\n${err.message}\n`);

            processedData.push(...batch.map((b: any) => ({ ...b, distractors: ["err1", "err2", "err3"] })));
        }

        // Tiny delay to avoid rate limits if any
        await new Promise(res => setTimeout(res, 500));
    }

    const outputPath = path.join(process.cwd(), 'public', 'data', `${level}-questions.json`);

    // Post-processing: Mark questions where kanji === reading as not suitable for game
    const finalData = processedData.map((item: any) => ({
        ...item,
        game_enabled: item.kanji !== item.reading
    }));

    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
    console.log(`Saved ${finalData.length} questions to ${outputPath}`);
}

async function main() {
    await processLevel('n1');
    await processLevel('n2');
    await processLevel('n3');
}

main().catch(console.error);
