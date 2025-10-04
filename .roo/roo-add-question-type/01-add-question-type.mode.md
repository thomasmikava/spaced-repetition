---
slug: roo-add-question-type
name: ➕ Add Question Type
description: Guide for adding new question types to the quiz system
version: 1.0.0
authors:
  - Roo
dependencies: []
config:
  allow_file_edits: true
  allowed_file_patterns:
    - "^docs/.*\\.md$"
    - "^src/api/controllers/questions/question-content\\.schema\\.ts$"
    - "^src/api/controllers/questions/content/.*\\.ts$"
    - "^src/Pages/Quiz/.*\\.tsx$"
    - "^src/Pages/Quiz/.*\\.selector\\.ts$"
    - "^src/Pages/Quiz/.*\\.spec\\.tsx$"
---

# Add Question Type Mode

This mode guides you through adding a new question type to the spaced-repetition quiz system.

## Overview

Adding a new question type involves several interconnected steps:

1. **Requirements Documentation** - Define the behavior and data structure
2. **Schema Definition** - Add Zod schemas and TypeScript interfaces
3. **Backend Logic** - Implement the question class with answer checking
4. **Frontend Component** - Create the React component for rendering
5. **Integration** - Wire everything together in the factory and question card
6. **Testing** - Create selectors for testing

## Reference Files

Use these existing implementations as templates:

### Fill-in-the-Blanks References

- Requirements: `docs/fill-blanks-requirements.md`
- Schema: `src/api/controllers/questions/question-content.schema.ts` (lines 26-100)
- Backend: `src/api/controllers/questions/content/fill-blanks-question.ts`
- Component: `src/Pages/Quiz/FillBlanksQuestion.tsx`
- Selectors: `src/Pages/Quiz/FillBlanksQuestion.selector.ts`

### Matching References

- Schema: `src/api/controllers/questions/question-content.schema.ts` (lines 103-179)
- Backend: `src/api/controllers/questions/content/matching-question.ts`
- Component: `src/Pages/Quiz/MatchingQuestion.tsx`
- Selectors: `src/Pages/Quiz/MatchingQuestion.selector.ts`

### Integration Points

- Factory: `src/api/controllers/questions/content/question-factory.ts`
- Question Card: `src/Pages/Quiz/QuestionCard.tsx`

## Step-by-Step Process

### Step 1: Gather Requirements

Ask the user to clarify:

1. **Question Type Name** - What should this question type be called? (e.g., "multiple-choice", "ordering")
2. **Data Structure** - What data does the question need?
   - What fields should the question content have?
   - What does user input look like?
   - What additional features are needed? (hints, explanations, etc.)
3. **Display Behavior** - How should it render?
   - Active quiz mode (input state)
   - Review mode (read-only with feedback)
4. **Answer Evaluation** - How are answers checked?
   - What constitutes correct/partial/incorrect?
   - How are points calculated?
   - Are there special rules (first trial tracking, etc.)?

### Step 2: Create Requirements Document

Create `docs/{question-type}-requirements.md` with sections:

- **Data Structure Requirements**
  - Question Content
  - User Input
- **Display Requirements**
  - Active Quiz Mode
  - Review Mode
  - Interactive Elements
- **Answer Evaluation Requirements**
  - Answer Status Determination
  - Scoring Rules
  - Special Tracking (if needed)
- **Submission Requirements**
  - Partial Submission behavior
  - Final Submission behavior
  - State Persistence
- **Validation Requirements**
  - Input Processing rules

Reference: [`docs/fill-blanks-requirements.md`](docs/fill-blanks-requirements.md:1)

### Step 3: Add Zod Schemas and TypeScript Interfaces

In [`src/api/controllers/questions/question-content.schema.ts`](src/api/controllers/questions/question-content.schema.ts:1):

1. **Add enum value** to [`QuestionType`](src/api/controllers/questions/question-content.schema.ts:15):

   ```typescript
   export enum QuestionType {
     FILL_BLANKS = 'fill-blanks',
     MATCHING = 'matching',
     YOUR_TYPE = 'your-type',
   }
   ```

2. **Define content schemas** (similar to lines 35-71):

   - Item schemas (if content has multiple items)
   - Main question schema with `type` literal
   - TypeScript DTO interface

3. **Define user input schemas** (similar to lines 78-100):

   - Input item schema
   - User input schema with `type` literal and [`UserInputSchema`](src/api/controllers/questions/question-content.schema.ts:89) export
   - TypeScript DTO interface

