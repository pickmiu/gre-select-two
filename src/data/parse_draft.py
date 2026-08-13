import re
import csv
import os
import nltk
from nltk.corpus import wordnet as wn

# Ensure NLTK WordNet is downloaded
try:
    wn.synsets('test')
except Exception:
    nltk.download('wordnet')
    nltk.download('omw-1.4')

# Path setup
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
DRAFT_PATH = os.path.join(DATA_DIR, 'draft.txt')
WORDS_CSV_PATH = os.path.join(DATA_DIR, 'words.csv')
QUESTIONS_CSV_PATH = os.path.join(DATA_DIR, 'questions.csv')

def load_words_equivalence():
    eq_map = {}
    word_defs = {}
    if os.path.exists(WORDS_CSV_PATH):
        with open(WORDS_CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                w = row['单词'].strip().lower()
                def_text = row['汉语解释'].strip()
                word_defs[w] = def_text
                eqs = [x.strip().lower() for x in row['等价词'].split(',') if x.strip()]
                for eq in eqs:
                    eq_map[(w, eq)] = True
                    eq_map[(eq, w)] = True
                    for eq2 in eqs:
                        if eq != eq2:
                            eq_map[(eq, eq2)] = True
    return eq_map, word_defs

def get_synonym_score(w1, w2, eq_map):
    w1_c = w1.strip().lower()
    w2_c = w2.strip().lower()
    
    if w1_c == w2_c:
        return 0.0
        
    # Highest priority: known in words.csv
    if (w1_c, w2_c) in eq_map:
        return 10.0
        
    syns1 = wn.synsets(w1_c)
    syns2 = wn.synsets(w2_c)
    
    if not syns1 or not syns2:
        return 0.0
        
    # Direct Synset overlap
    s1_names = set(s.name() for s in syns1)
    s2_names = set(s.name() for s in syns2)
    if s1_names.intersection(s2_names):
        return 9.0
        
    # Lemma overlap
    lemmas1 = set(l.name().lower().replace('_', ' ') for s in syns1 for l in s.lemmas())
    lemmas2 = set(l.name().lower().replace('_', ' ') for s in syns2 for l in s.lemmas())
    common_lemmas = (lemmas1.intersection(lemmas2)) - {'be', 'have', 'do', 'make', 'get', 'see'}
    if w1_c in lemmas2 or w2_c in lemmas1 or common_lemmas:
        return 8.0
        
    # Path similarity
    max_sim = 0.0
    for s1 in syns1:
        for s2 in syns2:
            if s1.pos() == s2.pos() and s1.pos() in ['n', 'v', 'a', 'r', 's']:
                sim = s1.path_similarity(s2)
                if sim and sim > max_sim:
                    max_sim = sim
                    
    if max_sim >= 0.25:
        return 5.0 + max_sim
        
    # Definition word overlap
    def1_words = set(w.lower() for s in syns1 for w in re.findall(r'\w+', s.definition()))
    def2_words = set(w.lower() for s in syns2 for w in re.findall(r'\w+', s.definition()))
    overlap = def1_words.intersection(def2_words) - {'the', 'a', 'an', 'to', 'of', 'in', 'and', 'or', 'for', 'with', 'be', 'is', 'are', 'or', 'not'}
    if len(overlap) >= 2:
        return 4.0 + (len(overlap) * 0.1)
        
    return max_sim

def find_best_answer_pair(options, eq_map):
    best_pair = None
    best_score = -1.0
    
    n = len(options)
    for i in range(n):
        for j in range(i + 1, n):
            w1 = options[i]
            w2 = options[j]
            score = get_synonym_score(w1, w2, eq_map)
            if score > best_score:
                best_score = score
                best_pair = (w1, w2)
                
    return best_pair if best_score > 0 else (options[0], options[1])

def parse_draft_to_questions():
    if not os.path.exists(DRAFT_PATH):
        print(f"Error: {DRAFT_PATH} not found!")
        return

    with open(DRAFT_PATH, 'r', encoding='utf-8') as f:
        text = f.read()

    eq_map, word_defs = load_words_equivalence()

    # Clean header watermarks
    text = re.sub(r'微信公众号：张巍GRE', '', text)
    text = re.sub(r'【.*?】', '', text)
    text = re.sub(r'第\s*\d+\s*页', '', text)
    text = re.sub(r'真经GRE\s*张巍GRE填空机经1900题\s*难度分级版', '', text)
    text = re.sub(r'test\s+\d+\s+section\s*\d+.*', '', text, flags=re.IGNORECASE)

    # Split into question blocks
    blocks = re.split(r'\n(?=\d+\.\s+)', text)

    parsed_questions = []
    new_word_pairs = []
    question_id = 1

    for block in blocks:
        lines = [l.strip() for l in block.splitlines() if l.strip()]
        if not lines:
            continue
        
        block_text = ' '.join(lines)
        if '(i)' in block_text or '(ii)' in block_text or '(iii)' in block_text:
            continue

        # Locate options A, B, C, D, E, F
        m_a = re.search(r'\bA\.\s*', block_text)
        m_b = re.search(r'\bB\.\s*', block_text)
        m_c = re.search(r'\bC\.\s*', block_text)
        m_d = re.search(r'\bD\.\s*', block_text)
        m_e = re.search(r'\bE\.\s*', block_text)
        m_f = re.search(r'\bF\.\s*', block_text)

        if m_a and m_b and m_c and m_d and m_e and m_f:
            if m_a.start() < m_b.start() < m_c.start() < m_d.start() < m_e.start() < m_f.start():
                # Extract stem
                stem = block_text[:m_a.start()].strip()
                # Clean stem starting question number (e.g. "1. ")
                stem = re.sub(r'^\d+\.\s*', '', stem)
                # Standardize fill-in-the-blank underline to "______"
                stem = re.sub(r'_{2,}', '______', stem)

                # Extract options A to F
                opt_a = block_text[m_a.end():m_b.start()].strip()
                opt_b = block_text[m_b.end():m_c.start()].strip()
                opt_c = block_text[m_c.end():m_d.start()].strip()
                opt_d = block_text[m_d.end():m_e.start()].strip()
                opt_e = block_text[m_e.end():m_f.start()].strip()
                opt_f = block_text[m_f.end():].strip()

                # Clean trailing lines from option F
                opt_f = re.split(r'\s+\d+\.\s+', opt_f)[0].strip()
                opt_f = re.split(r'\s+test\s+', opt_f, flags=re.IGNORECASE)[0].strip()

                options = [opt_a, opt_b, opt_c, opt_d, opt_e, opt_f]

                # Find best matching answer pair
                ans1, ans2 = find_best_answer_pair(options, eq_map)

                parsed_questions.append({
                    'id': str(question_id),
                    'stem': stem,
                    'option1': opt_a,
                    'option2': opt_b,
                    'option3': opt_c,
                    'option4': opt_d,
                    'option5': opt_e,
                    'option6': opt_f,
                    'answer1': ans1,
                    'answer2': ans2
                })

                # Register pair in new_word_pairs
                if (ans1.lower(), ans2.lower()) not in eq_map:
                    new_word_pairs.append((ans1.lower(), ans2.lower()))

                question_id += 1

    # Write parsed questions to questions.csv
    fieldnames = ['id', 'stem', 'option1', 'option2', 'option3', 'option4', 'option5', 'option6', 'answer1', 'answer2']
    with open(QUESTIONS_CSV_PATH, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(parsed_questions)

    print(f"✅ Successfully parsed and saved {len(parsed_questions)} 6-select-2 questions to {QUESTIONS_CSV_PATH}!")

    # Synchronize new word pairs into words.csv if any
    if new_word_pairs and os.path.exists(WORDS_CSV_PATH):
        existing_words = set()
        rows = []
        with open(WORDS_CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for r in reader:
                rows.append(r)
                existing_words.add(r['单词'].strip().lower())

        added_count = 0
        for w1, w2 in new_word_pairs:
            if w1 not in existing_words:
                rows.append({'单词': w1, '等价词': w2, '汉语解释': 'GRE 等价词'})
                existing_words.add(w1)
                added_count += 1

        if added_count > 0:
            with open(WORDS_CSV_PATH, 'w', encoding='utf-8', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=['单词', '等价词', '汉语解释'])
                writer.writeheader()
                writer.writerows(rows)
            print(f"✅ Synchronized {added_count} new equivalent word pairs into {WORDS_CSV_PATH}!")

if __name__ == '__main__':
    parse_draft_to_questions()
