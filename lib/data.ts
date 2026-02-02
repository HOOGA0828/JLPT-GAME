import n1Data from '../public/data/n1-questions.json';
import n2Data from '../public/data/n2-questions.json';
import n3Data from '../public/data/n3-questions.json';

export type Question = {
    kanji: string;
    reading: string;
    meaning_zh: string;
    distractors: string[];
    level: 'N1' | 'N2' | 'N3';
    game_enabled?: boolean;
};

const validateQuestions = (data: any[], level: 'N1' | 'N2' | 'N3'): Question[] => {
    return data
        .filter(q => q.kanji && q.reading && q.meaning_zh && Array.isArray(q.distractors) && q.distractors.length > 0)
        .map(q => ({
            kanji: q.kanji,
            reading: q.reading,
            meaning_zh: q.meaning_zh,
            distractors: q.distractors,
            level,
            game_enabled: q.game_enabled, // Optional, defaults to undefined (effectively true)
        }));
};

export const getAllQuestions = (): Question[] => {
    const n1 = validateQuestions(n1Data, 'N1');
    const n2 = validateQuestions(n2Data, 'N2');
    const n3 = validateQuestions(n3Data, 'N3');
    return [...n1, ...n2, ...n3];
};
