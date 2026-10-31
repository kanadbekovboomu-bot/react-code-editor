# CodeCraft — Minimalist Live Web Development Sandbox Code Editor

[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-FCC72B?logo=vitest&logoColor=black)](https://vitest.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A high-performance, minimalist live web development sandbox built with React and Vite. CodeCraft provides a multi-pane development environment for HTML5, CSS3, and modern JavaScript (ES6+) with real-time debounced sandboxed iframe rendering, a virtual console interceptor, preset templates, snippet import/export, and dual Cloud Firestore / LocalStorage persistence.

---

## Architecture & Core Features

### 1. Multi-Pane Code Workspace
- **Tri-Pane & Tabbed Modes**: Easily switch between a 3-column split layout or focused tabbed editing (`[HTML]`, `[CSS]`, `[JS]`).
- **Developer Productivity**: Line numbers, automatic indentation on Enter, 2-space indentation on Tab key, quick-clear, and one-click code copy.
- **Keyboard Shortcuts**:
  - `Ctrl + Enter` / `Cmd + Enter`: Force re-compile and execute preview.
  - `Ctrl + S` / `Cmd + S`: Open save snippet modal.
  - `Tab`: Insert 2 spaces at cursor.

### 2. Isolated Sandboxed Preview Frame
- **Security Isolation**: Live preview runs inside an `<iframe>` configured with `sandbox="allow-scripts allow-modals"`. Top navigation, parent window snooping, and cookie access are blocked.
- **Debounced Compilation**: Automatic 400ms debounced live refresh prevents UI flickering and rapid CPU spikes while typing.
- **Script Tag Escaping**: Protects against `<script>` collision when writing inline HTML/JS using rigorous script boundary sanitizer.
- **Responsive Viewport Previews**: Switch preview dimensions between Desktop (Full Width), Tablet (768px), and Mobile (375px) with single-click preview popout.

### 3. Virtual Console Interceptor
- **Structured Interception**: Intercepts `console.log`, `console.warn`, `console.error`, and `console.info` via a lightweight head script inside the iframe and dispatches structured `postMessage` payloads to the React parent.
- **Circular Reference Safety**: Argument serializer uses a `WeakSet` cycle-detector to prevent JSON conversion crashes on complex DOM nodes or window references.
- **Runtime Error Trapping**: Unhandled `window.onerror` exceptions and `unhandledrejection` events are caught and surfaced as high-contrast error logs with call stacks.
- **Filter & Search**: Real-time filtering by log level (`ALL`, `LOG`, `WARN`, `ERROR`) and instant keyword text search with a one-click Clear button.

### 4. Snippet Presets & Import/Export
- **Pre-Loaded Templates**:
  - *Interactive Counter*: Animated state counter with step controls.
  - *CSS Glowing Animation*: Luminescent neon button with reactive glow effects and theme switch.
  - *Minimalist Todo App*: Complete task manager with active/completed filters.
  - *HTML5 Interactive Canvas*: Generative particle physics network following cursor interaction.
  - *Blank Canvas*: Clean boilerplate for rapid prototyping.
- **Standalone HTML Export**: Packages HTML, CSS, and JS into a fully self-contained single `.html` file that opens and executes in any web browser completely offline.
- **JSON Snippet Export & Import**: Schema-validated JSON export format and drag-and-drop / upload import parser.

### 5. Resilient Firebase Auth & Persistence
- **Dual-Mode Adapter Pattern (`StorageAdapter`)**:
  - **Cloud Firestore**: Automatically synchronizes snippets to `code_snippets` collection when authenticated.
  - **Local Demo Fallback**: When running locally without active Firebase credentials or offline, the app transparently stores all data in browser `localStorage`.
- **Firebase Authentication**: Supports one-click Anonymous/Guest sign-in and Email/Password account registration.

---

## Sandbox Security Model

```
+--------------------------------------------------------------+
| Parent Application (React, Vite, State Store)                |
|                                                              |
|  +---------------------+        +-------------------------+  |
|  | Multi-Pane Editors  |        | Virtual Console Panel   |  |
|  +----------+----------+        +------------^------------+  |
|             |                                |               |
|    Debounced|srcdoc                          |postMessage    |
|    Bundle   v                                |(CONSOLE_LOG)  |
|  +-------------------------------------------+------------+  |
|  |  <iframe sandbox="allow-scripts allow-modals">         |  |
|  |                                                        |  |
|  |  +-----------------+  +-----------------------------+  |  |
|  |  | Injected Styles |  | Console Proxy Interceptor   |  |  |
|  |  +-----------------+  +-----------------------------+  |  |
|  |  | User HTML DOM   |  | User JS (try/catch wrapper) |  |  |
|  |  +-----------------+  +-----------------------------+  |  |
|  +--------------------------------------------------------+  |
+--------------------------------------------------------------+
```

---

## Getting Started

### Prerequisites
- Node.js (>= 18.0.0)
- npm (>= 9.0.0)

### Installation
```powershell
# Clone the repository
git clone https://github.com/kanadbekovboomu-bot/react-code-editor.git
cd react-code-editor

# Install dependencies
npm.cmd install
```

### Development Server
```powershell
npm.cmd run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Test Suite
```powershell
npm.cmd test
```
Executes all unit tests with Vitest covering the document bundler, console message interceptor, and snippet schema validation.

### Production Build
```powershell
npm.cmd run build
```
Creates an optimized production bundle in the `dist/` directory.

---

## Project Structure

```
react-code-editor/
├── index.html                     # Application entry HTML
├── vite.config.js                 # Vite & Vitest configuration
├── package.json                   # Dependencies & build scripts
├── README.md                      # Documentation
└── src/
    ├── main.jsx                   # React root entry
    ├── App.jsx                    # Root state & layout orchestrator
    ├── index.css                  # Dark mode minimalist design system
    ├── components/
    │   ├── Header.jsx             # Presets, layout switch, and actions
    │   ├── EditorPanes.jsx        # Multi-pane editor with line numbers
    │   ├── PreviewFrame.jsx       # Sandboxed iframe with responsive toggle
    │   ├── ConsoleOutput.jsx      # Virtual console output & log filtering
    │   ├── SaveSnippetModal.jsx   # Snippet creation modal
    │   ├── SavedSnippetsModal.jsx # Snippets browser & loader
    │   └── AuthModal.jsx          # Firebase & Guest authentication modal
    ├── data/
    │   └── templatePresets.js     # 5 pre-loaded interactive templates
    ├── services/
    │   ├── firebase.js            # Modular Firebase Auth & Firestore client
    │   └── storageAdapter.js      # Resilient Firestore / LocalStorage adapter
    ├── utils/
    │   ├── bundler.js             # Sandbox HTML generator & export serializer
    │   └── consoleParser.js       # Virtual console message parser & filter
    └── __tests__/
        └── bundler.test.jsx       # Vitest unit test suite (13 passing tests)
```

---

## License

MIT License. Designed and crafted for high-performance portfolio delivery.
