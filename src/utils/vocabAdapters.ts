import Papa from 'papaparse';
import { VocabPair, VocabGroup } from '../types';

/**
 * Clean and normalize definition string
 */
function cleanDefinition(def: string): string {
  if (!def) return '';
  return def
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .trim();
}

/**
 * Parse Zhangwei Equivalent Words CSV (words.csv)
 * Headers: 单词,等价词,汉语解释
 */
export function parseZhangweiCSV(csvText: string): VocabPair[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const pairs: VocabPair[] = [];

  for (let index = 0; index < parsed.data.length; index++) {
    const row = parsed.data[index];
    const wordKey = Object.keys(row).find((k) => k.includes('单词') || k.toLowerCase().includes('word'));
    const eqKey = Object.keys(row).find((k) => k.includes('等价') || k.toLowerCase().includes('eq'));
    const defKey = Object.keys(row).find((k) => k.includes('解释') || k.includes('含义') || k.toLowerCase().includes('def'));

    const rawWord = wordKey ? row[wordKey]?.trim() : '';
    if (!rawWord) continue;

    const rawEq = eqKey ? row[eqKey]?.trim() : '';
    const rawDef = defKey ? row[defKey]?.trim() : '';

    const allEquivalents = rawEq
      ? rawEq.split(/[,，;|]/).map((s) => s.trim()).filter(Boolean)
      : [];

    const word2 = allEquivalents.length > 0 ? allEquivalents[0] : rawWord;

    const def = cleanDefinition(rawDef) || '暂无释义';

    pairs.push({
      id: `zw-${index + 1}`,
      word1: rawWord,
      word2,
      allEquivalents: allEquivalents.length > 0 ? allEquivalents : [word2],
      definition: def,
      definition1: def,
      definition2: def,
    });
  }

  return pairs;
}

/**
 * Parse BBGRE Word Pairs CSV (bbgreword.csv)
 * Headers: Word1,Definition1,Word2,Definition2
 */
export function parseBbgreCSV(csvText: string): VocabPair[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const pairs: VocabPair[] = [];

  for (let index = 0; index < parsed.data.length; index++) {
    const row = parsed.data[index];
    const w1Key = Object.keys(row).find((k) => k.toLowerCase() === 'word1');
    const d1Key = Object.keys(row).find((k) => k.toLowerCase() === 'definition1');
    const w2Key = Object.keys(row).find((k) => k.toLowerCase() === 'word2');
    const d2Key = Object.keys(row).find((k) => k.toLowerCase() === 'definition2');

    const word1 = w1Key ? row[w1Key]?.trim() : '';
    const word2 = w2Key ? row[w2Key]?.trim() : '';
    if (!word1 || !word2) continue;

    const def1 = cleanDefinition(d1Key ? row[d1Key] || '' : '');
    const def2 = cleanDefinition(d2Key ? row[d2Key] || '' : '');

    // Only display the definition of the first word (fallback to def2 only if def1 is empty)
    const primaryDef = def1 || def2;

    pairs.push({
      id: `bb-${index + 1}`,
      word1,
      word2,
      allEquivalents: [word2],
      definition: primaryDef || '暂无释义',
      definition1: def1 || def2 || '暂无释义',
      definition2: def2 || def1 || '暂无释义',
    });
  }

  return pairs;
}

/**
 * Slice VocabPair array into chunks (default 30 per group)
 */
export function chunkVocabPairs(pairs: VocabPair[], groupSize: number = 30): VocabGroup[] {
  const groups: VocabGroup[] = [];
  const total = pairs.length;

  for (let i = 0; i < total; i += groupSize) {
    const chunk = pairs.slice(i, i + groupSize);
    const groupNum = Math.floor(i / groupSize) + 1;
    const startIdx = i + 1;
    const endIdx = Math.min(i + groupSize, total);

    groups.push({
      groupId: groupNum,
      title: `第 ${groupNum} 组`,
      rangeLabel: `${startIdx} - ${endIdx} 词`,
      pairs: chunk,
    });
  }

  return groups;
}
