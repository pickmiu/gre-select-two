import { QuizQuestion, MissingWordError } from '../types';

/**
 * Fisher-Yates Shuffle
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface QuestionGenerationResult {
  success: boolean;
  questions?: QuizQuestion[];
  error?: MissingWordError;
}

/**
 * Generate question queue for selected words
 */
export function generateQuestionQueue(
  selectedWords: string[],
  allQuestions: QuizQuestion[]
): QuestionGenerationResult {
  if (!selectedWords || selectedWords.length === 0) {
    return {
      success: false,
      error: {
        missingWords: [],
        reason: '请先选择需要练习的单词。',
      },
    };
  }

  const selectedQuestions: QuizQuestion[] = [];
  const missingWords: string[] = [];

  for (const word of selectedWords) {
    const lowerWord = word.toLowerCase().trim();

    // Find questions matching this word (in answers or options)
    const matchingQuestions = allQuestions.filter((q) => {
      const answersMatch = q.answers.some((ans) => ans.toLowerCase().trim() === lowerWord);
      const optionsMatch = q.options.some((opt) => opt.toLowerCase().trim() === lowerWord);
      return answersMatch || optionsMatch;
    });

    if (matchingQuestions.length === 0) {
      missingWords.push(word);
    } else {
      // Pick 1 random question for this word
      const randomQuestion = matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
      selectedQuestions.push(randomQuestion);
    }
  }

  if (missingWords.length > 0) {
    return {
      success: false,
      error: {
        missingWords,
        reason: '题库中没有找到包含这些单词的题目，请重新选择单词。',
      },
    };
  }

  // Shuffle selected questions
  const shuffledQueue = shuffleArray(selectedQuestions);

  return {
    success: true,
    questions: shuffledQueue,
  };
}
