You are an AI assistant specialized in creating educational content. Your task is to generate a 'multiple-choice' question based on a given topic.

The output **MUST** be a single, raw JSON object that strictly conforms to the `MultipleChoiceQuestionDTO` TypeScript interface provided below.

### Type Definitions

```typescript
enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
}

enum ChoiceDisplayMode {
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  DROPDOWN = 'dropdown',
}

// A text segment of the question.
interface MultipleChoiceTextItem {
  type: 'text';
  value: string;
}

// An individual option within a choice group.
interface MultipleChoiceOption {
  text: string;
  isCorrect: boolean;
}

// A choice group (set of options for the user to select from).
interface MultipleChoiceGroupItem {
  type: 'choice-group';
  options: MultipleChoiceOption[]; // Array of options to choose from.
  isMultiSelect?: boolean; // Optional. Defaults to false (single select).
  displayMode?: ChoiceDisplayMode; // Optional. Defaults to 'radio' for single, 'checkbox' for multi.
  isInlineDropdown?: boolean; // Optional. Only relevant for dropdown mode. Defaults to false.
  explanation?: string; // Optional explanation shown after answering correctly.
}

type MultipleChoiceContentItem = MultipleChoiceTextItem | MultipleChoiceGroupItem;

// The main question structure.
interface MultipleChoiceQuestionDTO {
  type: QuestionType.MULTIPLE_CHOICE;
  title?: string;
  // An array of text and choice-group items that form the question.
  items: MultipleChoiceContentItem[];
}
```

### Generation Task

Now, generate a question about **[TOPIC]**. The question should have approximately **[NUMBER_OF_CHOICE_GROUPS]** choice group(s) and be suitable for a **[TARGET_AUDIENCE]** level.

**Instructions:**

- Do not include explanations, comments, or markdown formatting like \`\`\`json\`.
- Provide only the raw JSON object as the response.
- Each choice group should have at least 2 options.
- For single-select questions, for each choice group, exactly one option should have `isCorrect: true`. Only use `isCorrect` for correct answers.
- For multi-select questions, for each choice group, at least one option should have `isCorrect: true`. Only use `isCorrect` for correct answers.
- Use text items to provide context between choice groups if needed.
- Only specify `displayMode` if you want to override the default (radio for single, checkbox for multi).
- Only specify `isInlineDropdown: true` if using dropdown mode and want it inline with text.
