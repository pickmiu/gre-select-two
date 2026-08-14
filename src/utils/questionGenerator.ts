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
 * Resolve an answer word or base word to its primary headword entry in wordList
 */
export function resolveAnswerToHeadword(
  ansWord: string,
  ansBase: string | undefined,
  wordList: WordEntry[]
): string | null {
  const targets = [ansBase, ansWord].filter(Boolean) as string[];

  for (const target of targets) {
    const targetLower = target.toLowerCase().trim();

    // 1. Direct exact match on headword
    let entry = wordList.find((w) => w.word.toLowerCase().trim() === targetLower);
    if (entry) return entry.word;

    // 2. Direct exact match on equivalents
    entry = wordList.find((w) =>
      w.equivalents.some((eq) => eq.toLowerCase().trim() === targetLower)
    );
    if (entry) return entry.word;

    // 3. Stem / normalized match on headword or equivalents
    entry = wordList.find(
      (w) =>
        isWordMatchOption(w.word, target) ||
        w.equivalents.some((eq) => isWordMatchOption(eq, target))
    );
    if (entry) return entry.word;
  }

  return null;
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

  // 1. Build the complete pool of words known by the user (selected words + their equivalents)
  const userKnownWords = new Set<string>();
  for (const selWord of selectedWords) {
    const selLower = selWord.toLowerCase().trim();
    userKnownWords.add(selLower);
    const entry = wordList.find((w) => w.word.toLowerCase().trim() === selLower);
    if (entry) {
      entry.equivalents.forEach((eq) => userKnownWords.add(eq.toLowerCase().trim()));
    }
  }

  // Helper: check if a target answer string (or base) is known by the user
  const isAnswerKnown = (ansStr: string, ansBaseStr?: string): boolean => {
    const targets = [ansBaseStr, ansStr].filter(Boolean) as string[];
    for (const target of targets) {
      const tLower = target.toLowerCase().trim();
      if (userKnownWords.has(tLower)) return true;
      if (Array.from(userKnownWords).some((known) => isWordMatchOption(known, target))) {
        return true;
      }
    }
    return false;
  };

  // Helper: check if EVERY correct answer in a question is known by the user
  const areAllQuestionAnswersKnown = (q: QuizQuestion): boolean => {
    if (!q.answers || q.answers.length === 0) return false;
    return q.answers.every((ans, idx) => {
      const base = q.answerBases && q.answerBases[idx] ? q.answerBases[idx] : undefined;
      return isAnswerKnown(ans, base);
    });
  };

  for (const word of selectedWords) {
    const lowerWord = word.toLowerCase().trim();

    // Get word entry to retrieve equivalent synonyms
    const entry = wordList.find((w) => w.word.toLowerCase().trim() === lowerWord);
    const equivalents = new Set<string>();
    if (entry) {
      entry.equivalents.forEach((eq) => equivalents.add(eq.toLowerCase().trim()));
    }

    // Helper: check if a question's correct answers/bases match a target word string strictly
    const questionMatchesTarget = (q: QuizQuestion, targetStr: string): boolean => {
      if (q.answerBases && q.answerBases.length > 0) {
        const baseMatch = q.answerBases.some((b) => {
          const bNorm = b.toLowerCase().trim();
          if (bNorm === targetStr) return true;
          return isWordMatchOption(targetStr, b);
        });
        if (baseMatch) return true;
      }

      return q.answers.some((ans) => {
        const ansNorm = ans.toLowerCase().trim();
        if (ansNorm === targetStr) return true;
        return isWordMatchOption(targetStr, ans);
      });
    };

    // Filter candidate questions where ALL correct answers are known by the user
    const validQuestions = allQuestions.filter((q) => areAllQuestionAnswersKnown(q));

    // Priority 1: Valid questions where the PRIMARY SELECTED WORD itself (e.g. "mitigate") is one of the CORRECT ANSWERS
    const priority1Questions = validQuestions.filter((q) => questionMatchesTarget(q, lowerWord));

    // Priority 2: Valid questions where one of the EQUIVALENT SYNONYMS (e.g. "abate", "curtail", "temper") is one of the CORRECT ANSWERS
    const priority2Questions = validQuestions.filter((q) => {
      return Array.from(equivalents).some((eq) => questionMatchesTarget(q, eq));
    });

    let selectedQ: QuizQuestion | null = null;

    if (priority1Questions.length > 0) {
      // Pick 1 random question from Priority 1 (Primary selected word is correct answer)
      selectedQ = priority1Questions[Math.floor(Math.random() * priority1Questions.length)];
    } else if (priority2Questions.length > 0) {
      // Pick 1 random question from Priority 2 (Equivalent synonym is correct answer)
      selectedQ = priority2Questions[Math.floor(Math.random() * priority2Questions.length)];
    }

    if (!selectedQ) {
      missingWords.push(word);
      if (allowSynthetic) {
        const synthQ = generateSyntheticQuestion(word, wordList);
        selectedQuestions.push(synthQ);
      }
    } else {
      selectedQuestions.push(selectedQ);
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
