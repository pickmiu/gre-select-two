import { describe, it, expect } from 'vitest';
import { parseZhangweiCSV, parseBbgreCSV, chunkVocabPairs } from './vocabAdapters';

describe('vocabAdapters', () => {
  it('parses Zhangwei CSV correctly', () => {
    const csv = `单词,等价词,汉语解释
mitigate,"abate, curtail, temper",缓解
anomaly,aberration,异常`;

    const pairs = parseZhangweiCSV(csv);
    expect(pairs.length).toBe(2);
    expect(pairs[0]).toEqual({
      id: 'zw-1',
      word1: 'mitigate',
      word2: 'abate',
      allEquivalents: ['abate', 'curtail', 'temper'],
      definition: '缓解',
      definition1: '缓解',
      definition2: '缓解',
    });
    expect(pairs[1]).toEqual({
      id: 'zw-2',
      word1: 'anomaly',
      word2: 'aberration',
      allEquivalents: ['aberration'],
      definition: '异常',
      definition1: '异常',
      definition2: '异常',
    });
  });

  it('parses BBGRE CSV correctly and uses first word definition', () => {
    const csv = `Word1,Definition1,Word2,Definition2
succumb to,屈服于,yield to,屈服于
singular,"独特的; 单数的",unique,"独特的; 独一无二的"`;

    const pairs = parseBbgreCSV(csv);
    expect(pairs.length).toBe(2);
    expect(pairs[0]).toEqual({
      id: 'bb-1',
      word1: 'succumb to',
      word2: 'yield to',
      allEquivalents: ['yield to'],
      definition: '屈服于',
      definition1: '屈服于',
      definition2: '屈服于',
    });
    expect(pairs[1]).toEqual({
      id: 'bb-2',
      word1: 'singular',
      word2: 'unique',
      allEquivalents: ['unique'],
      definition: '独特的; 单数的',
      definition1: '独特的; 单数的',
      definition2: '独特的; 独一无二的',
    });
  });

  it('chunks vocab pairs into 30-sized groups correctly', () => {
    const mockPairs = Array.from({ length: 65 }, (_, i) => ({
      id: `item-${i + 1}`,
      word1: `word_${i + 1}`,
      word2: `eq_${i + 1}`,
      allEquivalents: [`eq_${i + 1}`],
      definition: `def_${i + 1}`,
    }));

    const groups = chunkVocabPairs(mockPairs, 30);
    expect(groups.length).toBe(3);
    expect(groups[0].groupId).toBe(1);
    expect(groups[0].title).toBe('第 1 组');
    expect(groups[0].rangeLabel).toBe('1 - 30 词');
    expect(groups[0].pairs.length).toBe(30);

    expect(groups[1].groupId).toBe(2);
    expect(groups[1].title).toBe('第 2 组');
    expect(groups[1].rangeLabel).toBe('31 - 60 词');
    expect(groups[1].pairs.length).toBe(30);

    expect(groups[2].groupId).toBe(3);
    expect(groups[2].title).toBe('第 3 组');
    expect(groups[2].rangeLabel).toBe('61 - 65 词');
    expect(groups[2].pairs.length).toBe(5);
  });
});
