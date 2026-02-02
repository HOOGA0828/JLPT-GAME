import { create } from 'zustand';
import { Question, getAllQuestions } from './data';

interface QuizState {
    // Config
    questions: Question[];
    n1Count: number;
    n2Count: number;
    n3Count: number;
    isHybrid: boolean;

    // Game State
    isPlaying: boolean;
    currentIndex: number;
    answers: { question: Question; selected: string; isCorrect: boolean; timeTaken: number }[];
    startTime: number;

    // Actions
    setCounts: (n1: number, n2: number, n3: number) => void;
    startQuiz: () => void;
    answerQuestion: (selected: string) => void;
    nextQuestion: () => void;
    resetQuiz: () => void;
    endQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
    questions: [],
    n1Count: 5,
    n2Count: 10,
    n3Count: 5,
    isHybrid: true,

    isPlaying: false,
    currentIndex: 0,
    answers: [],
    startTime: 0,

    setCounts: (n1, n2, n3) => set({ n1Count: n1, n2Count: n2, n3Count: n3 }),

    startQuiz: () => {
        const { n1Count, n2Count, n3Count } = get();
        const allQuestions = getAllQuestions();

        // Shuffle and pick
        // Filter out questions where game_enabled is explicitly false
        const n1Pool = allQuestions.filter(q => q.level === 'N1' && q.game_enabled !== false).sort(() => 0.5 - Math.random());
        const n2Pool = allQuestions.filter(q => q.level === 'N2' && q.game_enabled !== false).sort(() => 0.5 - Math.random());
        const n3Pool = allQuestions.filter(q => q.level === 'N3' && q.game_enabled !== false).sort(() => 0.5 - Math.random());

        const selectedQuestions = [
            ...n1Pool.slice(0, n1Count),
            ...n2Pool.slice(0, n2Count),
            ...n3Pool.slice(0, n3Count),
        ].sort(() => 0.5 - Math.random()); // Shuffle final list

        // Randomize distractors placement for each question (already random in data? No, usually Distractors + Correct Answer need shuffling)
        // The data structure has "distractors", but we need to form a "options" array that includes the correct answer.
        // I'll handle option shuffling in the Component to keep store clean? 
        // Or better, pre-process here. Let's pre-process options here for consistency.
        // Actually, to keep it simple, I'll just store the questions. The component will derive options.

        set({
            questions: selectedQuestions,
            isPlaying: true,
            currentIndex: 0,
            answers: [],
            startTime: Date.now(),
        });
    },

    answerQuestion: (selected) => {
        const { questions, currentIndex, answers } = get();
        const currentQ = questions[currentIndex];
        const isCorrect = selected === currentQ.reading; // Compare with reading (Hiragana) which is usually the answer key in these quizzes? 
        // Wait, prompt said: "正確答案" and "3 個混淆項". The "reading" IS the answer usually for Kanji quiz.
        // Let's assume the question is "Kanji" and options are "Readings".

        const newAnswer = {
            question: currentQ,
            selected,
            isCorrect,
            timeTaken: Date.now() - get().startTime, // Crude per-question time or total time? Prompt: "總完成時間".
            // Let's just track correctness.
        };

        set({ answers: [...answers, newAnswer] });
    },

    nextQuestion: () => {
        const { currentIndex, questions } = get();
        if (currentIndex < questions.length - 1) {
            set({ currentIndex: currentIndex + 1 });
        } else {
            get().endQuiz();
        }
    },

    endQuiz: () => {
        set({ isPlaying: false });
        // Navigate to results handled by component side effect usually
    },

    resetQuiz: () => {
        set({
            isPlaying: false,
            currentIndex: 0,
            answers: [],
        });
    }
}));
