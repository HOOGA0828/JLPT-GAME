import fs from 'fs';
import path from 'path';

const files = ['n1-questions.json', 'n2-questions.json', 'n3-questions.json'];
const dataDir = path.join(process.cwd(), 'public', 'data');

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) return;

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        console.log(`Scanning ${file}...`);
        let count = 0;

        data.forEach((item: any, index: number) => {
            if (!item.distractors) return;

            // Check for potential issues
            const issues = [];

            // 1. Check for Latin characters (A-Z, a-z)
            if (item.distractors.some((d: string) => /[a-zA-Z]/.test(d))) {
                issues.push("Contains Latin characters");
            }

            // 2. Check for "invalid" or "incorrect" specific keywords (redundant if (1) catches it, but good for labeling)
            if (item.distractors.some((d: string) => d.includes("invalid") || d.includes("incorrect") || d.includes("Option"))) {
                issues.push("Explicit invalid text");
            }

            // 3. Check for duplicates
            if (new Set(item.distractors).size !== item.distractors.length) {
                issues.push("Duplicate distractors");
            }

            if (issues.length > 0) {
                console.log(`[Line ~${index * 10}] ${item.kanji} (${item.reading}): ${JSON.stringify(item.distractors)} - ${issues.join(", ")}`);
                count++;
            }
        });

        if (count === 0) console.log("No obvious issues found.");

    } catch (e) {
        console.error(`Error reading ${file}`, e);
    }
});
