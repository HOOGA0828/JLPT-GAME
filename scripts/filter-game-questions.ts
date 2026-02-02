import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'public', 'data');
const files = ['n1-questions.json', 'n2-questions.json', 'n3-questions.json'];

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const questions = JSON.parse(rawData);
        let updatedCount = 0;

        const updatedQuestions = questions.map((q: any) => {
            const shouldDisable = q.kanji === q.reading;
            if (q.game_enabled !== !shouldDisable) { // Only update if changed
                if (shouldDisable) {
                    updatedCount++;
                }
                return { ...q, game_enabled: !shouldDisable };
            }
            return q;
        });

        fs.writeFileSync(filePath, JSON.stringify(updatedQuestions, null, 2), 'utf8');
        console.log(`Updated ${file}: marked ${updatedCount} items as disabled for game.`);
    } catch (err) {
        console.error(`Error processing ${file}:`, err);
    }
});
