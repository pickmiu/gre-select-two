import Papa from 'papaparse';
import bbgreCSV from '../data/bbgreword.csv?raw';
import wordsCSV from '../data/words.csv?raw';
import words1CSV from '../data/words-1.csv?raw';
import bbgre3600CSV from '../data/bbgre3600.csv?raw';
import { VocabPair, QuizQuestion } from '../types';

/**
 * Common GRE distractor and everyday vocabularies mapping to Chinese definitions
 */
const COMMON_DISTRACTORS: Record<string, string> = {
  serious: '严肃的；严重的；认真的',
  compelling: '引人注目的；令人信服的',
  innovative: '创新的；革新的',
  original: '原创的；原先的',
  orderly: '有秩序的；整齐的；连贯的',
  coherent: '连贯的；条理分明的',
  relatively: '相对地；比较而言',
  comparatively: '比较地；相当地',
  rarely: '罕见地；很少',
  nearly: '几乎；差不多',
  barely: '仅仅；几乎不',
  scarcely: '几乎不；殆不',
  hardly: '几乎不；简直到不了',
  largely: '主要地；在很大程度上',
  mostly: '大部分；主要地',
  slightly: '稍微；略微',
  deeply: '深刻地；深切地',
  greatly: '大大地；非常',
  highly: '高度地；非常',
  widely: '广泛地',
  narrowly: '勉强地；狭隘地',
  primarily: '主要地',
  ultimately: '最终地；根本上',
  immediately: '立即；直接地',
  initially: '最初；起初',
  frequently: '频繁地',
  infrequently: '不经常地',
  typically: '典型地；通常',
  atypically: '非典型地',
  traditionally: '传统上',
  conventionally: '常规地',
  unconventionally: '非常规地',
  consistently: '一致地；始终如一地',
  inconsistently: '不一致地',
  accurately: '精确地',
  inaccurately: '不精确地',
  sufficiently: '充分地',
  insufficiently: '不充分地',
  effectively: '有效地',
  ineffectively: '无效地',
  explicitly: '明确地',
  implicitly: '含蓄地',
  positively: '积极地；明确地',
  negatively: '消极地；负面地',
  partially: '部分地',
  completely: '完全地',
  entirely: '完全地；全部地',
  partly: '部分地',
  strictly: '严格地',
  loose: '宽松的；散漫的',
  loosely: '宽松地',
  purely: '纯粹地',
  merely: '仅仅；只不过',
  simply: '简单地；纯粹',
  clearly: '清楚地；显然',
  vaguely: '含糊地',
  plainly: '明白地；朴素地',
  obviously: '明显地',
  subtly: '微妙地',
  intensely: '强烈地',
  passively: '被动地',
  actively: '主动地；积极地',
  critically: '关键地；批判地',
  crucially: '至关重要地',
  decisively: '果断地；决定性地',
  indecisively: '犹豫不决地',
  boldly: '大胆地',
  cautiously: '谨慎地',
  hastily: '仓促地',
  gradually: '逐渐地',
  rapidly: '迅速地',
  slowly: '缓慢地',
  unexpectedly: '出乎意料地',
  predictably: '不出所料地',
  unpredictably: '不可预测地',
  inevitably: '不可避免地',
  readily: '欣然地；容易地',
  reluctantly: '勉强地',
  eagerly: '热切地',
  curiously: '好奇地；奇怪地',
  strangely: '奇怪地',
  famously: '著名地',
  notoriously: '臭名昭著地',
  seemingly: '看似；貌似',
  apparent: '显而易见的；表面的',
  apparently: '表面上；显然',
  evident: '明显的',
  evidently: '明显地',
  obvious: '显而易见的',
  subtle: '微妙的；敏锐的',
  distinct: '明显的；独特的',
  distinctive: '独特的；有特色的',
  indistinct: '模糊的',
  vague: '模糊的；含糊的',
  clear: '清楚的；明确的',
  unclear: '不清楚的',
  lucid: '清晰的；明朗的',
  simple: '简单的；单纯的',
  complex: '复杂的',
  complicated: '复杂的',
  intricate: '错综复杂的',
  difficult: '困难的',
  easy: '容易的',
  straightforward: '坦率的；简单的',
  demanding: '苛求的；费力的',
  exacting: '严格的；苛求的',
  rigorous: '严谨的；严格的',
  lax: '松懈的；不严格的',
  strict: '严格的',
  flexible: '灵活的',
  inflexible: '僵硬的；不可改变的',
  rigid: '死板的；僵硬的',
  elastic: '有弹性的；灵活的',
  static: '静态的；不变的',
  dynamic: '动态的；有活力的',
  stable: '稳定的',
  unstable: '不稳定的',
  constant: '恒定的；持续的',
  variable: '易变的',
  uniform: '一致的；相同的',
  diverse: '多样的',
  varied: '各式各样的',
  heterogeneous: '成分杂多的；混杂的',
  homogeneous: '同类的；同质的',
  conventional: '常规的；传统的',
  unconventional: '非常规的；新奇的',
  orthodox: '正统的',
  unorthodox: '非正统的',
  traditional: '传统的',
  modern: '现代的',
  ancient: '古老的',
  novel: '新奇的',
  pedestrian: '平庸的；乏味的',
  mundane: '平凡的；世俗的',
  commonplace: '平凡的；陈腐的',
  ordinary: '普通的',
  extraordinary: '非凡的',
  exceptional: '例外的；杰出的',
  typical: '典型的',
  atypical: '非典型的',
  representative: '有代表性的',
  emblematic: '象征性的',
  symbolic: '象征的',
  indicative: '指示的；暗示的',
  symptomatic: '有症状的；典型的',
  characteristic: '特有的；典型的',
  consequential: '重要的；结果的',
  inconsequential: '微不足道的；不重要的',
  significant: '显著的；重大的',
  insignificant: '不显著的；微不足道的',
  meaningful: '有意义的',
  meaningless: '无意义的',
  momentous: '极重要的；重大的',
  trivial: '微不足道的；细枝末节的',
  pivotal: '关键的；枢纽的',
  peripheral: '周边的；次要的',
  central: '核心的；中心的',
  marginal: '边缘的；微小的',
  substantial: '大量的；实质的',
  insubstantial: '虚弱的；微弱的',
  considerable: '相当大的',
  negligible: '可忽略的',
  valuable: '宝贵的',
  invaluable: '极珍贵的',
  worthless: '无价值的',
  precious: '珍贵的',
  critical: '批判的；关键的',
  uncritical: '不加批判的',
  constructive: '建设性的',
  destructive: '破坏性的',
  beneficial: '有益的',
  harmful: '有害的',
  detrimental: '有害的；不利的',
  deleterious: '有害的',
  salutary: '有益的',
  helpful: '有帮助的',
  useless: '无用的',
  useful: '有用的',
  practical: '实用的',
  impractical: '不切实际的',
  pragmatic: '务实的',
  idealistic: '理想主义的',
  realistic: '现实的',
  unrealistic: '不切实际的',
  feasible: '可行的',
  infeasible: '不可行的',
  plausible: '貌似合理的',
  implausible: '难以置信的；不像真的',
  credible: '可信的',
  incredible: '难以置信的',
  convincing: '令人信服的',
  unconvincing: '难以令人信服的',
  persuasive: '有说服力的',
  unpersuasive: '无说服力的',
  defensible: '站得住脚的；可辩护的',
  indefensible: '站不住脚的',
  justifiable: '正当的；有合理解释的',
  unjustifiable: '无法辩解的',
  tenable: '站得住脚的',
  untenable: '站不住脚的；难以防守的',
  rational: '理性的；合理的',
  irrational: '不合理的；荒谬的',
  reasonable: '合理的',
  unreasonable: '不合理的',
  logical: '合逻辑的',
  illogical: '不合逻辑的',
  sound: '健全的；合理的',
  flawed: '有缺陷的',
  defective: '有缺陷的',
  faulty: '有错误的',
  erroneous: '错误的',
  fallacious: '谬误的',
  valid: '有效的；有根据的',
  invalid: '无效的',
  accurate: '精确的',
  inaccurate: '不准确的',
  precise: '精准的',
  imprecise: '不精确的',
  exact: '确切的',
  inexact: '不确切的',
  redirect: '改变方向；重新导向',
  redirected: '改变方向；重新导向',
};

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

  // 3. Index words-1.csv
  Papa.parse<Record<string, string>>(words1CSV, {
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
 * Look up definition for a specific word or phrase, with normalization for articles and prefixes
 */
export function lookupWordDefinition(word: string, fallback?: string): string {
  if (!word) return fallback || '';
  const dict = getDictionary();
  const lower = word.toLowerCase().trim();

  // 1. Direct match
  if (dict.has(lower)) {
    return dict.get(lower)!;
  }
  if (COMMON_DISTRACTORS[lower]) {
    return COMMON_DISTRACTORS[lower];
  }

  // 2. Strip surrounding quotes or punctuation
  const cleaned = lower.replace(/^["'`.,;?!()\[\]{}]+|["'`.,;?!()\[\]{}]+$/g, '').trim();
  if (dict.has(cleaned)) {
    return dict.get(cleaned)!;
  }
  if (COMMON_DISTRACTORS[cleaned]) {
    return COMMON_DISTRACTORS[cleaned];
  }

  // 3. Strip leading articles / prepositions (e.g. "a coherent" -> "coherent", "an innovative" -> "innovative")
  const withoutParticle = cleaned.replace(/^(a|an|the|to|be|of|in|on|at|by|for|with)\s+/i, '').trim();
  if (withoutParticle && withoutParticle !== cleaned) {
    if (dict.has(withoutParticle)) {
      return dict.get(withoutParticle)!;
    }
    if (COMMON_DISTRACTORS[withoutParticle]) {
      return COMMON_DISTRACTORS[withoutParticle];
    }
  }

  // 4. Try stripping adverb suffix "-ly" (e.g. "relatively" -> "relative", "comparatively" -> "comparative")
  if (withoutParticle.endsWith('ly')) {
    const base = withoutParticle.slice(0, -2);
    const baseWithE = base + 'e';
    if (dict.has(base)) return dict.get(base)!;
    if (COMMON_DISTRACTORS[base]) return COMMON_DISTRACTORS[base];
    if (dict.has(baseWithE)) return dict.get(baseWithE)!;
    if (COMMON_DISTRACTORS[baseWithE]) return COMMON_DISTRACTORS[baseWithE];

    if (base.endsWith('i')) {
      const baseWithY = base.slice(0, -1) + 'y';
      if (dict.has(baseWithY)) return dict.get(baseWithY)!;
      if (COMMON_DISTRACTORS[baseWithY]) return COMMON_DISTRACTORS[baseWithY];
    }
  }

  // 5. If it's a multi-word phrase, check individual content words
  const tokens = withoutParticle.split(/\s+/).filter((t) => t.length >= 3);
  for (const token of tokens) {
    if (dict.has(token)) return dict.get(token)!;
    if (COMMON_DISTRACTORS[token]) return COMMON_DISTRACTORS[token];
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

/**
 * Isolated dictionary for bbgre3600 words - used strictly for completion/results page fallback
 */
let bbgre3600Map: Map<string, string> | null = null;

export function getBbgre3600Dictionary(): Map<string, string> {
  if (bbgre3600Map) return bbgre3600Map;

  const map = new Map<string, string>();
  Papa.parse<Record<string, string>>(bbgre3600CSV, {
    header: true,
    skipEmptyLines: true,
    step: (results) => {
      const row = results.data;
      const w = (row['单词'] || row['Word'] || row.word)?.trim();
      let def = (row['中文释义'] || row['汉语解释'] || row.Definition || row.definition)?.trim();
      if (w && def) {
        def = def.replace(/[;；\s]+$/, '');
        if (!map.has(w.toLowerCase())) {
          map.set(w.toLowerCase(), def);
        }
      }
    },
  });

  bbgre3600Map = map;
  return map;
}

/**
 * Helper to produce morphological variants for inflected English words
 */
function getStemVariants(word: string): string[] {
  const lower = word.toLowerCase().trim();
  const cleaned = lower.replace(/^["'`.,;?!()\[\]{}]+|["'`.,;?!()\[\]{}]+$/g, '').trim();
  const target = cleaned.replace(/^(a|an|the|to|be|of|in|on|at|by|for|with)\s+/i, '').trim();
  if (!target) return [];

  const list: string[] = [];

  // 1. -ed / -d (e.g. precluded -> preclude, abated -> abate, redirected -> redirect)
  if (target.endsWith('ed')) {
    list.push(target.slice(0, -1)); // e.g. precluded -> preclude, abated -> abate
    list.push(target.slice(0, -2)); // e.g. redirected -> redirect
    if (target.endsWith('ied')) {
      list.push(target.slice(0, -3) + 'y');
    }
    if (target.length >= 5 && target[target.length - 3] === target[target.length - 4]) {
      list.push(target.slice(0, -3)); // stopped -> stop
    }
  } else if (target.endsWith('d')) {
    list.push(target.slice(0, -1));
  }

  // 2. -ing
  if (target.endsWith('ing')) {
    list.push(target.slice(0, -3));
    list.push(target.slice(0, -3) + 'e');
    if (target.length >= 6 && target[target.length - 4] === target[target.length - 5]) {
      list.push(target.slice(0, -4));
    }
  }

  // 3. -s / -es
  if (target.endsWith('es')) {
    list.push(target.slice(0, -2));
    list.push(target.slice(0, -1));
  } else if (target.endsWith('s')) {
    list.push(target.slice(0, -1));
  }

  // 4. -ly
  if (target.endsWith('ly')) {
    list.push(target.slice(0, -2));
    list.push(target.slice(0, -2) + 'e');
  }

  return list;
}

/**
 * Check bbgre3600 dictionary with normalization and morphological stemming
 */
export function lookupBbgre3600Word(word: string): string {
  if (!word) return '';
  const dict = getBbgre3600Dictionary();
  const lower = word.toLowerCase().trim();

  if (dict.has(lower)) return dict.get(lower)!;

  const cleaned = lower.replace(/^["'`.,;?!()\[\]{}]+|["'`.,;?!()\[\]{}]+$/g, '').trim();
  if (dict.has(cleaned)) return dict.get(cleaned)!;

  const withoutParticle = cleaned.replace(/^(a|an|the|to|be|of|in|on|at|by|for|with)\s+/i, '').trim();
  if (withoutParticle && dict.has(withoutParticle)) return dict.get(withoutParticle)!;

  const variants = getStemVariants(word);
  for (const v of variants) {
    if (dict.has(v)) return dict.get(v)!;
  }

  const tokens = (withoutParticle || cleaned).split(/\s+/).filter((t) => t.length >= 3);
  for (const token of tokens) {
    if (dict.has(token)) return dict.get(token)!;
  }

  return '';
}

/**
 * Dedicated lookup for the results/completion page to fill missing translations via bbgre3600
 */
export function lookupCompletionWordDefinition(word: string, fallback?: string): string {
  if (!word) return fallback || '';

  // 1. Try standard lookup first
  const stdDef = lookupWordDefinition(word);
  if (stdDef && stdDef !== '暂无释义') {
    return stdDef;
  }

  // Check standard dictionary with inflection variants (e.g. abated -> abate)
  const variants = getStemVariants(word);
  for (const v of variants) {
    const vDef = lookupWordDefinition(v);
    if (vDef && vDef !== '暂无释义') {
      return vDef;
    }
  }

  // 2. Fall back to bbgre3600
  const bbgreDef = lookupBbgre3600Word(word);
  if (bbgreDef && bbgreDef !== '暂无释义') {
    return bbgreDef;
  }

  return fallback || '';
}