4. **Define processed answer schemas** (similar to lines 197-223):

   - Answer item schema with status and points
   - User answer schema with `type` literal
   - TypeScript DTO interface

5. **Update union types**:
   - Add to [`QuestionContentSchemaSchema`](src/api/controllers/questions/question-content.schema.ts:182) discriminated union
   - Add to [`QuestionContentDTO`](src/api/controllers/questions/question-content.schema.ts:187) type
   - Add to [`UserInputSchema`](src/api/controllers/questions/question-content.schema.ts:189) discriminated union
   - Add to [`UserInputDTO`](src/api/controllers/questions/question-content.schema.ts:191) type
   - Add to [`UserAnswerSchema`](src/api/controllers/questions/question-content.schema.ts:254) discriminated union
   - Add to [`UserAnswerDTO`](src/api/controllers/questions/question-content.schema.ts:256) type

Reference: [`src/api/controllers/questions/question-content.schema.ts`](src/api/controllers/questions/question-content.schema.ts:1)

### Step 4: Implement Question Class

Create `src/api/controllers/questions/content/{question-type}-question.ts`:

Implement the [`IQuestion`](src/api/controllers/questions/content/base-question.interface.ts:1) interface:

```typescript
export class YourQuestion implements IQuestion {
  constructor(private readonly content: YourQuestionDTO) {}

  checkAnswers(args: { userInput: unknown; maxPoints: number }): QuestionCheckResultDTO | null {
    // 1. Validate user input
    // 2. Extract items/blanks from content
    // 3. Calculate points per item
    // 4. Process each answer:
    //    - Check status (correct/partial/incorrect/unanswered)
    //    - Calculate points earned
    //    - Track first trial
    // 5. Build AnswerCheckResultDTO array
    // 6. Create processed answer (UserAnswerDTO)
    // 7. Return QuestionCheckResultDTO
  }

  getInputCount(): number {
    // Return number of inputs needed
  }

  mapFormDataToUserInput(formData: UserInputDTO | undefined | null, options: MapOptions): UserInputDTO {
    // Map form data to backend format
    // Filter based on options.isFullSubmission
  }

  mapUserInputToFormData(userInput: UserAnswerDTO): UserInputDTO {
    // Map backend processed answer to form data
    // Initialize empty answers for all inputs
  }

  private isValidUserInput(userInput: unknown): userInput is YourUserInputDTO {
    // Type guard validation
  }
}
```

Reference: [`src/api/controllers/questions/content/fill-blanks-question.ts`](src/api/controllers/questions/content/fill-blanks-question.ts:1)

### Step 5: Register in Factory

Update [`src/api/controllers/questions/content/question-factory.ts`](src/api/controllers/questions/content/question-factory.ts:1):

1. Import your question class
2. Add case to switch statement in [`createQuestion()`](src/api/controllers/questions/content/question-factory.ts:13):

```typescript
case QuestionType.YOUR_TYPE:
  return new YourQuestion(questionContent);
```

Reference: [`src/api/controllers/questions/content/question-factory.ts`](src/api/controllers/questions/content/question-factory.ts:1)

### Step 6: Create React Component

Create `src/Pages/Quiz/{QuestionType}Question.tsx`:

**Props Interface:**

```typescript
interface YourQuestionProps {
  questionId: number;
  content: YourQuestionDTO;
  isReadOnly: boolean;
  processedAnswer?: YourUserAnswerDTO;
}
```

**Component Structure:**

1. **Form Context** - Use `useFormContext<QuizFormData>()` and `useWatch()`
2. **State Management** - Track revealed answers, etc.
3. **Initialization** - Set up initial form values in `useEffect`
4. **Helper Functions**:
   - Get status from processed answer
   - Get previous answer
   - Get correct answer
   - Handle reveal answer
   - Handle hint (if applicable)
5. **Render Logic**:
   - Active mode: Show inputs with [`Controller`](src/Pages/Quiz/FillBlanksQuestion.tsx:212)
   - Review mode: Show [`AnswerDisplay`](src/Pages/Quiz/components/AnswerDisplay.tsx:1) components
   - Include interactive elements ([`HintButton`](src/Pages/Quiz/components/HintButton.tsx:1), [`RevealButton`](src/Pages/Quiz/components/RevealButton.tsx:1), [`ExplanationTooltip`](src/Pages/Quiz/components/ExplanationTooltip.tsx:1))

Reference: [`src/Pages/Quiz/FillBlanksQuestion.tsx`](src/Pages/Quiz/FillBlanksQuestion.tsx:1)

### Step 7: Integrate in QuestionCard

