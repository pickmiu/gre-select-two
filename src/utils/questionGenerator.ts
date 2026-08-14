import { QuizQuestion, WordEntry, MissingWordError } from '../types';

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
  missingWords?: string[];
  error?: MissingWordError;
}

/**
 * Generate a synthetic 6-option question for a word when no real question exists.
 */
export function generateSyntheticQuestion(
  word: string,
  wordList: WordEntry[]
): QuizQuestion {
  const lowerWord = word.toLowerCase().trim();

  // Find word entry
  const entry = wordList.find((w) => w.word.toLowerCase().trim() === lowerWord);

  // Correct answer 1: Headword
  const ans1 = entry ? entry.word : word;

  // Correct answer 2: Randomly pick 1 from equivalents
  let ans2 = '';
  if (entry && entry.equivalents.length > 0) {
    const randomEq = entry.equivalents[Math.floor(Math.random() * entry.equivalents.length)];
    ans2 = randomEq;
  } else {
    // Fallback: pick another random word from wordList
    const otherWords = wordList.filter((w) => w.word.toLowerCase().trim() !== lowerWord);
    if (otherWords.length > 0) {
      ans2 = otherWords[Math.floor(Math.random() * otherWords.length)].word;
    } else {
      ans2 = 'synonym';
    }
  }

  // Related set of words to exclude from distractors:
  const excluded = new Set<string>();
  excluded.add(ans1.toLowerCase().trim());
  excluded.add(ans2.toLowerCase().trim());
  if (entry) {
    entry.equivalents.forEach((eq) => excluded.add(eq.toLowerCase().trim()));
  }

  // Filter wordList for distractors
  const potentialDistractors = wordList.filter((w) => {
    const wHead = w.word.toLowerCase().trim();
    if (excluded.has(wHead)) return false;
    return !w.equivalents.some((eq) => excluded.has(eq.toLowerCase().trim()));
  });

  // Pick 4 random distractors
  const shuffledDistractorPool = shuffleArray(potentialDistractors);
  const selectedDistractorEntries = shuffledDistractorPool.slice(0, 4);

  const distractors = selectedDistractorEntries.map((w) => w.word);

  // Fallback if distractors count < 4
  while (distractors.length < 4) {
    distractors.push(`distractor_${distractors.length + 1}`);
  }

  // Combine 2 correct answers + 4 distractors into 6 options
  const options = shuffleArray([ans1, ans2, ...distractors]);

  return {
    id: `synthetic-${lowerWord}-${Math.random().toString(36).substring(2, 9)}`,
    stem: '', // Empty stem signifies a synthetic option-only question
    options,
    answers: [ans1, ans2],
  };
}

/**
 * Generate question queue for selected words
 */
export function generateQuestionQueue(
  selectedWords: string[],
  allQuestions: QuizQuestion[],
  wordList: WordEntry[] = [],
  allowSynthetic: boolean = false
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
      if (allowSynthetic) {
        const synthQ = generateSyntheticQuestion(word, wordList);
        selectedQuestions.push(synthQ);
      }
    } else {
      // Pick 1 random question for this word
      const randomQuestion = matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
      selectedQuestions.push(randomQuestion);
    }
  }

  if (missingWords.length > 0 && !allowSynthetic) {
    return {
      success: false,
      missingWords,
      error: {
        missingWords,
        reason: '部分选中单词在题库中缺失真实 6选2 试题。您可以选择“继续练习”（自动生成词汇选项题）或调整选择。',
      },
    };
  }

  // Shuffle selected questions
  const shuffledQueue = shuffleArray(selectedQuestions);

  return {
    success: true,
    questions: shuffledQueue,
    missingWords,
  };
}
