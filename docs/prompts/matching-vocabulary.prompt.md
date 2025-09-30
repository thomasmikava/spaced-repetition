Your task is to generate a `MatchingQuestionDTO` object that creates a vocabulary usage exercise based on a provided list of words. Follow these rules precisely:

1.  **Word Coverage:** You **must** create a story or connected text that uses **every word** from the provided list **at least twice**. This ensures learners practice each word in multiple contexts.

2.  **Word Forms and Conjugation:**

    - Words do NOT have to be used in their base form - they should be conjugated, declined, or modified as grammatically appropriate for the context
    - For verbs: use appropriate tenses, moods, and conjugations
    - For nouns: use appropriate cases, articles, and singular/plural forms
    - For adjectives: use appropriate declensions and comparisons
    - The `answerOptions` should contain the **inflected forms** actually used in the story, not the base dictionary forms

3.  **Story Requirements:**

    - The story should be coherent, engaging, and suitable for an A2 language level.
    - The narrative should flow naturally and make logical sense.
    - Each word should appear in different contexts to demonstrate varied usage.
    - **Strongly prefer** using each word at least twice throughout the text (in different inflected forms if appropriate) to reinforce learning through repetition and varied contexts.
    - When multiple words are synonyms or similar, the context must make it **completely clear** which specific word belongs in each blank based on meaning, grammar, or collocation.

4.  **JSON Structure:**

    The `items` array should contain:

    - `MatchingTextItem` objects with `type: 'text'` for the story segments
    - `MatchingBlankItem` objects with `type: 'blank'` for each location where a vocabulary word should be placed

    The `answerOptions` array should contain:

    - All **inflected forms** of vocabulary words actually used in the story, sorted by random order
    - Each inflected form should have a `usageLimit` equal to the number of times it appears as a correct answer in the story
    - Forms that appear twice should have `usageLimit: 2`, three times should have `usageLimit: 3`, etc.

5.  **Blank Item Requirements:**

    - Each blank's `correctAnswers` array should contain the **inflected form** used in that specific context (e.g., "ging" for the verb "gehen" in past tense)
    - **Blank Spacing:** Avoid placing multiple blanks too close together within the same sentence. Ensure there is sufficient surrounding text between blanks so learners can independently determine each answer without requiring knowledge of adjacent blanks. When blanks must appear in close proximity, make each one's context completely unambiguous.
    - **Exception for Synonyms:** If it's not possible to make it completely obvious which synonym to use through context alone, include ALL acceptable synonyms in the `correctAnswers` array. When doing this, ensure the `usageLimit` for each synonym accounts for all blanks where it appears as a correct answer.
    - Use the `explanation` field to provide:
      - The dictionary/base form with essential grammatical information:
        - For nouns: include article and gender (e.g., "der Park (m.)")
        - For verbs: include infinitive form (e.g., "gehen - to go")
        - For adjectives: include base form if declined
      - English translation of the word in that context

6.  **Title:** Create a short, thematic title in the target language that captures the story's essence (e.g., "Ein Tag im Park", "Meine Reise nach Berlin"), not a generic title like "Vokabelübung".

7.  **Disambiguation:** When words are similar or synonymous, ensure the surrounding text makes the correct choice obvious through:
    - Grammatical agreement (gender, case, number)
    - Common collocations and fixed expressions
    - Semantic context that favors one word over another
    - Register or formality level

Here are the vocabulary words you must use:
