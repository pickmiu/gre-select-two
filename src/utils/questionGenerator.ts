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
 * Normalize a word string by stripping leading/trailing articles & prepositions.
 */
export function normalizeWordString(text: string): string {
  if (!text) return '';
  let t = text.toLowerCase().trim();
  t = t.replace(/^[.,;:"'`?!()\[\]{}]+/, '');
  t = t.replace(/[.,;:"'`?!()\[\]{}]+$/, '');
  t = t.replace(/^(a|an|the|to|of|for|in|on|with|against|from|by|as)\s+/i, '');
  t = t.replace(/\s+(to|of|for|in|on|with|against|from|by|as)$/i, '');
  return t.trim();
}

/**
 * Generate candidate stem variants for English word (handling -ed, -ing, -s, -es, -ies, -ly, etc.)
 */
export function getWordStemsTS(word: string): Set<string> {
  const norm = normalizeWordString(word);
  const stems = new Set<string>();
  if (!norm) return stems;
  stems.add(norm);

  if (norm.endsWith('ies') && norm.length > 4) {
    stems.add(norm.slice(0, -3) + 'y');
  } else if (norm.endsWith('es') && norm.length > 3) {
    stems.add(norm.slice(0, -2));
    stems.add(norm.slice(0, -1));
  } else if (norm.endsWith('s') && !norm.endsWith('ss') && norm.length > 3) {
    stems.add(norm.slice(0, -1));
  }

  if (norm.endsWith('ed') && norm.length > 4) {
    stems.add(norm.slice(0, -2));
    stems.add(norm.slice(0, -1));
    if (norm.endsWith('ied')) {
      stems.add(norm.slice(0, -3) + 'y');
    }
  }

  if (norm.endsWith('ing') && norm.length > 5) {
    stems.add(norm.slice(0, -3));
    stems.add(norm.slice(0, -3) + 'e');
  }

  if (norm.endsWith('ly') && norm.length > 4) {
    stems.add(norm.slice(0, -2));
    if (norm.endsWith('ily')) {
      stems.add(norm.slice(0, -3) + 'y');
    }
  }

  return stems;
}

/**
 * Check if a user's target selected word matches a question's option or answer string.
 */
export function isWordMatchOption(targetWord: string, optionStr: string): boolean {
  if (!targetWord || !optionStr) return false;
  const targetLower = targetWord.toLowerCase().trim();
  const optionLower = optionStr.toLowerCase().trim();

  // 1. Direct exact match
  if (targetLower === optionLower) return true;

  // 2. Normalized match (stripping articles & prepositions)
  const normTarget = normalizeWordString(targetWord);
  const normOption = normalizeWordString(optionStr);
  if (normTarget === normOption) return true;

  // 3. Stem overlap match
  const targetStems = getWordStemsTS(normTarget);
  const optionStems = getWordStemsTS(normOption);

  for (const ts of targetStems) {
    if (optionStems.has(ts)) return true;
  }

  // 4. Token substring match (e.g. target "discern" in option "discerned by")
  const optionTokens = normOption.split(/\s+/);
  for (const token of optionTokens) {
    const tokenStems = getWordStemsTS(token);
    for (const ts of targetStems) {
      if (tokenStems.has(ts)) return true;
    }
  }

  return false;
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

    // Find questions matching this word using enhanced matching (handling articles, prepositions & word forms)
    const matchingQuestions = allQuestions.filter((q) => {
      // 1. Direct exact match on answerBases
      if (q.answerBases && q.answerBases.length > 0) {
        const baseMatch = q.answerBases.some(
          (b) => b.toLowerCase().trim() === lowerWord || normalizeWordString(b) === lowerWord
        );
        if (baseMatch) return true;
      }
      // 2. Fallback enhanced match on answers or options
      const answersMatch = q.answers.some((ans) => isWordMatchOption(word, ans));
      const optionsMatch = q.options.some((opt) => isWordMatchOption(word, opt));
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
