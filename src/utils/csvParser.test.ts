import { describe, it, expect } from 'vitest';
import { parseQuestionsCSV } from './csvParser';
import translatedQuestionsCSV from '../data/translated_questions.csv?raw';

describe('parseQuestionsCSV', () => {
  it('parses translation column from translated_questions.csv', () => {
    const questions = parseQuestionsCSV(translatedQuestionsCSV);
    expect(questions.length).toBeGreaterThan(1000);
    expect(questions[0].translation).toBeTruthy();
    expect(questions[0].translation).toContain('尘埃');
  });

  it('parses custom CSV with translation and 翻译 column', () => {
    const csv1 = `id,stem,translation,option1,option2,answer1,answer2
1,The sky is blue,天空是蓝色的,blue,red,blue,blue`;
    const q1 = parseQuestionsCSV(csv1);
    expect(q1[0].translation).toBe('天空是蓝色的');

    const csv2 = `id,stem,题目翻译,option1,option2,answer1,answer2
1,The sky is blue,天空是蓝色的,blue,red,blue,blue`;
    const q2 = parseQuestionsCSV(csv2);
    expect(q2[0].translation).toBe('天空是蓝色的');
  });
});
