import Papa from 'papaparse';
import { WordEntry, QuizQuestion } from '../types';

/**
 * Parse Word List CSV string into WordEntry array
 */
export function parseWordsCSV(csvText: string): WordEntry[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  const words: WordEntry[] = [];

  for (const row of parsed.data) {
    // Find column matching '单词' or 'word'
    const wordKey = Object.keys(row).find((k) => k.includes('单词') || k.includes('word'));
    // Find column matching '等价词' or 'equivalent' or 'synonym'
    const eqKey = Object.keys(row).find((k) => k.includes('等价') || k.includes('eq') || k.includes('synonym'));
    // Find column matching '汉语解释' or '解释' or 'definition' or 'meaning'
    const defKey = Object.keys(row).find((k) => k.includes('解释') || k.includes('含义') || k.includes('def') || k.includes('meaning'));

    const rawWord = wordKey ? row[wordKey]?.trim() : '';
    if (!rawWord) continue;

    const rawEq = eqKey ? row[eqKey]?.trim() : '';
    const rawDef = defKey ? row[defKey]?.trim() : '';

    const equivalents = rawEq
      ? rawEq.split(/[,，;|]/).map((s) => s.trim()).filter(Boolean)
      : [];

    words.push({
      word: rawWord,
      equivalents,
      definition: rawDef || '暂无释义',
    });
  }

  return words;
}

/**
 * Parse Questions CSV string into QuizQuestion array
 */
export function parseQuestionsCSV(csvText: string): QuizQuestion[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  const questions: QuizQuestion[] = [];

  for (let index = 0; index < parsed.data.length; index++) {
    const row = parsed.data[index];
    const idKey = Object.keys(row).find((k) => k === 'id') || Object.keys(row)[0];
    const stemKey = Object.keys(row).find((k) => k.includes('stem') || k.includes('题干') || k.includes('question'));

    const rawId = row[idKey]?.trim() || String(index + 1);
    const rawStem = stemKey ? row[stemKey]?.trim() : '';

    if (!rawStem) continue;

    let options: string[] = [];
    let answers: string[] = [];

    // Check Format A: option1..option6
    const optionKeys = Object.keys(row).filter((k) => k.startsWith('option'));
    if (optionKeys.length >= 2) {
      options = optionKeys.map((k) => row[k]?.trim()).filter(Boolean);
    } else {
      // Format B: options column
      const optionsCol = Object.keys(row).find((k) => k.includes('options') || k.includes('选项'));
      if (optionsCol && row[optionsCol]) {
        options = row[optionsCol].split(/[,，;|]/).map((s) => s.trim()).filter(Boolean);
      }
    }

    // Check Format A: answer1, answer2 (excluding answer1_base, answer2_base)
    const answerKeys = Object.keys(row).filter((k) => k.startsWith('answer') && !k.includes('base'));
    if (answerKeys.length >= 2) {
      answers = answerKeys.map((k) => row[k]?.trim()).filter(Boolean);
    } else {
      // Format B: answers column
      const answersCol = Object.keys(row).find((k) => (k.includes('answers') || k.includes('答案')) && !k.includes('base'));
      if (answersCol && row[answersCol]) {
        answers = row[answersCol].split(/[,，;|]/).map((s) => s.trim()).filter(Boolean);
      }
    }

    // Check answer1_base, answer2_base
    let answerBases: string[] = [];
    const baseKeys = Object.keys(row).filter((k) => k.includes('base'));
    if (baseKeys.length >= 2) {
      answerBases = baseKeys.map((k) => row[k]?.trim()).filter(Boolean);
    }

    if (options.length > 0 && answers.length > 0) {
      questions.push({
        id: rawId,
        stem: rawStem,
        options,
        answers,
        ...(answerBases.length > 0 ? { answerBases } : {}),
      });
    }
  }

  return questions;
}

/**
 * Export WordEntry list to CSV string
 */
export function exportWordsToCSV(words: WordEntry[]): string {
  const data = words.map((w) => ({
    单词: w.word,
    等价词: w.equivalents.join(', '),
    汉语解释: w.definition,
  }));
  return Papa.unparse(data);
}

/**
 * Export QuizQuestion list to CSV string
 */
export function exportQuestionsToCSV(questions: QuizQuestion[]): string {
  const data = questions.map((q) => {
    const row: Record<string, string> = {
      id: String(q.id),
      stem: q.stem,
    };
    q.options.forEach((opt, idx) => {
      row[`option${idx + 1}`] = opt;
    });
    q.answers.forEach((ans, idx) => {
      row[`answer${idx + 1}`] = ans;
    });
    return row;
  });
  return Papa.unparse(data);
}
