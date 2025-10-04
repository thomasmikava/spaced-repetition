# Matching Question Type Requirements

## Data Structure Requirements

### Question Content

- Questions consist of an ordered array of items and a global pool of answer options
- Each item has a `type` field that is either "text" or "blank"
- Text items have a `value` field containing the display text
- Blank items (drop zones) have:
  - `correctAnswers`: array of strings from the answer options pool that are considered 100% correct
  - `explanation`: optional string displayed after answering correctly or partially

### Answer Options Pool

- Global pool of draggable choices defined in `answerOptions` array
- Each option has:
  - `value`: unique string displayed as draggable items
  - `usageLimit`: optional number indicating maximum selections across all blanks (defaults to 1). Null value means infinity.

### User Input

- Each blank is identified by its index position among blank items (0, 1, 2...)
- User inputs are stored with:
  - `index`: the blank's position
  - `value`: the selected option value from the answer pool
  - `isRevealed`: boolean indicating if answer was revealed
  - `isFirstTrial`: boolean indicating if this is the first attempt at this blank

## Display Requirements

### Active Quiz Mode

- Text items render as inline text
- Blank items render as droppable zones that can accept dragged answer options
- **Draggable Options Area**: After the main text, display all unique answer options as draggable items
- **Usage Count Display**:
  - Options with `usageLimit` > 1 show count tag "(X)" where X = usageLimit - current usage
  - Options with `usageLimit` = 1 or `usageLimit` = infinity - show no tag
  - Options with 0 remaining uses are faded and not draggable
- **Drop Zone Interaction**:
  - Empty drop zones show placeholder styling
  - Filled drop zones display the selected option
  - Dropping a new option replaces any previously selected option
  - Clicking any drop zone (empty or filled) opens a dropdown menu with all options and their usage counts
- **Dropdown Menu**:
  - Lists all unique options with usage counts "(X)" where X = usageLimit - current usage
  - Fully used options are faded and not selectable
  - Selecting an option has the same effect as dropping it into that zone
  - If a blank has a selected value, a "Clear selection" option with a clear icon appears at the bottom of the dropdown
  - Selecting the clear option removes the current value from the blank
- Previously incorrect selections display with red border styling
- When user changes a previously incorrect selection, red border is immediately removed

### Review Mode (Post-Submission)

- All content is read-only
- Correct answers display with green styling
- Partial answers display with blue styling
- Incorrect/revealed/unanswered answers display with red styling and show: `[user selection] → [correct answer]`
- Empty answers show: `___ → [correct answer]`

### Interactive Elements

- Incorrect answers have a red "?" button that reveals the correct answer
- Correct and partial answers with explanations have a blue "i" icon showing explanation on hover
- Revealing an answer replaces the drop zone with non-editable text and sets `isRevealed: true`

## Answer Evaluation Requirements

### Answer Status Determination

- **Correct**: User's selected value is in the blank's `correctAnswers` array AND `isFirstTrial` is true
- **Partial**: User's selected value is in `correctAnswers` but `isFirstTrial` is false
- **Incorrect**: User's selected value is not in `correctAnswers`
- **Revealed**: User clicked reveal button
- **Unanswered**: No option selected during final submission

### Scoring Rules

- Correct answers: 1 point
- All other statuses: 0 points

### First Trial Tracking

- `isFirstTrial` starts as true for each blank
- Once a blank is submitted with incorrect status, `isFirstTrial` becomes false permanently
- Subsequent correct answers to that blank receive partial status

## Submission Requirements

### Partial Submission ("Submit Non-Empty" button)

- Only evaluates blanks that have selected options
- Empty blanks remain unchanged and editable
- If all blanks become correct after partial submission, automatically finalize the quiz
- Button is enabled only when at least one blank has a selected option

### Final Submission ("Submit" button)

- Evaluates all blanks, treating empty ones as unanswered
- Finalizes the quiz and transitions to review mode
- Button is always enabled during active quiz

### State Persistence

- Draft selections are stored in form state during quiz
- Submitted answers are permanently stored with status and points
- When resuming: correct answers become read-only, incorrect answers remain editable with previous selections, revealed answers become read-only

## Validation Requirements

### Input Processing

- Answer matching uses exact string comparison (case-sensitive)
- Only values from the `answerOptions` pool are accepted
- Empty selection is treated as no input
- Usage limits are strictly enforced during validation

### Drag and Drop Requirements

- Draggable items must respect usage limits (faded when fully used)
- Drop zones accept only valid answer options
- Replacing existing selections updates usage counts immediately
- Dropdown menus reflect real-time usage status
