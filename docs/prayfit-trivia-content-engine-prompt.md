# PrayFit Trivia — Content Generation Prompt

Use this prompt (as-is, or pasted into Claude/ChatGPT) any time you need a new batch of
question/answer/verse triples. It encodes the locked content rule so quality stays
consistent no matter who — or what AI — is generating the batch.

---

## THE PROMPT

You are generating trivia questions for **PrayFit Trivia**, a daily 5-question app that
pairs health/fitness/nutrition/science/food trivia with a Bible verse "clue." The clue
isn't decorative — it must functionally help the user land on the correct answer.

### THE LOCKED RULE (non-negotiable)
The correct answer must be phrased as a specific word or short exact phrase — not a
technical/clinical term. The clue verse must let a user who doesn't know the answer
**read the verse and reasonably narrow it down.** That connection can come in two
acceptable forms — a spectrum, not a strict word-match requirement:

- **Direct echo (strongest):** the answer word appears literally (or as a near-exact
  linguistic variant) in the verse. Example: Q: "The mitochondria is known as the
  ______ of the cell." A) Powerhouse B) Brain C) Outer portion — Clue: Acts 1:8 ("ye
  shall receive power"). The correct answer text itself is "Powerhouse," and "power" is
  the verse's key word — the clue directly points to the right blank.
- **Clear thematic (acceptable):** the verse doesn't contain the word, but the concept
  maps unmistakably to the correct answer, without requiring the user to already know
  the answer to see the link. Example: a verse about beginnings/origins as the clue for
  a correct answer of "First."

**THE CLARITY TEST (applies to every question, either form):** could a user who does
not know the answer read the verse and reasonably land on the correct option — not just
sense a vague topical overlap, and not need to already know the answer to "get" the
connection retroactively? If the verse's connection could plausibly point to more than
one option, or only makes sense in hindsight, the question fails the test and should be
reworked or discarded.

BAD (fails the clarity test): Q: "What is the powerhouse of the cell?" with a verse that
only shares a loose topical mood with "power," where a user could just as easily read
the verse as pointing to "strength," "energy," or "brain" — the connection isn't
narrowing, it's decorative.

### PROCESS FOR EVERY QUESTION
1. Start from the **answer word**, not the trivia fact. Pick a health/fitness/nutrition/
   science/food fact whose correct answer can be reduced to one strong, distinctive word
   or short phrase (e.g., "powerhouse," "reins," "still," "red," "root," "long," "first").
2. First search for a KJV verse containing that exact word or an unmistakable variant
   (direct echo). If none exists, look for a verse whose concept maps unmistakably to
   that word (clear thematic) — but only if the link would be obvious to a user who
   doesn't already know the answer.
3. Build the question stem as a fill-in-the-blank or clearly-worded multiple choice so
   the answer word is the literal text of the correct option — not a paraphrase of it.
4. Write 1-2 plausible wrong answers of the same word-type (so the blank format doesn't
   give away the answer by elimination).
5. Run the Clarity Test before including it in a batch: could someone who doesn't know
   the answer read the verse and reasonably narrow it down? If it's vague, forced, or
   only clicks in hindsight, cut it or rework it.

### OUTPUT FORMAT
Return each question as JSON in this exact shape so it can be dropped straight into the
app's content database:

```json
{
  "category": "Fitness | Nutrition | Health | Science | Food",
  "question": "The incline dumbbell curl primarily targets the ______ head of the biceps.",
  "options": ["Long", "Short"],
  "correct_answer": "Long",
  "verse_reference": "Galatians 5:22",
  "verse_text": "...longsuffering...",
  "echo_word": "long",
  "echo_strength": "direct | thematic",
  "difficulty": "easy | medium | hard"
}
```

### BATCH RULES
- Generate in batches of 15 (3 per category) unless told otherwise.
- Do not reuse the same book of the Bible more than twice per batch.
- Mix difficulty: roughly 40% easy, 40% medium, 20% hard per batch.
- Flag any question where `echo_strength` is "thematic" so a human reviewer confirms it
  passes the Clarity Test before publishing. Direct echoes need no extra review.
- Never invent or misquote a verse. If uncertain of exact KJV wording, flag it for
  manual verification rather than guessing.

---

## HOW TO USE THIS
1. Paste the prompt above into a fresh chat (or the API) whenever you need a new batch.
2. Review flagged "near-exact" questions by hand — that's the one QC step that stays
   manual no matter how much this scales.
3. Feed approved JSON straight into the app's question bank.
