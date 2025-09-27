Of course. Here is the final, comprehensive requirements document, incorporating all the details from our conversation, including the specific business logic identified from the code.

---

# Final Requirements for Test Application

This document outlines the complete functional requirements for the test application, separating the core framework from the specific logic of the "Fill-in-the-Blanks" test type.

## Part A: General Application Framework Requirements

This section defines the core features and behaviors of the application shell, applicable to **all** test types.

### A.1. Main Interface - Test Dashboard

- The application's entry point is a dashboard displaying a list of all available tests in a table.
- The table must include columns for **ID**, **Name**, **Score**, and an **Action** button.

### A.2. Test Lifecycle and States

- Every test within the application exists in one of three states, determined by data in local storage. The dashboard's `Score` and `Action` columns must reflect the test's current state.

| State                   | Condition in Local Storage                                 | Score Display                   | Action Button |
| :---------------------- | :--------------------------------------------------------- | :------------------------------ | :------------ |
| **Not Taken**           | No data exists for the test ID.                            | "Not taken"                     | `Start Test`  |
| **Partially Completed** | An `attempts` object exists, but no final `result` object. | "-"                             | `Resume Test` |
| **Completed**           | A final `result` object exists.                            | The final score (e.g., "45/52") | `Review`      |

### A.3. Core Test View

- This is the screen where a user takes or reviews a test.
- It must contain the following common UI elements, regardless of test type:
  - **Header:** Displays the current test's name and ID.
  - **Back Navigation:** A back arrow (`←`) that returns the user to the Test Dashboard.
  - **Content Area:** The region where the specific test content is rendered.
  - **Action Area:** A container for action buttons (e.g., Submit, Reset).

### A.4. Core Results View

- This view is for reviewing a completed test.
- It is activated after a final submission or by clicking the "Review" button on the dashboard.
- It must provide:
  - A read-only display of the user's graded answers within the Content Area.
  - A **Results Summary Area** that displays the final calculated score.
  - A **Reset Test** button. Clicking this button must completely clear all `attempts` and `result` data for the current test from local storage and return the user to a fresh, "Not Taken" state for that test.

### A.5. Data Persistence Model

- All user progress and results must be saved in the browser's `localStorage`.
- The system shall use two key patterns per test:
  - `testAttempts_{id}`: Stores the state of a test that is in progress but not yet finalized. The internal structure of this object is defined by the specific test type.
  - `testResult_{id}`: Stores the final, graded result of a completed test. This object must contain `score` and `totalBlanks` properties, but its other contents are defined by the specific test type.

---

## Part B: Test-Type Specific Requirements

This section defines the implementation details for each supported test type.

### B.1. Test Type: Fill-in-the-Blanks

#### B.1.1. Data Structure

- The test `content` is an array of `items`.
- Each `item` can be one of two types:
  - `{ type: "text", value: "..." }`: A static string of text.
  - `{ type: "missing", ... }`: A blank for the user to fill. It has the following properties:
    - `officialAnswers`: An array of strings considered 100% correct.
    - `additionalAnswers` (Optional): An array of strings considered acceptable but partially correct.
    - `explanation` (Optional): A string providing extra context about the answer.

#### B.1.2. Rendering in Test View

- `text` items are rendered as plain text.
- `missing` items are rendered as `<input type="text">` fields.
- When resuming a test:
  - Previously correct/partial answers are rendered as non-editable, styled text.
  - Previously incorrect answers are rendered as pre-filled `<input>` fields with a red border.
  - Previously revealed answers are rendered as non-editable, styled text showing the answer.

#### B.1.3. User Interaction & Features

- **Immediate Error Feedback Removal:** When a user begins typing in an input field that was previously marked incorrect (i.e., has a red border), the red border must be removed immediately to provide feedback that their correction attempt is being registered.
- **Reveal Answer:** An icon (`?`) appears next to an input field after it has been marked `incorrect`. Clicking it reveals the official answer, makes the blank non-editable, and forfeits any potential points for it.
- **Explanation Tooltip:** An icon (`i`) appears next to a blank after it is answered if an `explanation` is available. Hovering over it displays the explanation text.

#### B.1.4. Answer Checking & Submission

- **Submission Buttons:** This test type requires two submission buttons:
  1.  **`Submit Non-Empty`**: Checks only the filled-in answers, ignoring empty fields. This action saves progress to `testAttempts_{id}`. **Crucially, if this submission results in all blanks being correctly filled, the system shall treat it as a final submission**, automatically finalizing the score and showing the Results View.
  2.  **`Submit`**: A final submission that grades all answers (empty fields count as incorrect), saves the final grade to `testResult_{id}`, and transitions to the Results View.
- **Scoring Logic:**
  - **Correct:** The user's input matches an `officialAnswers` string.
    - Awards **1 point** if it is the first attempt for this blank.
    - Awards **0 points** if the blank was previously incorrect. The answer is instead marked as `partial`.
  - **Partial:** The user's input matches an `additionalAnswers` string. Awards **0 points**.
  - **Incorrect:** The user's input matches neither. Awards **0 points** and makes the blank ineligible for future scoring.

