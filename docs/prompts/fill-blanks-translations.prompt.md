Your task is to generate a `FillBlanksQuestionDTO` object based on the provided list of German words. Follow these rules precisely:

1.  **Word Coverage:** You **must** generate a set of German sentences that collectively use **every word** from the provided list **at least once**. A single sentence can incorporate one or more words from the list.

2.  **Sentence Requirements:**

    - Each German sentence must be simple and suitable for an A2 language level.
    - For each German sentence, you must provide a direct and unambiguous English translation. This English translation is the user's only clue, so it must lead to the one specific German sentence you created. Avoid English phrasing that could have multiple correct translations.

3.  **JSON Structure:** The `items` array in the final JSON object must follow a strict, repeating pattern for each English-German sentence pair:
    - **Step 1: English Text:** A `FillBlanksTextItem` containing the English translation.
    - **Step 2: Newline:** A `FillBlanksTextItem` containing a single newline character (`\n`).
    - **Step 3: German Blank:** A `FillBlanksMissingItem` that contains the corresponding German sentence. This item must have its `size` property set to `'large'`.
    - **Step 4: Separator:** A `FillBlanksTextItem` containing newline character (`\n`). **Important:** This final separator item should be omitted after the very last sentence pair in the list.

The sequence for each entry is: `English Sentence` -> `Newline` -> `German Blank` -> `Newline` (repeat).

4. For the title property of the question, create a short, logical title in German that captures the overall theme of the generated sentences (e.g., "Eine Zugreise"), instead of a generic title like "Deutsch Vokabular" or "Englisch Übersetzungen".

Here are the words you must use:
