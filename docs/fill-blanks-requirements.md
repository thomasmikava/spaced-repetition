# Fill-in-the-Blanks Question Type Requirements

## Data Structure Requirements

### Question Content

- Questions consist of an ordered array of items
- Each item has a `type` field that is either "text" or "missing"
- Text items have a `value` field containing the display text
- Missing items (blanks) have:
  - `officialAnswers`: array of strings that award full points
  - `additionalAnswers`: optional array of strings that award no points but are marked as partially correct
  - `explanation`: optional string displayed after answering correctly or partially

### User Input

- Each blank is identified by its index position among missing items (0, 1, 2...)
- User inputs are stored with:
  - `index`: the blank's position
  - `value`: the user's text input
  - `isRevealed`: boolean indicating if answer was revealed
  - `isFirstTrial`: boolean indicating if this is the first attempt at this blank

## Display Requirements

### Active Quiz Mode

- Text items render as inline text
- Missing items render as text input fields
- Previously incorrect inputs display with red border styling
- When user types in a previously incorrect field, red border is immediately removed

### Review Mode (Post-Submission)

- All content is read-only
- Correct answers display with green styling
- Partial answers display with blue styling
- Incorrect/revealed/unanswered answers display with red styling and show: `[user input] → [correct answer]`
- Empty answers show: `___ → [correct answer]`

### Interactive Elements

- All input fields have an amber "💡" hint button that provides a minimal change suggestion to guide toward the correct answer
- Incorrect answers have a red "?" button that reveals the correct answer
- Correct and partial answers with explanations have a blue "i" icon showing explanation on hover
- Revealing an answer makes the field non-editable and sets `isRevealed: true`
- Hint functionality uses case-sensitive matching without prefix handling to provide the closest valid answer with minimal modifications

## Answer Evaluation Requirements

### Answer Status Determination

- **Correct**: User input exactly matches any string in `officialAnswers` AND `isFirstTrial` is true
- **Partial**: User input matches any string in `additionalAnswers` OR user input matches `officialAnswers` but `isFirstTrial` is false
- **Incorrect**: User input matches no accepted answers
- **Revealed**: User clicked reveal button
- **Unanswered**: No input provided during final submission

### Scoring Rules

- Correct answers: 1 point
- All other statuses: 0 points

### First Trial Tracking

- `isFirstTrial` starts as true for each blank
- Once a blank is submitted with incorrect status, `isFirstTrial` becomes false permanently
- Subsequent correct answers to that blank receive partial status

## Submission Requirements

### Partial Submission ("Submit Non-Empty" button)

- Only evaluates blanks that contain non-empty text
- Empty blanks remain unchanged and editable
- If all blanks become correct after partial submission, automatically finalize the quiz
- Button is enabled only when at least one blank contains text

### Final Submission ("Submit" button)

- Evaluates all blanks, treating empty ones as unanswered
- Finalizes the quiz and transitions to review mode
- Button is always enabled during active quiz

### State Persistence

- Draft inputs are stored in form state during quiz
- Submitted answers are permanently stored with status and points
- When resuming: correct answers become read-only, incorrect answers remain editable with previous values, revealed answers become read-only

## Validation Requirements

### Input Processing

- Answer matching is case-sensitive
- Leading and trailing whitespace is preserved
- Empty string is treated as no input
- No fuzzy matching or normalization
