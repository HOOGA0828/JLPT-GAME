
import Papa from 'papaparse';

export interface VocabItem {
    kanji: string;
    reading: string;
    meaning?: string;
}

export interface QuizQuestion {
    kanji: string;
    correctReading: string;
    meaning?: string;
    options: string[]; // 4 options including correct one
}

// Mock function for now. In future, this will call OpenAI API.
// Current implementation: select random readings from the provided full list.
export async function generateDistractors(current: VocabItem, allItems: VocabItem[]): Promise<string[]> {
    const distractors = new Set<string>();

    // Try to find 3 unique distractors (excluding correct reading)
    let attempts = 0;
    while (distractors.size < 3 && attempts < 100) {
        const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
        if (randomItem.reading !== current.reading && !distractors.has(randomItem.reading)) {
            distractors.add(randomItem.reading);
        }
        attempts++;
    }

    // Fallback if dataset is too small
    const fillers = ["あ", "い", "う", "え", "お"];
    while (distractors.size < 3) {
        distractors.add(fillers[distractors.size] || `Wrong ${distractors.size}`);
    }

    return Array.from(distractors);
}

// Static JSON version
export async function fetchQuestions(level: string): Promise<QuizQuestion[]> {
    try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const response = await fetch(`${basePath}/data/${level}-questions.json`);
        if (!response.ok) {
            // Fallback for demo if users haven't run the script yet
            console.warn("Static JSON not found, falling back to basic flow or error.");
            return [];
        }
        const data = await response.json();

        // Map JSON data to QuizQuestion format
        return data.map((item: any) => ({
            kanji: item.kanji,
            correctReading: item.reading,
            meaning: item.meaning_zh,
            options: [...(item.distractors || []), item.reading].sort(() => 0.5 - Math.random())
        }));
    } catch (err) {
        console.error("Failed to load questions:", err);
        return [];
    }
}

export async function createQuizSet(level: string, count: number = 15): Promise<QuizQuestion[]> {
    const allQuestions = await fetchQuestions(level);

    if (allQuestions.length === 0) {
        // Fallback mockup if file doesn't exist yet
        return [
            { kanji: "Error", correctReading: "Run Script", options: ["Run", "Generate", "Script", "First"] }
        ];
    }

    // Shuffle and slice
    return allQuestions.sort(() => 0.5 - Math.random()).slice(0, count);
}
