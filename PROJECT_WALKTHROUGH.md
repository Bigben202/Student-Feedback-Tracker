# Student Feedback Tracker: Project Walkthrough

This guide explains how the project is organized, how its React components work together, and what happens when feedback is added or deleted. It is written for someone learning React as part of the MERN stack.

## What this project does

The app lets a user enter a student's name, a comment, and a rating from 1 to 4. It displays each submission and lets the user delete it. A toast notification appears after a successful submission.

This project currently has a **React front end only**. Feedback is stored in React state in the browser, not in MongoDB. Refreshing the page clears the list. Later, an Express/Node API and MongoDB can be added to save feedback permanently.

## The component tree

```text
index.html
└── src/main.jsx
    └── src/App.jsx
        ├── src/components/FeedbackForm.jsx
        │   ├── src/components/ui/input.jsx
        │   ├── src/components/ui/textarea.jsx
        │   └── src/components/ui/button.jsx
        ├── src/components/FeedbackList.jsx
        │   └── src/components/FeedbackItem.jsx (one per feedback)
        │       ├── src/components/ui/card.jsx
        │       └── src/components/ui/button.jsx
        └── src/components/ui/sonner.jsx
```

The central idea is that `App` owns the feedback data. It passes that data and functions to child components through **props**. The children display information or call those functions to request that `App` change the data.

## 1. How React starts

### `index.html`

The browser starts with `index.html`. Its `<div id="root"></div>` is an empty container where React will put the interface. The script tag loads `src/main.jsx`.

### `src/main.jsx`

This file imports React's `createRoot`, the global stylesheet `index.css`, and the `App` component. `createRoot(...).render(...)` tells React to render `App` inside the HTML element whose ID is `root`.

`StrictMode` is a development helper that can reveal certain issues while you work. It does not create a visible element in the page.

## 2. `App` owns the shared feedback state

In `src/App.jsx`, the state starts as an empty array:

```jsx
const [feedbacks, setFeedbacks] = useState([]);
```

- `feedbacks` is the current array of feedback entries.
- `setFeedbacks` is the function used to update that array.
- `useState` tells React to remember this value between renders. When it changes, React updates the parts of the interface that use it.

Each entry has this shape:

```js
{
  name: "A student",
  comment: "The lesson was helpful.",
  rating: "4"
}
```

The rating is a string because values read from HTML inputs are strings, including values from a number input.

### Adding feedback

`App` defines `addFeedback` and passes it to the form:

```jsx
<FeedbackForm onAdd={addFeedback} />
```

The prop is named `onAdd`. The form can call this function when the user submits it, while `App` remains responsible for updating the shared list.

The state update uses:

```jsx
setFeedbacks(prev => [feedback, ...prev]);
```

React supplies the previous state as `prev`. The expression creates a new array with the new entry first, followed by all previous entries. Creating a new array instead of modifying the old one directly is the normal React state-update pattern. The new entry therefore appears at the top.

### Deleting feedback

`App` also defines `deleteFeedback` and passes it down:

```jsx
<FeedbackList feedbacks={feedbacks} onDelete={deleteFeedback} />
```

`deleteFeedback` receives an item's index and updates the array with `filter`:

```jsx
setFeedbacks(prev => prev.filter((_, i) => i !== index));
```

`filter` creates a new array containing every entry except the one at the selected index. `_` means the feedback value itself is unused in this callback; `i` is the current position.

## 3. `FeedbackForm` manages what is being typed

`src/components/FeedbackForm.jsx` has three pieces of local state:

```jsx
const [name, setName] = useState("")
const [comment, setComment] = useState("")
const [rating, setRating] = useState("")
```

These values belong to the form because they represent the user's current, not-yet-submitted input.

### Controlled inputs

Each field receives a `value` from React state and an `onChange` handler that updates that state. For example:

