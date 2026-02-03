
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function processLevel(level: string) {
    const filePath = path.join(process.cwd(), 'public', 'data', `${level}-questions.json`);

    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }

    console.log(`Checking ${level}...`);
    const content = fs.readFileSync(filePath, 'utf-8');
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        console.error(`Failed to parse ${level}:`, e);
        return;
    }

    // Identify invalid items
    const invalidItems = data.filter((item: any) => {
        if (!item.distractors) return true;

        // condition 1: contains placeholder text or "bad" keywords
        const hasPlaceholder = item.distractors.some((d: string) => {
            const lowerD = d.toLowerCase();
            return lowerD.includes("incorrect") ||
                lowerD.includes("invalid") ||
                lowerD.includes("option") ||
                lowerD.includes("選項") ||
                lowerD.includes("null") ||
                lowerD.includes("undefined");
        });

        // condition 2: duplicate distractors (same as reading)
        const hasDuplicateReading = item.distractors.includes(item.reading);

        // condition 3: insufficient distractors
        const hasInsufficient = item.distractors.length < 3;

        // condition 4: duplicate distractors (within themselves)
        const hasDuplicateDistractors = new Set(item.distractors).size !== item.distractors.length;

        // condition 5: Kanji in distractors
        const kanjiRegex = /[\u4e00-\u9faf]/;
        const hasKanji = item.distractors.some((d: string) => kanjiRegex.test(d));

        return hasPlaceholder || hasDuplicateReading || hasInsufficient || hasDuplicateDistractors || hasKanji;
    });

    console.log(`Found ${invalidItems.length} invalid items in ${level}.`);

    if (invalidItems.length === 0) {
        console.log(`No fix needed for ${level}.`);
        return;
    }

    // Process in batches
    const BATCH_SIZE = 5;

    for (let i = 0; i < invalidItems.length; i += BATCH_SIZE) {
        const batch = invalidItems.slice(i, i + BATCH_SIZE);
        console.log(`Fixing batch ${i / BATCH_SIZE + 1} / ${Math.ceil(invalidItems.length / BATCH_SIZE)}...`);

        try {
            const model = process.env.OPENAI_MODEL || "gpt-5-nano";
            const response = await openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: `You are a Japanese language teacher correcting a quiz database.
                        The provided items have invalid, placeholder, DUPLICATE, or KANJI-CONTAINING distractors.
                        Generate 3 NEW, VALID, UNIQUE distractor readings for each item.
                        
                        CRITICAL RULES:
                        1. Distractors must look/sound similar to the correct reading.
                        2. Distractors must NOT be the same as the correct reading.
                        3. Distractors must be written in HIRAGANA or KATAKANA only. NO KANJI allowed.
                        4. Return a valid JSON object with a strict structure.
                        
                        Example Input: [{"kanji": "重力", "reading": "じゅうりょく", "distractors": ["じゅうりょう", "ちょうりょく", "重力"]}]
                        Example Output: { "items": [{ "kanji": "重力", "reading": "じゅうりょく", "distractors": ["じゅうりょう", "ちょうりょく", "じゅうろく"] }] }`
                    },
                    {
                        role: "user",
                        content: JSON.stringify(batch)
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            console.log("Raw AI response:", content);

            if (content) {
                try {
                    const parsedResponse = JSON.parse(content);
                    const fixedItems = Array.isArray(parsedResponse) ? parsedResponse : (parsedResponse.items || parsedResponse.data || []);

                    // Update original data
                    console.log(`AI returned ${fixedItems.length} items for correction.`);
                    for (const fixed of fixedItems) {
                        const originalIndex = data.findIndex((item: any) => item.kanji === fixed.kanji);
                        if (originalIndex !== -1) {
                            // Ensure strict check again just in case AI failed
                            const validDist = fixed.distractors.filter((d: string) => d !== fixed.reading);
                            // If AI made mistake again, fill with placeholders to avoid infinite loop or crash, but hopefully prompt handles it
                            while (validDist.length < 3) validDist.push(`invalid_fix_${validDist.length}`);

                            // Check if distinct
                            const oldDist = JSON.stringify(data[originalIndex].distractors);
                            const newDist = JSON.stringify(validDist.slice(0, 3));

                            if (oldDist !== newDist) {
                                data[originalIndex].distractors = validDist.slice(0, 3);
                                console.log(`[FIXED] ${fixed.kanji}: ${oldDist} -> ${newDist}`);
                            } else {
                                console.warn(`[SKIPPED] ${fixed.kanji}: New distractors same as old (AI returned duplicate?). Force fixing.`);
                                // Force fix if AI returns same/invalid
                                // Force fix if AI returns same/invalid
                                data[originalIndex].distractors = ["fix_me_1", "fix_me_2", "fix_me_3"]; // Temporary placeholder, user can re-run fix or we can retry logic
                                console.log(`[FORCE FIXED] ${fixed.kanji}: Forced to placeholders.`);
                                console.log(`[FORCE FIXED] ${fixed.kanji}: Forced to placeholders.`);
                            }
                        } else {
                            console.warn(`[MATCH FAIL] Could not find original item for Kanji: ${fixed.kanji} (AI might have changed it)`);
                        }
                    }
                } catch (parseError) {
                    console.error("JSON Parse Error during fix:", parseError);
                }
            }
        } catch (err: any) {
            console.error(`API Error: ${err.message}`);
        }

        // Tiny delay
        await new Promise(res => setTimeout(res, 500));
    }

    // Save back
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Fixed and saved ${level}.`);
}

async function main() {
    await processLevel('n1');
    await processLevel('n2');
    await processLevel('n3');
}

main().catch(console.error);
