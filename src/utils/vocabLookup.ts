import Papa from 'papaparse';
import bbgreCSV from '../data/bbgreword.csv?raw';
import wordsCSV from '../data/words.csv?raw';
import { VocabPair, QuizQuestion } from '../types';

/**
 * Global vocabulary dictionary mapping lowercase English words/phrases to Chinese definitions
 */
let dictionaryMap: Map<string, string> | null = null;

function getDictionary(): Map<string, string> {
  if (dictionaryMap) return dictionaryMap;

  const map = new Map<string, string>();

  // 1. Index BBGRE words
  Papa.parse<Record<string, string>>(bbgreCSV, {
    header: true,
    skipEmptyLines: true,
    step: (results) => {
      const row = results.data;
      const w1 = row.Word1?.trim();
      const d1 = row.Definition1?.trim();
      const w2 = row.Word2?.trim();
      const d2 = row.Definition2?.trim();

      if (w1 && d1) {
        map.set(w1.toLowerCase(), d1);
      }
      if (w2 && d2) {
        map.set(w2.toLowerCase(), d2);
      }
    },
  });

  // 2. Index Zhangwei words
  Papa.parse<Record<string, string>>(wordsCSV, {
    header: true,
    skipEmptyLines: true,
    step: (results) => {
      const row = results.data;
      const w = (row['单词'] || row.Word)?.trim();
      const def = (row['汉语解释'] || row.Definition)?.trim();
      const eq = (row['等价词'] || row.Equivalents)?.trim();

      if (w && def) {
        if (!map.has(w.toLowerCase())) {
          map.set(w.toLowerCase(), def);
        }
        if (eq) {
          eq.split(/[,，;|]/).forEach((part) => {
            const trimmed = part.trim();
            if (trimmed && !map.has(trimmed.toLowerCase())) {
              map.set(trimmed.toLowerCase(), def);
            }
          });
        }
      }
    },
  });

  dictionaryMap = map;
  return map;
}

/**
 * Look up definition for a specific word or phrase
 */
export function lookupWordDefinition(word: string, fallback?: string): string {
  if (!word) return fallback || '';
  const dict = getDictionary();
  const lower = word.toLowerCase().trim();

  if (dict.has(lower)) {
    return dict.get(lower)!;
  }

  // Strip surrounding quotes or punctuation
  const cleaned = lower.replace(/^["'`.,;?!()\[\]{}]+|["'`.,;?!()\[\]{}]+$/g, '').trim();
  if (dict.has(cleaned)) {
    return dict.get(cleaned)!;
  }

  return fallback || '';
}

/**
 * Resolve definitions for both words in a vocabulary pair
 */
export function getPairDefinitions(
  pair?: VocabPair,
  question?: QuizQuestion
): { def1: string; def2: string } {
  const word1 = pair?.word1 || question?.answers[0] || '';
  const word2 = pair?.word2 || question?.answers[1] || '';

  let def1 = pair?.definition1 || '';
  let def2 = pair?.definition2 || '';

  if (!def1 && word1) {
    def1 = lookupWordDefinition(word1, pair?.definition);
  }
  if (!def2 && word2) {
    def2 = lookupWordDefinition(word2, pair?.definition);
  }

  if (!def1 && pair?.definition) def1 = pair.definition;
  if (!def2 && pair?.definition) def2 = pair.definition;

  return {
    def1: def1 || '暂无释义',
    def2: def2 || '暂无释义',
  };
}