Update [`src/Pages/Quiz/QuestionCard.tsx`](src/Pages/Quiz/QuestionCard.tsx:1):

1. Import your component and DTO type
2. Add case to switch statement in [`renderQuestionContent()`](src/Pages/Quiz/QuestionCard.tsx:228):

```typescript
case QuestionType.YOUR_TYPE:
  return (
    <YourQuestion
      questionId={question.questionId}
      content={content}
      isReadOnly={isReadOnly}
      processedAnswer={processedAnswer as YourUserAnswerDTO | undefined}
    />
  );
```

3. Update [`hasNonEmptyInputs`](src/Pages/Quiz/QuestionCard.tsx:38) computation to handle your question type

Reference: [`src/Pages/Quiz/QuestionCard.tsx`](src/Pages/Quiz/QuestionCard.tsx:1)

### Step 8: Create Test Selectors

Create `src/Pages/Quiz/{QuestionType}Question.selector.ts`:

```typescript
import type { AnswerStatus } from '../../api/controllers/questions/question-content.schema';
import { createTestingQuery, createSelector, type TestingQueryParams } from '../../test/query-extension';

export const yourQuestionSelector = {
  // Add selectors for your question's interactive elements
  inputs: (): TestingQueryParams<HTMLElement> => {
    return createTestingQuery.role('...');
  },
  hintButton: (): TestingQueryParams<HTMLButtonElement> => {
    return createTestingQuery.selector('button[datatype="hint"]');
  },
  revealButton: (): TestingQueryParams<HTMLButtonElement> => {
    return createTestingQuery.selector('button[datatype="reveal-answer"]');
  },
  byStatus: (status: AnswerStatus): TestingQueryParams<HTMLElement> => {
    return createTestingQuery.selector(`span[data-status="${status}"]`);
  },
};
```

Reference: [`src/Pages/Quiz/FillBlanksQuestion.selector.ts`](src/Pages/Quiz/FillBlanksQuestion.selector.ts:1)

## Common Components

Reuse these existing components if needed:

- [`AnswerDisplay`](src/Pages/Quiz/components/AnswerDisplay.tsx:1) - Shows answer with status styling and explanation
- [`HintButton`](src/Pages/Quiz/components/HintButton.tsx:1) - Amber hint button (💡)
- [`RevealButton`](src/Pages/Quiz/components/RevealButton.tsx:1) - Red reveal button (?)
- [`ExplanationTooltip`](src/Pages/Quiz/components/ExplanationTooltip.tsx:1) - Blue info icon with hover tooltip

## Key Concepts

### Answer Status

Use the [`AnswerStatus`](src/api/controllers/questions/question-content.schema.ts:7) enum:

- `CORRECT` - Full points, matches official answer, first trial
- `PARTIAL` - Reduced points, matches additional answer OR not first trial
- `INCORRECT` - No points, doesn't match
- `REVEALED` - User clicked reveal button
- `UNANSWERED` - No input provided

### First Trial Tracking

- Track whether this is the user's first attempt at each input
- Use `isFirstTrial` field in input items
- Set to `false` after first incorrect submission
- Affects whether correct answers get full or partial credit

### Form Integration

- Use React Hook Form's `useFormContext<QuizFormData>()`
- Store answers at `answers.{questionId}`
- Use `Controller` for controlled inputs
- Use `useWatch()` to react to changes

### Read-Only Mode

- Triggered by `isReadOnly` prop or when answer is submitted
- Show [`AnswerDisplay`](src/Pages/Quiz/components/AnswerDisplay.tsx:1) instead of inputs
- Display user's answer, correct answer, and status

## Checklist Template

When starting a new question type, create this checklist:

- [ ] Gather requirements and clarify with user
- [ ] Create requirements document in `docs/`
- [ ] Add enum value to `QuestionType`
- [ ] Define content schemas and interfaces
- [ ] Define user input schemas and interfaces
- [ ] Define processed answer schemas and interfaces
- [ ] Update union types in schema file
- [ ] Implement question class with all methods
- [ ] Register question class in factory
- [ ] Create React component with active/review modes
- [ ] Add case to QuestionCard switch statement
- [ ] Update hasNonEmptyInputs logic
- [ ] Create test selectors file
- [ ] Test the implementation

## Notes

- Always use discriminated unions for type safety
- Maintain consistency with existing question types
- Follow the same naming patterns (e.g., `{Type}QuestionDTO`, `{Type}UserInputDTO`)
- Ensure all DTOs have proper Zod schemas for validation
- Use `data-status` and `datatype` attributes for testability
- Handle both partial and full submission modes
