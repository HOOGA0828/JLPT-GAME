
import fs from 'fs';
import path from 'path';

async function checkLevel(level: string) {
    const filePath = path.join(process.cwd(), 'public', 'data', `${level}-questions.json`);

    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }

    console.log(`\nChecking ${level}...`);
    const content = fs.readFileSync(filePath, 'utf-8');
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        console.error(`Failed to parse ${level}:`, e);
        return;
    }

    let issuesCount = 0;

    data.forEach((item: any, index: number) => {
        const reading = item.reading ? item.reading.trim() : "";
        if (!item.distractors || !Array.isArray(item.distractors)) {
            console.warn(`[WARN] Item ${index} (${item.kanji}) has invalid distractors format.`);
            return;
        }

        const distractors = item.distractors.map((d: string) => d.trim());

        if (distractors.includes(reading)) {
            console.log(`[ISSUE] Kanji: ${item.kanji}`);
            console.log(`        Reading: ${reading}`);
            console.log(`        Distractors: ${JSON.stringify(distractors)}`);
            issuesCount++;
        }
    });

    console.log(`Total issues in ${level}: ${issuesCount}`);
}

async function main() {
    await checkLevel('n1');
    await checkLevel('n2');
    await checkLevel('n3');
}

main().catch(console.error);
