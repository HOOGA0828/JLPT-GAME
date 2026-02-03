
import fs from 'fs';
import path from 'path';

async function checkLevel(level: string, reportVal: any) {
    const filePath = path.join(process.cwd(), 'public', 'data', `${level}-questions.json`);

    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }

    // console.log(`Checking ${level}...`);
    const content = fs.readFileSync(filePath, 'utf-8');
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        console.error(`Failed to parse ${level}:`, e);
        return;
    }

    data.forEach((item: any, index: number) => {
        const reading = item.reading ? item.reading.trim() : "";
        if (!item.distractors || !Array.isArray(item.distractors)) {
            // console.warn(`[WARN] Item ${index} (${item.kanji}) has invalid distractors format.`);
            return;
        }

        const distractors = item.distractors.map((d: string) => d.trim());

        // Check 1: Reading is in distractors
        if (distractors.includes(reading)) {
            reportVal.readingIssues++;
            reportVal.details.push(`[ISSUE-READING] [${level}] Kanji: ${item.kanji}, Reading: ${reading}, Distractors: ${JSON.stringify(distractors)}`);
        }

        // Check 2: Kanji in distractors
        // Regex for Kanji range (Common CJK Unified Ideographs)
        // \u4e00-\u9faf is the common block. 
        const kanjiRegex = /[\u4e00-\u9faf]/;
        const hasKanji = distractors.some((d: string) => kanjiRegex.test(d));

        if (hasKanji) {
            reportVal.kanjiIssues++;
            reportVal.details.push(`[ISSUE-KANJI] [${level}] Kanji detected in distractors for: ${item.kanji}, Distractors: ${JSON.stringify(distractors)}`);
        }

        // Check 3: invalid_fix or fix_me placeholders
        const hasBadPlaceholder = distractors.some((d: string) => d.includes('invalid_fix') || d.includes('fix_me'));
        if (hasBadPlaceholder) {
            reportVal.kanjiIssues++; // Count as general issue for now
            reportVal.details.push(`[ISSUE-PLACEHOLDER] [${level}] Bad placeholder detected for: ${item.kanji}, Distractors: ${JSON.stringify(distractors)}`);
        }
    });
}

async function main() {
    const report = {
        n1: { readingIssues: 0, kanjiIssues: 0, details: [] as string[] },
        n2: { readingIssues: 0, kanjiIssues: 0, details: [] as string[] },
        n3: { readingIssues: 0, kanjiIssues: 0, details: [] as string[] }
    };

    await checkLevel('n1', report.n1);
    await checkLevel('n2', report.n2);
    await checkLevel('n3', report.n3);

    fs.writeFileSync('check_results.log', JSON.stringify(report, null, 2));
    console.log('Results written to check_results.log');
}

main().catch(console.error);