```jsx
<Input
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

When the user types, the browser fires a change event. `e.target.value` is the new text in the field, and `setName` stores it in React state. React then renders the input with the updated `name` value. An input controlled this way is called a **controlled input**.

The text area and rating input follow the same pattern. The rating input also sets `type="number"`, `min="1"`, and `max="4"`. The fields use `required`, which asks the browser to prevent submission when a field is empty.

### Submitting the form

The form connects its submit event to `handleSubmit`:

```jsx
<form onSubmit={handleSubmit}>
```

When the user submits:

1. `e.preventDefault()` stops the browser's default form behavior, which would reload the page.
2. The handler checks that the name, comment, and rating contain non-whitespace values. `.trim()` removes whitespace at the beginning and end for this check.
3. It calls `onAdd` with a feedback object. `onAdd` is the `addFeedback` function passed down from `App`.
4. It clears the three form state values. Because the fields are controlled by those values, the inputs clear too.
5. It calls `toast(...)` from Sonner to show a success message.

The `required` and `min`/`max` attributes provide basic browser validation. The explicit check in the handler is an additional guard against empty or whitespace-only text.

## 4. `FeedbackList` renders zero or many entries

`src/components/FeedbackList.jsx` receives `feedbacks` and `onDelete` as props:

```jsx
export default function FeedbackList({ feedbacks, onDelete }) {
```

The `{ feedbacks, onDelete }` syntax is called **object destructuring**. React passes a props object to a component, and destructuring extracts the named values from it.

If `feedbacks.length === 0`, the component returns a message saying no feedback has been submitted. Otherwise, it uses:

```jsx
feedbacks.map((f, i) => (
  <FeedbackItem
    key={i}
    index={i}
    feedback={f}
    onDelete={onDelete}
  />
))
```

`map` runs once for each array entry and returns a `FeedbackItem` for it. Here, `f` is the current feedback object and `i` is its array index.

React uses `key` to keep track of elements in a rendered list when it changes. An index is workable for this small list, but a stable unique ID is usually a better key if entries can be reordered or have their own changing state.

## 5. `FeedbackItem` displays one entry

`src/components/FeedbackItem.jsx` receives one feedback object, its index, and the delete callback:

```jsx
export default function FeedbackItem({ feedback, index, onDelete }) {
```

It displays the name, comment, and rating inside a `Card`. The Delete button's click handler calls:

```jsx
onClick={() => onDelete(index)}
```

This invokes the callback with this entry's index. The function came from `App`, passed through `FeedbackList`. `App` then updates its state, which causes the list to render again without the deleted entry.

The full delete path is:

```text
App defines deleteFeedback
  → passes it to FeedbackList as onDelete
    → FeedbackList passes it to each FeedbackItem
      → the button calls it with that item's index
        → App updates feedbacks
          → React renders the updated list
```

This pattern is often called **lifting state up**: state is kept in a common parent so multiple children can read it or request changes to it.

## 6. Toast notification

`App` renders `<Toaster />`, which provides the place where notifications can appear. The `toast` function imported in `FeedbackForm.jsx` asks Sonner to show a message. The toaster component in `src/components/ui/sonner.jsx` configures the notification appearance and icons.

The form triggers the notification after it has called `onAdd` and cleared its fields.

## 7. Reusable UI components and styling

The components under `src/components/ui/` are reusable wrappers around common elements:

- `input.jsx` wraps an HTML `<input>`.
- `textarea.jsx` wraps an HTML `<textarea>`.
- `button.jsx` wraps a button and supports visual variants such as `"destructive"`.
- `card.jsx` provides reusable card styling.
- `alert.jsx` defines alert components, though the feedback flow described here does not currently use them.
- `sonner.jsx` wraps and configures the toast notification component.

These wrappers forward props to their underlying elements. That is why a caller can provide normal input or button props, such as `value`, `onChange`, `type`, `onClick`, and `required`.

`src/index.css` imports Tailwind CSS, animation styles, and the Geist font. It also defines color and spacing-related CSS variables. Classes such as `text-center`, `space-y-4`, and `text-muted-foreground` are Tailwind utility classes.

`src/lib/utils.js` re-exports `cn` from the installed `cn` package. The UI wrappers use `cn` to combine their default CSS classes with any additional `className` passed by the caller.

## 8. Project configuration files

- `package.json` lists dependencies and project commands. `pnpm dev` starts the development server; `pnpm run build` makes a production build; `pnpm run lint` checks the code with ESLint; and `pnpm run preview` serves a production build locally.
- `vite.config.js` configures Vite, including its React and Tailwind plugins and the `@` import alias.
- `jsconfig.json` tells editor tooling that imports beginning with `@/` refer to files under `src/`.
- `components.json` contains settings used by the UI component tooling.
- `eslint.config.js` configures ESLint checks for JavaScript, JSX, React hooks, and Vite's React refresh support.
- `src/App.css` contains styles from the original Vite template; the current feedback screen primarily uses Tailwind classes and `src/index.css`.

## 9. The complete add-and-display flow

```text
1. User types into a field
2. onChange updates the corresponding form state
3. User submits the form
4. handleSubmit validates and calls onAdd(feedback)
5. onAdd is App's addFeedback function
6. App adds the entry to feedbacks state
7. React renders App again with the updated state
8. FeedbackList maps the array into FeedbackItem components
9. The new feedback appears on screen
```

The delete flow works in the reverse direction: the user clicks a button inside a child component, the child calls a callback from `App`, and `App` changes the state that all the components display.

## 10. How this connects to MERN

MERN stands for **MongoDB, Express, React, and Node.js**. This project currently uses React for the front end, but it does not yet include a Node/Express server or a MongoDB database.

Right now, the data flow is:

```text
React form → React state → React list
```

In a full MERN app, it could become:

```text
React form
  → HTTP request to an Express API running on Node.js
    → API validates and reads/writes feedback in MongoDB
  → API sends a response to React
    → React updates the page with the returned data
```

Because the current feedback exists only in React state, refreshing the browser clears it. Storing and loading the feedback through an API and database is the next step toward making this a complete MERN app.

## Concepts to remember

1. **State** is data React remembers and uses to render the interface.
2. **Props** are values or functions passed from a parent component to a child.
3. **Callbacks** let a child ask a parent to do something, such as add or delete an entry.
4. **Controlled inputs** get their displayed values from React state.
5. **`map`** turns array entries into rendered components.
6. **`filter`** creates a new array containing only entries that pass a condition.
7. **Immutable updates** create new arrays or objects rather than changing existing state directly.
8. **Lifting state up** means storing shared data in a parent component that coordinates its children.

## Beginner practice ideas

- Add a character counter for the comment field.
- Show how many feedback entries are currently in the list.
- Replace index-based keys with generated IDs.
- Add an edit button and learn how to update one entry in an array.
- Refresh the page and observe that the current state is lost.
- Later, build an Express API and connect the form and list to MongoDB so feedback persists.