#### B.1.5. Display in Results View

- The read-only display will show:
  - **Correct answers:** In a green-styled `<span>`.
  - **Incorrect/Revealed/Empty answers:** The user's attempt (or "\_\_\_") with a strikethrough, followed by the official correct answer.
  - **Partial answers:** The display depends on the reason for the partial status:
    - If the answer was initially **incorrect but later corrected**, the view will only show the user's correct answer in a cyan-styled `<span>`.
    - If the answer was correct based on the `additionalAnswers` list, the view will show the user's answer followed by the official answer in parentheses, for example: `user's partial answer (official answer)`.
- The **Results Summary Area** for this test type must also include a "Full Correct Text" section, which displays the entire passage with all blanks filled in correctly.

### B.2. Test Type: Matching

#### B.2.1. Data Structure

- The test `content` object has a `type` property of `"m"`.
- The object contains two main arrays: `items` and `answerOptions`.
- The `items` array defines the question's text and blanks. Each `item` can be one of two types:
  - `{ type: "text", value: "..." }`: A static string of text.
  - `{ type: "blank", ... }`: A blank for the user to fill by selecting an option. It has the following properties:
    - `correctAnswers`: An array of strings. Each string corresponds to the `value` of an answer in the `answerOptions` list that is considered 100% correct for this blank.
    - `explanation` (Optional): A string providing extra context about the answer.
- The `answerOptions` array defines the global pool of choices for all blanks in the test. Each object in the array has:
  - `value`: The string of text to be displayed in the dropdowns. This value must be unique across all options in this question.
  - `usageLimit` (Optional): A number indicating the maximum times this option can be selected across all blanks. If not defined, it defaults to **1**.

#### B.2.2. Rendering in Test View

- `text` items are rendered as plain text.
- `blank` items are rendered as `<select>` (dropdown) elements.
- Each `<select>` element is populated with `<option>`s as follows:
  - The first option is a blank placeholder (e.g., "---") that represents an empty answer. Selecting it clears the user's choice for that blank.
  - The subsequent options are generated from the top-level `answerOptions` array.
- **Usage Limit Logic:** All the options are always visible, but the number of disabled options in the dropdowns is dynamic.
  - The system continuously tracks the usage count for each `value` in `answerOptions`.
  - If an option's usage count meets its `usageLimit`, that option will be **disabled** in all other `<select>` elements where it is not the currently selected value.
- When resuming a test:
  - Previously correct answers are rendered as non-editable, styled text showing the chosen answer.
  - Previously incorrect answers are rendered as pre-filled `<select>` fields with a red border, with the user's incorrect choice selected.
  - Previously revealed answers are rendered as non-editable, styled text showing the correct answer.

#### B.2.3. User Interaction & Features

- **Immediate Error Feedback Removal:** When a user changes the value of a `<select>` field that was previously marked incorrect (i.e., has a red border), the red border must be removed immediately.
- **Reveal Answer:** An icon (`?`) appears next to a `<select>` field after it has been marked `incorrect`. Clicking it reveals the official answer (the first string from the `correctAnswers` array), replaces the dropdown with non-editable text, and forfeits any potential points for that blank.
- **Explanation Tooltip:** An icon (`i`) appears next to a blank after it is answered if an `explanation` is available. Hovering over it displays the explanation text.

#### B.2.4. Answer Checking & Submission

- **Submission Buttons:** This test type requires two submission buttons:
  1.  **`Submit Non-Empty`**: Checks only the answered blanks (i.e., where the selection is not the blank placeholder), ignoring empty ones. This action saves progress to `testAttempts_{id}`. **Crucially, if this submission results in all blanks being correctly filled, the system shall treat it as a final submission**, automatically finalizing the score and showing the Results View.
  2.  **`Submit`**: A final submission that grades all answers (unanswered blanks count as incorrect), saves the final grade to `testResult_{id}`, and transitions to the Results View.
- **Scoring Logic:**
  - **Correct:** The user's selected `value` is included in the blank's `correctAnswers` array.
    - Awards **1 point** if it is the first attempt for this blank.
    - Awards **0 points** if the blank was previously incorrect. The answer is instead marked as `partial`.
  - **Incorrect:** The user's selected `value` is not in the `correctAnswers` array. Awards **0 points** and makes the blank ineligible for future scoring.

#### B.2.5. Display in Results View

- The read-only display will show:
  - **Correct answers:** In a green-styled `<span>`.
  - **Incorrect/Revealed/Empty answers:** The user's selected answer (or "\_\_\_") with a strikthrough, followed by the first official correct answer from the `correctAnswers` array.
  - **Partial answers:** When an answer was initially incorrect but later corrected, the view will only show the user's correct answer in a cyan-styled `<span>`.
- The **Results Summary Area** for this test type must also include a "Full Correct Text" section, which displays the entire passage with all blanks filled in correctly (using the first answer from each blank's `correctAnswers` array).
