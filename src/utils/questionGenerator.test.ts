import { describe, it, expect } from 'vitest';
import { generateGroupQuizQueue } from './questionGenerator';
import { VocabPair, QuizQuestion } from '../types';

describe('generateGroupQuizQueue', () => {
  const sampleRealQuestions: QuizQuestion[] = [
    {
      id: 1,
      stem: 'The astronomer showed that prominence _______ minor contribution.',
      options: ['belies', 'masks', 'highlights', 'nullifies', 'disproves', 'accentuates'],
      answers: ['belies', 'masks'],
      answerBases: ['bely', 'mask'],
    },
  ];

  const poolPairs: VocabPair[] = [
    { id: 'bb-1', word1: 'belie', word2: 'mask', definition: '掩饰; 掩盖' },
    { id: 'bb-2', word1: 'succumb to', word2: 'yield to', definition: '屈服于' },
    { id: 'bb-3', word1: 'singular', word2: 'unique', definition: '独特的' },
    { id: 'bb-4', word1: 'fairness', word2: 'objectivity', definition: '公平; 客观' },
    { id: 'bb-5', word1: 'proclaim', word2: 'profess', definition: '声称; 宣布' },
    { id: 'bb-6', word1: 'pugnacious', word2: 'truculent', definition: '好斗的' },
  ];

  it('matches real question when available and attaches vocabPair', () => {
    const groupPairs: VocabPair[] = [
      { id: 'bb-1', word1: 'belie', word2: 'mask', definition: '掩饰; 掩盖' },
    ];

    const queue = generateGroupQuizQueue(groupPairs, sampleRealQuestions, poolPairs);
    expect(queue.length).toBe(1);
    expect(queue[0].stem).toContain('astronomer showed');
    expect(queue[0].options.length).toBe(6);
    expect(queue[0].answers).toEqual(['belies', 'masks']);
    expect(queue[0].vocabPair?.id).toBe('bb-1');
    expect(queue[0].vocabPair?.definition).toBe('掩饰; 掩盖');
    expect(queue[0].isSynthetic).toBe(false);
  });

  it('falls back to pure Chinese stem without prefix when real question is missing', () => {
    const groupPairs: VocabPair[] = [
      { id: 'bb-2', word1: 'succumb to', word2: 'yield to', definition: '屈服于' },
    ];

    const queue = generateGroupQuizQueue(groupPairs, [], poolPairs);
    expect(queue.length).toBe(1);
    const q = queue[0];
    // Exact Chinese definition, no 【中文释义】 prefix!
    expect(q.stem).toBe('屈服于');
    expect(q.answers).toEqual(['succumb to', 'yield to']);
    expect(q.options.length).toBe(6);
    expect(q.options).toContain('succumb to');
    expect(q.options).toContain('yield to');
    // Ensure all 6 options are unique
    expect(new Set(q.options).size).toBe(6);
    expect(q.vocabPair?.id).toBe('bb-2');
    expect(q.isSynthetic).toBe(true);
  });
});
