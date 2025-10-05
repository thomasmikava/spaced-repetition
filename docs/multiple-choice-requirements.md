d# Multiple Choice Question Type Requirements

## Data Structure Requirements

### Question Content

- Questions consist of an ordered array of items
- Each item has a `type` field that can be "text" or "choice-group"
- **Text items** have:
  - `value`: string containing the display text
- **Choice group items** (renamed from "options area") have:
  - `options`: array of option objects, each with:
    - `text`: string containing the option text (extensible to other types in future)
    - `isCorrect`: boolean (default false) - indicating if this option is a correct answer
  - `isMultiSelect`: boolean (default false) - true for multi-select, false for single select
  - `displayMode`: enum value:
    - "radio" (default for single selection) - radio buttons
    - "checkbox" (default for multiple selection) - checkboxes
    - "dropdown" (only available for single selection) - dropdown selector
  - `isInlineDropdown`: boolean (only relevant when displayMode is "dropdown", default false)
  - `explanation`: optional string displayed after answering

### User Input

- Each choice group is identified by its index position among choice group items (0, 1, 2...)
- User selections are stored with:
  - `index`: the choice group's position
  - `value`: number (for single select), number[] (for multi-select), or null (no selection)
  - `isRevealed`: boolean indicating if answer was revealed
  - `isFirstTrial`: boolean indicating if this is the first attempt at this choice group

## Display Requirements

### Active Quiz Mode

- Text items render inline without spacing by default
- Multiple consecutive text items render together unless newline characters are used
- Choice groups render according to their `displayMode`:
  - **Radio**: vertical list of radio buttons with labels
  - **Checkbox**: vertical list of checkboxes with labels
  - **Dropdown** (non-inline): dropdown on its own line
  - **Dropdown** (inline): dropdown rendered inline with surrounding text
- **Real-time validation feedback** (Live Feedback mode only): When user selects an option, visual feedback is provided:
  - **Red border/highlight**: Current selection is incorrect
  - **Green border/highlight**: Current selection is correct
  - **Default styling**: No selection made, not in Live Feedback mode, or in Assessment mode
- Previously incorrect selections (after submission) display with red border/highlight
- When user changes a previously incorrect selection, red styling is immediately removed

### Review Mode (Post-Submission)

- All content is read-only
- Correct selections display with green styling
- Partial selections display with blue styling (when some but not all correct options selected in multi-select)
- Incorrect/revealed/unanswered selections display with red styling and show selected vs. correct options
- Empty selections show indication of unanswered state

### Interactive Elements

- Incorrect choice groups (after submission) have a red "?" reveal button that shows the correct answer(s) (hidden in Assessment mode)
- Correct and partial choice groups with explanations have a blue "i" icon showing explanation on hover
- Revealing an answer makes the choice group non-editable and sets `isRevealed: true`

## Answer Evaluation Requirements

### Answer Status Determination

For **single selection** choice groups:

- **Correct**: User selected the correct option AND `isFirstTrial` is true
- **Partial**: User selected the correct option but `isFirstTrial` is false
- **Incorrect**: User selected an incorrect option
- **Revealed**: User clicked reveal button
- **Unanswered**: No selection made during final submission

For **multiple selection** choice groups:

- **Correct**: User selected ALL correct options and NO incorrect options AND `isFirstTrial` is true
- **Partial**: User selected some correct options OR selected all correct but `isFirstTrial` is false OR selected correct options but also some incorrect
- **Incorrect**: User selected only incorrect options or a mix heavily weighted toward incorrect
- **Revealed**: User clicked reveal button
- **Unanswered**: No selections made during final submission

### Scoring Rules

- **Correct**: Full points for the choice group
- **Partial**: 50% points for the choice group (for matching additional answers or non-first trial)
- **Incorrect/Revealed/Unanswered**: 0 points

### First Trial Tracking

- `isFirstTrial` starts as true for each choice group
- Once a choice group is submitted with incorrect status, `isFirstTrial` becomes false permanently
- Subsequent correct answers to that choice group receive partial status

## Submission Requirements

### Partial Submission ("Submit Non-Empty" button)

- Only evaluates choice groups that have selections
- Unselected choice groups remain unchanged and editable
- If all choice groups become correct after partial submission, automatically finalize the quiz
- Button is enabled only when at least one choice group has a selection
- **Note**: This button is hidden in Assessment mode

### Final Submission ("Submit" button)

- Evaluates all choice groups, treating ones without selections as unanswered
- Finalizes the quiz and transitions to review mode
- Button is always enabled during active quiz

### State Persistence

- Draft selections are stored in form state during quiz
- Submitted answers are permanently stored with status and points
- When resuming: correct answers become read-only, incorrect answers remain editable with previous values, revealed answers become read-only

## Validation Requirements

### Input Processing

- Option indices are 0-based
- For single selection: value must be a valid option index (number) or null
- For multiple selection: value must be an array of valid option indices or null
- Empty/null selections are treated as unanswered in final submission
- No normalization or fuzzy matching required

## Future Extensibility

- Option content type is currently limited to text but structured to support other types (audio, images) in future
- Display modes can be extended to support additional UI representations
- Multi-select could support different UI modes in future
