# 🎶 Maqam Network - README

Welcome to the **Maqam Network** project!

In this document, we will first introduce the **musicological concepts** that are the heart of this project—explaining key ideas such as *maqamat*, *ajnas*, and *suyūr*. These foundational elements shape the sound and structure of Arabic music, and they are what make the Maqam Network a unique educational and creative tool.

Following that, we will provide an overview of the **technical components** that make up the Maqam Network. This includes a breakdown of how the data flows between different parts of the system, the role of various components, and how they interact to bring the maqamat system to life in an interactive web environment.

Let's dive in! 🚀

## 🎼 Tuning System (Tanghīm)

At the heart of the Maqam Network is the **Tuning System**, known in Arabic as *Tanghīm*. The Tuning System defines the set of pitch classes and their corresponding frequencies that shape the sound of a given *maqam*. It acts as a reference framework for how pitches are interpreted, named, and mapped within the system.

Each Tuning System in Maqam Network is represented by a TypeScript class called `TuningSystem`. This class holds all the essential information about a tuning system, including:

- **Metadata**: such as the title, source, year, creator, and comments (in both English and Arabic).
- **Pitch Classes**: the raw notes that form the backbone of the tuning system, these can be in either fractions, string lengths, cents or decimal decimalRatio.
- **Reference Frequencies**: mappings from note names to specific frequencies, which allow us to recreate and synthesize the sound of the system.
- **Abjad Names**: Arabic-style note names used for traditional notation and analysis.
- **Transliterated Note Sets**: collections of note names in different transliterations, enabling flexibility in representing pitches in various formats.
- **String Length**: a physical property that helps simulate the behavior of string instruments within the tuning system.
- **Default Reference Frequency**: a central tuning point that grounds the entire system.

The Tuning System provides **getter methods** to access all its data, ensuring that other components (like *Jins*, *Maqam*, and *Sayr*) can retrieve and manipulate pitch data accurately. The `stringify` method offers a quick way to represent the system as a human-readable string (combining the creator’s name, year, and title).

The Tuning System serves as the **foundation** upon which all other elements of Maqam Network are built.

### 🎼 Transliterated Note Names

To fully represent the complexity of Arabic music notation, Maqam Network includes a **comprehensive system of transliterated note names**. These names map each pitch to its corresponding name in Arabic theory, including historical terms like *qarār*, *jawāb*, and specific microtonal variations such as *nīm* (half-flat) and *tīk* (quarter-sharp).

The transliterated note names are organized across **five octaves**:
- **Octave Zero**: the lowest register, often referred to as *qarār* (base).
- **Octave One**: the foundational register for many maqamat, starting with *yegāh*.
- **Octave Two**: a higher register with notes like *ḥuseinī*, *ʿajam*, and *kurdān*.
- **Octave Three**: an extended range used for more complex or modal transpositions.
- **Octave Four**: the highest octave, typically theoretical, representing further transpositions.

For example:
- In **Octave One**, you might encounter names like `yegāh`, `ʿushayrān`, `kawasht`, and `ḥijāz`.
- In **Octave Two**, you find `ḥuseinī`, `ʿajam`, `sunbuleh`, and `shahnāz`.

Each note name represents a specific **microtonal position** within the maqam system, and the naming conventions are based on historical and theoretical sources.

These transliterated names are implemented as TypeScript constants (e.g., `octaveOneNoteNames`, `octaveTwoNoteNames`) and are combined into a unified type called `NoteName`. This allows developers to reference, validate, and manipulate note names consistently across the codebase.

By using this detailed mapping, Maqam Network can:
- **Display note names** accurately in the UI.
- **Map pitch classes to traditional Arabic theory**.
- **Support transpositions** across octaves while preserving historical accuracy.

### 📚 Sources

All musical components in Maqam Network—such as **Tuning Systems**, **Ajnas**, and **Maqamat**—are linked to references from academic or historical sources. These references provide the context and legitimacy behind the musical data and are critical for preserving the authenticity of the information.

The `Source` class serves as the backbone for managing these references. It organizes key metadata like:
- The **title**, **publication details**, and **contributors** (authors, editors, translators, etc.) in both English and Arabic.
- Information like **edition**, **publication date**, **publisher**, **place of publication**, **ISBN**, **URL**, and **date accessed**.

This structure allows Maqam Network to maintain a clear and traceable link between musical components and their original scholarly or historical sources, ensuring transparency and credibility.

### 🎵 Jins: The Smallest Unit of a Maqam

A **Jins** (plural: *Ajnas*) is the fundamental building block of a maqam. It is a small, melodic fragment—typically a collection of **3 to 5 notes**—that forms the core of a melodic structure. In Arabic music theory, ajnas define the unique color and flavor of a maqam, much like a motif in Western classical music.

Each **Jins** in Maqam Network is represented by a TypeScript class, which includes:
- An **ID** and a **name** (e.g., *Rast*, *Hijaz*, *Saba*).
- A list of **note names** that make up the jins, using the system of transliterated note names discussed earlier.
- A list of **SourcePageReferences** that provide scholarly context and trace the origin of the jins definition.

Importantly, **not all ajnas work in every tuning system**. For a jins to be valid in a specific tuning system, **all the notes in the jins must exist within that tuning system’s pitch classes**. This ensures that theoretical ideas align with the practical possibilities of the chosen tuning.

By combining different ajnas, we can build more complex structures like maqamat. In Maqam Network, the **Jins** class provides a flexible and modular way to define these melodic fragments, ensuring that each jins is both musically coherent and historically accurate.

### 🌿 Maqam: The Full Scale of a Musical Mode

A **Maqam** is the complete musical mode in Arabic music, built by combining multiple **ajnas** in a specific melodic and theoretical structure. Unlike ajnas, which are usually small fragments (3 to 5 notes), a maqam is a **full-scale system** that can span **7 or more notes** and often includes both an **ascending** and a **descending** form. These two directions can have different note sequences, giving maqamat a dynamic and expressive character.

Each Maqam in Maqam Network is represented by a TypeScript class, which includes:
- An **ID** and a **name** (e.g., *Bayati*, *Hijaz*, *Rast*).
- The **ascending note names** and **descending note names**, expressed as arrays of transliterated note names.
- A list of **suyūr** (melodic pathways) that describe common ways to navigate the maqam in performance.
- A list of **SourcePageReferences** to link the maqam’s definition to its historical or academic sources.

For the purpose of this project, a maqam is considered **symmetric** if its ascending and descending note names are identical (in reversed order). Otherwise, it is treated as **asymmetric**, which is often the case in traditional Arabic music.

Just like **ajnas**, not every maqam can be performed in every tuning system. A maqam can only be realized in a given tuning system if **all of its ascending and descending note names exist within that tuning system’s pitch classes**. This ensures that each maqam is theoretically consistent with the practical limitations of the tuning system in use.

Maqams are the **core structures** of Arabic music, and by defining them explicitly, Maqam Network makes it possible to explore and experiment with different melodic systems across various tuning frameworks.

### 🎶 Suyūr and Sayr: The Melodic Pathways

In Arabic music, a **Sayr** (plural: *Suyūr*) is a **melodic pathway** or **route** that guides how a maqam is performed in practice. While a maqam defines the scale and the available notes, the *sayr* defines **how a musician navigates through those notes**—where to start, where to pause, which notes to emphasize, and how to transition between different parts of the maqam.

Each *Sayr* in Maqam Network is represented as a sequence of **stops**, where each stop can be:
- A **note** (e.g., *ʿushayrān*, *kawasht*),
- A **jins** (e.g., *Rast*, *Saba*),
- Or a **directional instruction** (e.g., *ascending* or *descending*).

For example, a *Sayr* might describe how to move from a specific jins in the lower part of a maqam to another jins higher up, indicating the typical route taken by performers.

Each *Sayr* object includes:
- An **ID**.
- The **creator's name** (in English and Arabic).
- The **source** and **page number** where this sayr is documented.
- **Comments** in both languages, which often explain the interpretation or performance nuances.
- A list of **stops** that define the melodic path.

In Maqam Network, **suyūr** enrich the static definitions of maqamat by showing **how they are actually used in performance**. This feature makes it possible for users to explore the living tradition of maqamat, not just as theoretical scales, but as dynamic, expressive systems of melody.


# 🎶 Pattern: Creating Melodic and Rhythmic Sequences

The **Pattern** class allows users to build simple, reusable **melodic patterns** that can be played over a selected maqam or jins. These patterns act like a **sliding window**—they move across the notes of the maqam or jins, letting users hear different combinations of notes within the mode.

Each **Pattern** consists of:
- An **ID** and a **name** to identify the pattern.
- A list of **notes** that make up the pattern. Each note is defined by:
  - A **scale degree** (like the 1st, 2nd, or 5th note in the maqam or jins).
  - A **note duration**, using musical notation (e.g., `4n` for quarter notes, `8n` for eighth notes, or `16t` for sixteenth-note triplets).

Here’s an example of what a pattern might look like:
```json
{
  "id": "p1",
  "name": "Simple Ascending",
  "notes": [
    { "scaleDegree": "1", "noteDuration": "4n" },
    { "scaleDegree": "2", "noteDuration": "4n" },
    { "scaleDegree": "3", "noteDuration": "4n" }
  ]
}
```

This feature lets users:
- Experiment with how different parts of a maqam or jins sound when combined rhythmically.
- Create practice exercises for melodic and rhythmic training.
- Compose small ideas that can be played back interactively in Maqam Network.

The **Pattern** system brings a practical, interactive element to the theoretical study of maqamat—making it easier for users to hear and understand the music in motion.

### 🔄 Transpositions: Exploring Maqam and Jins in Different Positions

In Maqam Network, when a user selects a **jins** or a **maqam**, it becomes the **taḥlīl**—the original sequence of notes that defines the mode in the chosen tuning system. However, Arabic music allows for **modulation and variation**, and sometimes, other sequences in the tuning system share the exact same **interval pattern** as the original jins or maqam. 

When such a sequence is found, it is called a **transposition**. A transposition means that the same musical pattern can exist in a different starting position—just like playing a scale starting on a different note but maintaining the same distances between the notes.

For example:
- If you select the **Rast jins** on a specific tuning system, Maqam Network will search for other note sequences in the system that have the **same interval structure** as the original Rast jins. These sequences are considered **valid transpositions** of the Rast jins.
- For **maqamat**, the same principle applies, but with an extra rule: a valid transposition must match **both the ascending and descending patterns** of the maqam. If a different sequence in the tuning system shares the same interval structure for both directions, it is considered a valid transposition of that maqam.

This system allows users to explore how a jins or maqam might appear in **different positions** on a tuning system—unlocking new creative possibilities and revealing hidden connections within the theoretical framework of Arabic music.

## 💻 Code & Tech Stack

The Maqam Network project is built as a modern web application using a **full-stack JavaScript/TypeScript stack**. Here’s a breakdown of the technologies used:

- **Next.js**: The backbone of the project, handling server-side rendering, routing, and static site generation. This ensures fast loading times and a seamless user experience.

- **React**: The core frontend framework for building interactive user interfaces. React powers dynamic components like the interactive cell grid, filters, and playback controls.

- **TypeScript**: A strongly-typed layer on top of JavaScript that helps catch errors early, improve code maintainability, and enforce a consistent structure across the project.

- **SCSS**: Used for styling the application. SCSS allows for modular, reusable styles that make it easy to maintain and scale the visual design of Maqam Network.

- **Locally Stored JSON Data**: All core musical data—such as tuning systems, ajnas, maqamat, sayr, and sources—are stored in static JSON files. These files are:
  - **Read at build time**.
  - **Immutable at runtime**—the data remains consistent for all users unless explicitly updated by the developers.
  - **Updated manually and redeployed** whenever new information is added or corrections are made.

This architecture keeps the application **lightweight** and **fast**, while making it easy to add new content or expand the dataset over time.


## 🗂️ Contexts, URL Parameters, and the Single-Page Architecture

Maqam Network is designed as a **single-page application** (SPA) that keeps the user’s selections and preferences in sync, even when the page is refreshed. Here’s how it works under the hood:

### 📦 Global State with Contexts

To manage state across the app, Maqam Network uses **React Contexts**. Contexts allow different parts of the application to share and access global data—like the selected **tuning system**, **maqam**, **jins**, or **sayr**—without passing them down through props. 

For example:
- The `AppContext` holds the state for tuning systems, selected maqam, selected jins, and other core musical data.
- The `MenuContext` manages the selected menu tab (e.g., "jins", "maqam", "sayr"), determining which components are visible at any time.

This structure makes the app highly modular, ensuring that components remain in sync with the user’s actions.

### 🌐 URL Parameters for State Persistence

Maqam Network also uses **URL parameters** to persist the user’s state across page refreshes and sharing. When a user selects a tuning system, maqam, jins, or sayr, the app:
- Reads the selections from the URL query parameters (like `tuningSystem=1` or `maqam=bayati`).
- Writes updates back to the URL whenever the user makes a new selection.

This is handled in the `HomeClient` component, which:
- **Parses the URL parameters** on page load to restore the user’s previous selections.
- **Updates the URL** whenever a user changes their selection, so they can share or bookmark their current view.

### 🏠 Single-Page Architecture

Maqam Network is structured as a **single page** inside the `/app` directory:
- The `page.tsx` file acts as the root page and simply renders a `HomeClient` component inside a `Suspense` wrapper.
- The `HomeClient` is the main logic and display hub of the app. It imports all major components (like `TuningSystemManager`, `JinsManager`, `MaqamManager`, `SayrManager`, etc.) and **conditionally displays them** based on the current menu selection.
- The **navbar** is not separate routes—it simply **shows and hides components** inside the same page, creating a seamless and responsive user experience without page reloads.

This approach keeps the app **fast**, **lightweight**, and **focused** on interactive exploration of maqamat and tuning systems without unnecessary page transitions.


## 🌐 AppContext: The Core State Manager

The `AppContext` in Maqam Network serves as the **central hub** for managing and sharing global state across the entire application. It provides a single source of truth for all core musical data, user selections, and interaction logic, ensuring consistency and interactivity throughout the app.

### 🧭 Purpose

`AppContext` enables different parts of the app—such as the Tuning System Manager, Jins Manager, Maqam Manager, and Sayr Manager—to access and manipulate shared data. This includes:
- Selected **tuning system**, **maqam**, **jins**, and **sayr**.
- User-defined **pitch classes**, **note names**, and **reference frequencies**.
- MIDI device connections for input and output.
- Sound settings (waveform, volume, ADSR envelope).
- Selected cells, indices, and mappings for playback and visualization.
- A central API for **playing sounds**, **sending MIDI messages**, and **handling URL parameters**.

### 🧩 State and Methods

The `AppContextInterface` exposes a rich set of state variables and functions, including:

- **tuningSystems**: List of all loaded Tuning Systems.
- **selectedTuningSystem**: The currently active Tuning System.
- **tuningSystemPitchClasses**: User-defined pitch classes as a string (e.g., comma-separated fractions).
- **noteNames**: The transliterated note names mapped across octaves.
- **referenceFrequencies**: Mapping of note names to frequencies for sound synthesis.
- **selectedPitchClasses**: The currently selected cells in the Tuning System grid.
- **selectedIndices**: The mapped indices of selected pitch classes.
- **originalIndices**: The original pitch class indices before any mapping.
- **ajnas**: List of all Jins definitions.
- **selectedJinsDetails**: The currently selected Jins.
- **maqamat**: List of all Maqamat definitions.
- **selectedMaqamDetails**: The currently selected Maqam.
- **maqamSayrId**: ID of the selected Sayr for the current Maqam.
- **centsTolerance**: Tolerance setting for matching pitches by cents.
- **soundSettings**: All sound-related settings including waveform, volume, ADSR envelope, MIDI input/output, and playback pattern.
- **midiInputs** and **midiOutputs**: Available MIDI devices.
- **sources**: All source references used in the app.
- **patterns**: All melodic patterns for playback.
- **setRefresh**: A trigger for manually refreshing MIDI devices.

In addition, the context provides core functions such as:
- **playNoteFrequency**: Play a sound for a given frequency.
- **noteOn** and **noteOff**: Start and stop a note based on frequency.
- **playSequence**: Play a sequence of notes, respecting patterns and tempo.
- **handleStartNoteNameChange**: Change the starting note and update mappings.
- **mapIndices**: Map note names to indices in the Tuning System.
- **getCellS**: Retrieve all computed details for a given cell (note name, frequency, decimalRatio, cents, etc.).
- **getAllCells**: Get all possible cells across octaves.
- **clearSelections**: Reset selections for cells, jins, and maqam.
- **checkIfJinsIsSelectable** and **checkIfMaqamIsSelectable**: Validate if a jins or maqam can be selected in the current tuning.
- **handleClickJins** and **handleClickMaqam**: Handle user selection of a jins or maqam and update the state.
- **handleUrlParams**: Parse URL query parameters (e.g., `tuningSystem`, `jins`, `maqam`, `sayr`, `firstNote`) and update the context accordingly.

### 🎶 Why It Matters

The `AppContext` is the **backbone** of Maqam Network. It bridges the gap between theoretical data and interactive sound exploration—allowing users to:
- Configure tuning systems and pitch mappings.
- Select and interact with ajnas, maqamat, and sayr.
- Play back notes via sound synthesis or MIDI.
- Share state via URLs for collaborative learning or demonstration.

By centralizing state and exposing a consistent API, `AppContext` makes the Maqam Network both robust and intuitive, empowering users to explore Arabic music theory in an engaging and interactive way.


## 📦 Filter Context

The **Filter Context** in Maqam Network manages the visibility of various fields across the application’s tables and UI components. This allows users to customize their view of the musical data, focusing on the parameters that matter most to them.

### 🧭 Purpose

The Filter Context defines which columns or fields are shown in the UI, such as note names, frequencies, decimalRatio, and other technical details. By toggling these filters, users can tailor the interface to their specific needs.

### 🏗️ Structure

The Filter Context consists of:
- A `FilterSettings` interface, which defines boolean flags for each filterable field:
  - `englishName`: Show or hide English note names.
  - `fractionRatio`: Show or hide the pitch class as a fraction ratio.
  - `cents`: Show or hide the cent value of the pitch class.
  - `stringLength`: Show or hide the string length representation.
  - `fretDivision`: Show or hide the fret division value.
  - `decimalRatio`: Show or hide the decimal ratio of the pitch class.
  - `midiNote`: Show or hide the MIDI note number.
  - `frequency`: Show or hide the frequency value.

- A default filter configuration (`defaultFilters`), where all fields are set to `true` by default.

- The `FilterContext` itself, created using `createContext`, which holds the global state for filters.

- The `FilterContextProvider` component, which wraps the application and provides the filter state to all components.

- A `toggleFilter` function that allows individual filters to be toggled on or off.

- The `useFilterContext` hook, which provides a safe and easy way to access the filter state and functions throughout the app.

### 🚀 Usage

1. The `FilterContextProvider` is wrapped around the application or components that need access to the filter settings.
2. Components that need to read or update filter settings use the `useFilterContext` hook.
3. The `filters` object provides the current visibility status for each field.
4. The `toggleFilter` function toggles the visibility of a specific field.

This context keeps the UI modular and customizable, allowing users to explore and interact with the data in ways that suit their workflow.

# 📂 Menu Context (`menu-context.tsx`)

The **Menu Context** is a global state manager in the Maqam Network project that handles the state and visibility of core UI components such as navigation panels, settings, drawers, and the currently selected menu. This context enables a clean separation of concerns, ensuring that UI components stay in sync without needing to pass props down deeply.

## 🌐 Purpose

The `MenuContext` is designed to manage **UI state** related to the user's interaction with the application layout. Specifically, it manages:

- Whether the **Navigation** panel is open or closed (`openNavigation`).
- Whether the **Settings** panel is open or closed (`openSettings`).
- Whether the **Bottom Drawer** is open or closed (`openBottomDrawer`).
- The **currently selected menu tab** (e.g., "tuningSystem", "maqam", "jins", "sayr", "bibliography", "pattern").

By centralizing these controls, Maqam Network ensures that UI behavior remains consistent and predictable, regardless of where user interactions occur.

## 🔧 Structure

The `MenuContext` provides the following state values and setters:

| Variable            | Type                                              | Description                                         |
|---------------------|---------------------------------------------------|-----------------------------------------------------|
| `openNavigation`    | `boolean`                                         | Whether the navigation menu is open                 |
| `setOpenNavigation` | `Dispatch<SetStateAction<boolean>>`               | Function to toggle `openNavigation`                 |
| `openSettings`      | `boolean`                                         | Whether the settings panel is open                  |
| `setOpenSettings`   | `Dispatch<SetStateAction<boolean>>`               | Function to toggle `openSettings`                   |
| `openBottomDrawer`  | `boolean`                                         | Whether the bottom drawer is open                   |
| `setOpenBottomDrawer` | `Dispatch<SetStateAction<boolean>>`             | Function to toggle `openBottomDrawer`               |
| `selectedMenu`      | `"tuningSystem" | "maqam" | "jins" | "sayr" | "bibliography" | "pattern"` | The active menu tab                                 |
| `setSelectedMenu`   | `Dispatch<SetStateAction<...>>`                   | Function to update the active menu tab              |

## 📍 Why It Matters

The `MenuContext` is critical for maintaining **UI consistency** across the Maqam Network interface. By using a single source of truth for UI states, components like the navigation bar, settings panel, and menu tabs can remain synchronized, ensuring a fluid and cohesive user experience.

This pattern also reduces the need for prop drilling, simplifying the component hierarchy and making the application easier to maintain.

## 🎛️ Tuning System Manager (`tuning-system-manager.tsx`)

The **Tuning System Manager** is the core UI component for managing, editing, and interacting with tuning systems (or *Tanghīm*) within Maqam Network. It brings together the musical data model, user interactions, and visual representations in one comprehensive interface.

### 🧭 Purpose

The **Tuning System Manager** allows users to:
- **Create**, **edit**, or **delete** tuning systems.
- Define the **pitch classes** of a tuning system (as fractions, decimals, cents, or string lengths).
- Assign **note names** (both transliterated and abjad) to these pitch classes.
- Configure **starting notes** for each tuning system to build different configurations.
- **Visualize** all this information across **four octaves**.
- **Play back** selected notes as sound to hear the tuning in action.

### 🔧 Core Functionality

- **State Management**: The component relies on multiple contexts, primarily `AppContext` (for tuning system data and global state) and `FilterContext` (for controlling visible columns like frequency, cents, etc.). It uses extensive `useState` and `useEffect` hooks to synchronize local component state with global state.

- **Pitch Classes & Note Names**: Users define pitch classes in a textarea. The app parses these into a list and maps them to note names across octaves (using transliterated Arabic names). There’s logic for **cascading** note name selections across columns, and for handling both **octave one** and **octave two** mappings.

- **Octave Grids**: A large table renders the tuning system’s data across four octaves. Each column represents a pitch class, and rows show:
  - The pitch class index.
  - The note name (selectable for octave one, static for others).
  - The abjad name (selectable for octave one and two).
  - English note name (optional).
  - The pitch class in different formats (fraction, decimal, cents, etc.).
  - MIDI note number.
  - Frequency.
  - Play button.
  - Selection checkbox.

- **Interaction Logic**: The manager lets users:
  - **Select/deselect cells** (by clicking checkboxes).
  - **Play** individual frequencies.
  - **Play a sequence** of selected notes.
  - **Save or delete** note name configurations.
  - Set **reference frequencies** for starting notes.

- **CRUD Operations**: Users can:
  - **Create a new tuning system** from scratch.
  - **Edit** an existing one (change any field: title, creator, pitch classes, etc.).
  - **Delete** a tuning system.

- **Dynamic URL Sync**: The component is connected to the URL parameters via the `AppContext` and `HomeClient`. When a tuning system is selected, it updates the URL, and reloading the page restores the selected system.

### 🧱 Component Structure

- The component is wrapped in a `<details>` element for collapsible behavior.
- Contains **form inputs** for metadata fields (titles, creators, source, comments).
- A **pitch class textarea** lets users input raw tuning data.
- The **grid** shows the detailed breakdown of the tuning system across octaves.
- Control buttons for playing notes, managing note configurations, and managing tuning systems.

### 🎨 Design & Usability

The Tuning System Manager is designed for **power users** who want full control over their tuning system data:
- The UI supports **dynamic filtering** (via the `FilterContext`) to show or hide specific data columns.
- Data is **live-updated**—changes in the interface immediately reflect in the tuning system object.
- It ensures **data integrity** by validating note name selections against pitch classes.

### 🎶 Why It Matters

This component is the heart of Maqam Network—it translates raw musicological data into an interactive tool that lets users build, explore, and listen to tuning systems. By offering full customization, the Tuning System Manager empowers users to engage deeply with Arabic music theory and its tuning structures.


## 🎵 Jins Manager (`jins-manager.tsx`)

The **Jins Manager** is a user interface component in Maqam Network that allows users to explore, edit, and manage *ajnas*—the fundamental building blocks of maqamat.

### 🧭 Purpose

The **Jins Manager** helps users to:
- **View** a list of all available *ajnas* in the current tuning system.
- **Select** an existing jins from the list to examine its details.
- **Create** a new jins and assign a name and note names to it.
- **Edit** the note names and source references of the currently selected jins.
- **Delete** a jins from the list.
- **Play** the selected jins to hear how it sounds.

### 🔧 Core Functionality

- **List and Selection**: The manager displays all *ajnas* and highlights which ones are playable based on the selected tuning system. Users can select a jins to view its details.

- **Jins Playback**: When a jins is selected, users can play the notes of that jins in sequence to hear its sound.

- **Editing and Creation**:
  - Users can create a new jins, assign a name, and select the note names that define it.
  - Source references can be added, edited, or removed for each jins.
  - Changes are saved to the global state via the `AppContext`.

- **Integration with the Tuning System**: The manager ensures that *ajnas* align with the current tuning system’s pitch classes, so users only work with valid, playable note combinations.

### 🧱 Component Structure

- Displays a list of *ajnas* (sortable by name).
- Highlights which *ajnas* are compatible with the current tuning system.
- Lets users:
  - Select an existing jins to edit.
  - Create a new jins.
  - Edit the name, note names, and source references of the jins.
  - Save or delete the jins.

### 🎨 Design & Usability

The Jins Manager provides an intuitive interface for interacting with *ajnas*. It supports:
- Clear visual distinction of compatible/active *ajnas*.
- Easy creation and editing of *ajnas* through form fields and buttons.
- Quick playback of jins sequences for immediate auditory feedback.

By making the process of working with *ajnas* simple and interactive, the Jins Manager helps users explore and experiment with different melodic fragments within Arabic music theory.


# 🎼 Transpose Functions (`transpose.ts`)

The **Transpose Functions** module provides core logic for calculating transpositions of *ajnas* and *maqamat* within the Maqam Network. These functions enable pattern detection, interval matching, and generation of valid transposition sequences based on user input and tuning systems.

---

## 🧭 Purpose

This module allows the Maqam Network to:

- **Analyze melodic patterns** within *ajnas* and *maqamat* by computing intervals (either as decimalRatio or cent differences).
- **Generate transposed sequences** of cells that match a given interval pattern, enabling exploration of musical possibilities across the pitch grid.
- **Support both ascending and descending sequences**, ensuring that transpositions align with the theoretical structure of Arabic music.
- **Bridge user-defined pitch data** (via the `AppContext`) with theoretical patterns, enabling educational and creative exploration.

---

## 🔧 Core Functionality

- **Interval Pattern Generation**:
  - The `getIntervalPattern()` function creates an array of intervals (as either decimalRatio or cent differences) based on a sequence of cell details.

- **Transpositions Generation**:
  - The `getTranspositions()` function recursively builds all valid sequences of cells that match a given interval pattern, considering direction (ascending/descending), ratio/cents mode, and a user-defined cents tolerance.
  - It filters out sequences that exceed pitch boundaries, such as the forbidden octave 3.

- **Maqam and Jins Transpositions**:
  - `getMaqamTranspositions()` identifies valid ascending and descending sequences within a *maqam*, matching the theoretical note names and intervals.
  - `getJinsTranspositions()` finds valid sequences for a given *jins* based on its note names and intervals.

- **Sequence Merging**:
  - `mergeTranspositions()` pairs compatible ascending and descending sequences, ensuring they form valid maqam pathways.

---

## 🧱 Function Breakdown

| Function                     | Description                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `getIntervalPattern()`       | Computes an array of intervals (ratio or cent difference) from a given sequence of cells.    |
| `getTranspositions()`        | Generates all valid transpositions matching an interval pattern, using recursion and filtering logic. |
| `mergeTranspositions()`      | Combines ascending and descending sequences that share a common note, forming full maqam transpositions. |
| `getMaqamTranspositions()`   | Finds valid transpositions for a maqam, considering its ascending/descending note names and patterns. |
| `getJinsTranspositions()`    | Finds valid transpositions for a jins, based on its note names and interval pattern.         |

---

## 🎨 Integration with Maqam Network

These functions power the **Transpositions Tables** for both *ajnas* and *maqamat*. They ensure that the generated sequences reflect authentic Arabic music theory, helping users explore valid melodic pathways within their selected tuning system and musical context.

The module works closely with:

- The **AppContext**: Provides access to global cell details, tuning systems, and user preferences (e.g., cents tolerance).
- The **Jins and Maqam models**: Define theoretical note names and structures for pattern generation.


# 🎼 JinsTranspositions Component (`jins-transpositions.tsx`)

The **JinsTranspositions** component is a dynamic UI module in the Maqam Network that displays and analyzes *jins* transpositions based on the current selection and tuning system. It enables users to visually explore, play, and interact with different transposition patterns of a selected *jins*.

---

## 🧭 Purpose

The component serves as a **learning and exploration tool** for Arabic music theory by:

- Displaying the interval structure and note names of a selected *jins*.
- Showing all valid transpositions (taṣwīr) of the *jins* across the pitch grid.
- Allowing users to **play** sequences, **select** them for further exploration, and **adjust cents tolerance** for more flexible matching.

It integrates theoretical concepts like **Darajat al-Istiqrār** (tonic/finalis) and provides auditory and visual feedback for educational purposes.

---

## 🔧 Core Functionality

- **Data Processing**:
  - Uses `getIntervalPattern` and `getTranspositions` from `transpose.ts` to compute interval patterns and matching sequences.
  - Filters sequences to exclude the original tonic/finalis when displaying transpositions.

- **Two Main Tables**:
  1. **Analysis Table (`Taḥlīl`)**: Shows the original *jins*, its note names, intervals (in decimalRatio or cent differences), original values, and playback options.
  2. **Transpositions Table (`Taṣwīr`)**: Lists valid transpositions of the *jins*, including note names, intervals, and playback buttons.

- **Playback Controls**:
  - **Play Single Note**: Plays individual notes using `playNoteFrequency`.
  - **Play Full Sequence**: Plays the entire *jins* sequence with `playSequence`.

- **Selection Controls**:
  - Allows users to select and highlight the cells corresponding to a transposed sequence by updating the `selectedPitchClasses` in the `AppContext`.

- **Cents Tolerance**:
  - Users can adjust the `centsTolerance` value, enabling flexibility when matching sequences by cent differences.

---

## 🧱 Component Structure

| Section                      | Description                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Analysis Table (`Taḥlīl`)    | Displays the original *jins* data: note names, values, intervals, cents, and playback buttons. |
| Transpositions Table (`Taṣwīr`) | Lists valid transpositions of the *jins*, each with its own note names, values, intervals, and playback controls. |
| Controls                     | Buttons to **Select & Load to Keyboard** and **Play jins** for each transposition.           |

---

## 🎨 Integration with Maqam Network

The **JinsTranspositions** component is a critical part of the **Jins Exploration Workflow** in Maqam Network. It bridges:

- **Theoretical data** (via `Jins` model) and
- **User interactions** (via `AppContext` state).

By combining interval logic from `transpose.ts` with the UI, it helps users learn and experiment with different melodic possibilities.

---

## 🔗 Related Modules

- **`transpose.ts`**: Provides core interval and sequence generation logic.
- **`app-context.tsx`**: Manages global state, including selected cells, tuning system, and playback controls.

---

## 🎓 Example Usage

- Select a *jins* from the **Jins Manager**.
- View its **Taḥlīl**: note names, intervals, and playback options.
- Explore **Taṣwīr**: valid transpositions across the grid.
- Click **Play** to hear them, or **Select** to load into the keyboard interface.

---

This component is essential for exploring *ajnas* and their melodic variations in the Maqam Network.


# 🎵 Maqam Manager (`maqam-manager.tsx`)

The **Maqam Manager** is a central component in the Maqam Network that allows users to create, edit, explore, and manage **maqamat**—the melodic modes of Arabic music theory. It connects theoretical data with interactive features, enabling users to build and refine their understanding of *maqamat*.

---

## 🧭 Purpose

The Maqam Manager helps users:

- **Browse and select** maqamat from the current tuning system.
- **Create new maqamat** and assign them names, note structures (ascending and descending), and source references.
- **Edit maqamat**: Update names, ascending/descending note patterns, and associated references.
- **Delete maqamat** from the system.
- **Play maqamat**: Listen to the ascending and descending note sequences of a selected maqam.
- **Check available transpositions** based on the pitch grid.

It bridges the gap between theoretical models of maqamat and their practical exploration on the Maqam Network interface.

---

## 🔧 Core Functionality

- **Display Maqamat**: Lists all available maqamat, sorted alphabetically. Highlights which maqamat are compatible with the current tuning system.

- **Selection & Interaction**:
  - Select a maqam to view and edit its details.
  - Play the maqam’s ascending and descending sequences.
  - View the number of valid transpositions for each maqam.

- **Editing & Management**:
  - Create new maqamat.
  - Edit maqam names and source references.
  - Assign ascending and descending note sequences using selected cells.
  - Delete existing maqamat.

- **Playback Features**:
  - Play the full maqam sequence (both ascending and descending).
  - Load transposed sequences into the pitch grid for further exploration.

- **Integration with Sources**:
  - Add, update, and delete **source references** for each maqam, including source IDs and page numbers.

---

## 🧱 Component Structure

| Section                      | Description                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Maqamat List                 | Displays all maqamat. Highlights active ones and shows transposition counts.                 |
| Maqam Controls               | Play maqam, create new maqam, edit names, manage source references.                          |
| Editing Area                 | Update ascending/descending note sequences and manage sources.                               |
| Transposition Integration    | Uses `getMaqamTranspositions` from `transpose.ts` to display available transpositions.       |

---

## 🎨 Integration with Maqam Network

The Maqam Manager works alongside:

- **AppContext**: For global state management (maqamat list, selected maqam, cells, playback functions).
- **Maqam Model**: Encapsulates maqam data (names, notes, suyūr, sources).
- **Transpose Functions**: Calculates valid maqam transpositions.
- **Sources**: Links maqamat to external references for educational context.

This component forms the heart of maqam exploration in the Maqam Network, connecting theory with practice.

---

## 🎓 Example Workflow

1. **Select a Maqam** from the list.
2. **Play the Maqam**: Listen to its ascending and descending sequence.
3. **Edit the Maqam**: Update name, notes, and sources.
4. **Save changes** or **delete the Maqam**.
5. **Create a New Maqam** if needed.

---

## 🔗 Related Modules

- **`transpose.ts`**: Provides the `getMaqamTranspositions` function.
- **`app-context.tsx`**: Manages state, selections, and playback.
- **`Maqam` model**: Defines maqam data structures.


# 🎵 Maqam Transpositions (`maqam-transpositions.tsx`)

The **MaqamTranspositions** component is a detailed visual and interactive module within Maqam Network that analyzes and displays the ascending and descending structures of a selected maqam. It shows valid transpositions, highlights *ajnas* within the maqam, and enables playback of different sequences.

---

## 🧭 Purpose

This component allows users to:

- **View** the interval patterns and note sequences of the selected maqam.
- **Analyze** the theoretical structure, including scale degrees, note names, tuning values, and cents.
- **Discover** valid transpositions of the maqam across the pitch grid.
- **Identify** embedded *ajnas* within the maqam by pattern matching.
- **Play and explore** the ascending and descending sequences, as well as transposed versions.

It bridges theory (maqam models, *ajnas*) with interactive exploration and sound.

---

## 🔧 Core Functionality

- **Interval Analysis**:
  - Computes the interval patterns (decimalRatio or cent differences) for both ascending and descending maqam structures.
  - Uses `getIntervalPattern`, `getTranspositions`, and `mergeTranspositions` from `transpose.ts`.

- **Ajnas Detection**:
  - Matches sections of the maqam's intervals to known *ajnas* by comparing interval patterns.

- **Display**:
  - Two main sections:
    1. **Taḥlīl (Analysis)**: Shows the original maqam with note names, intervals, and identified *ajnas*.
    2. **Taṣwīr (Transpositions)**: Lists valid transpositions, each with its own details and playback buttons.

- **Playback Controls**:
  - Play ascending, descending, or full sequences using integrated buttons.

- **Selection Controls**:
  - Select and load sequences into the pitch grid for further exploration.

- **Cents Tolerance**:
  - Adjustable by the user to refine matching logic.

---

## 🧱 Component Structure

| Section                      | Description                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Taḥlīl (Analysis)            | Original maqam structure: note names, scale degrees, intervals, cents, and *ajnas*.           |
| Taṣwīr (Transpositions)      | Valid transpositions with playback and selection buttons.                                     |
| Interval Matching            | Identifies embedded *ajnas* by comparing interval patterns.                                  |
| Playback Controls            | Buttons for playing sequences.                                                              |
| Selection Integration        | Loads selected sequences into the global pitch grid via `AppContext`.                        |

---

## 🎨 Integration with Maqam Network

The **MaqamTranspositions** component relies on:

- **AppContext**: Provides access to global state, tuning system, selected maqam, and playback functions.
- **Transpose Functions (`transpose.ts`)**: Generates interval patterns and sequences.
- **Jins Model**: Matches intervals to known *ajnas*.
- **Maqam Model**: Supplies note names and theoretical structure.

This component is the **core analysis tool** for exploring maqam structures and discovering hidden melodic pathways.

---

## 🎓 Example Workflow

1. Select a maqam in the Maqam Manager.
2. View its **Taḥlīl**: note names, scale degrees, intervals, and embedded *ajnas*.
3. Explore **Taṣwīr**: transpositions of the maqam.
4. Play sequences using the provided buttons.
5. Adjust cents tolerance to refine interval matching.

---

## 🔗 Related Modules

- **`transpose.ts`**: Interval generation and pattern matching.
- **`app-context.tsx`**: Global state and playback management.
- **`Jins` model**: Provides *jins* data for matching.
- **`Maqam` model**: Supplies maqam note structures.


# 🎵 Sayr Manager (`sayr-manager.tsx`)

The **Sayr Manager** component allows users to **create**, **edit**, and **manage Sayr structures** within a selected maqam. A **Sayr** represents a sequence of musical stops or ideas (notes, jins, or directions) that illustrate a melodic path in Arabic music theory.

---

## 🧭 Purpose

The Sayr Manager helps users:

- **Create Sayr sequences**: Add steps like individual notes, jins (melodic fragments), and directions (ascending/descending).
- **Edit Sayr details**: Creator names (English and Arabic), source reference, page, and comments.
- **Manage Stops**: Add, edit, delete stops of different types.
- **Store and retrieve** multiple Sayr structures within a maqam.
- **Update maqamat** with Sayr data and persist it globally.

This component bridges theoretical Sayr concepts with practical, editable structures.

---

## 🔧 Core Functionality

- **Sayr Selection and Creation**:
  - Choose an existing Sayr or create a new one for the selected maqam.
  - Forms populate fields for creator, source, page, and comments.

- **Stops Management**:
  - Add, edit, or delete stops of three types:
    - `note`: A single note (selected from pitch classes).
    - `jins`: A melodic fragment (with optional starting note and direction).
    - `direction`: Indicates a general melodic movement (ascending/descending).

- **Persistence**:
  - Updates the selected maqam with new/edited Sayr data and saves it via `updateMaqamat`.

- **Source Integration**:
  - Link each Sayr to a source (book or document) and specify a page number.

- **Form State Management**:
  - Uses React state to manage form fields and selected Sayr.

---

## 🧱 Component Structure

| Section                      | Description                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Sayr Selection               | Dropdown to select an existing Sayr or create a new one.                                      |
| Sayr S Form            | Input fields for creator name, source, page, comments (English & Arabic).                     |
| Stops Section                | List of stops (notes, jins, directions) with editable options.                                |
| Stop Controls                | Add, edit, or delete stops.                                                                  |
| Save & Delete Buttons        | Persist or delete the Sayr.                                                                  |

---

## 🎨 Integration with Maqam Network

- **AppContext**: Provides access to selected maqam, Sayr ID, sources, and maqamat list.
- **Maqam Model**: Stores Sayr data and links it to specific maqamat.
- **updateMaqamat**: Saves updated maqamat (with Sayr changes) globally.

This component enables practical management of theoretical Sayr structures within the broader maqam exploration workflow.

---


## 🎓 Example Workflow

1. Select a maqam in the Maqam Manager.
2. Open the Sayr Manager and select an existing Sayr or create a new one.
3. Add stops: notes, jins, or direction changes.
4. Fill in creator details, source, page, and comments.
5. Save the Sayr to update the maqam data.
6. Optionally, delete a Sayr.

---

## 🔗 Related Modules

- **`Maqam` model**: Defines Sayr structures within maqamat.
- **`updateMaqamat`**: Persists changes to maqamat globally.
- **`AppContext`**: Manages state for maqamat, Sayr ID, and sources.

---

The **Sayr Manager** brings the concept of melodic paths (Sayr) to life, allowing users to explore, document, and analyze musical journeys in Arabic music theory.


# 🎛️ Settings Card (`settings-card.tsx`)

The **SettingsCard** component provides a user interface for controlling and customizing sound and playback settings within the Maqam Network. It offers users an interactive panel to adjust various parameters like tempo, volume, MIDI settings, waveform selection, and playback modes.

---

## 🧭 Purpose

The SettingsCard helps users:

- Adjust **pattern and playback settings** like tempo and selected pattern.
- Control **sound envelope parameters** (attack, decay, sustain, release, volume).
- Switch between **sound input and output modes**: tuning system, selection, waveform, or MIDI.
- Select MIDI input/output devices and refresh the device list.
- Choose waveforms for synthesized sound playback.
- Clear all pitch selections.

It acts as a **control panel** for sound behavior and integration with external hardware (MIDI).

---

## 🔧 Core Functionality

- **Panel Toggle**: Open/close the settings panel with a button (gear icon).
- **Pattern Section**:
  - Set tempo (BPM) and select a pattern from available patterns.
- **Envelope Section**:
  - Adjust ADSR (Attack, Decay, Sustain, Release) and volume using sliders.
  - Set duration (seconds) for playback.
- **Sound Input Section**:
  - Choose between "Tuning System" or "Selection" modes for sound generation.
  - Select a MIDI input device.
- **Sound Output Section**:
  - Select output mode: mute, waveform, or MIDI.
  - If waveform is selected: choose waveform type (sine, square, sawtooth, triangle).
  - If MIDI is selected: choose MIDI output device and pitch bend range.
- **Clear Selections**: Clears all current pitch selections on the grid.

---

## 🧱 Component Structure

| Section                      | Description                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Toggle Button                | Opens/closes the settings panel.                                                             |
| Pattern Controls             | Set tempo and select a pattern.                                                              |
| Envelope Controls           | Adjust volume, ADSR parameters, and duration.                                                |
| Sound Input Settings         | Choose input mode and select MIDI input device.                                              |
| Sound Output Settings        | Choose output mode (mute, waveform, MIDI) and related options.                               |
| Clear Selections             | Button to clear all pitch selections.                                                        |

---

## 🎨 Integration with Maqam Network

- **AppContext**: Provides sound settings, selected patterns, MIDI device lists, and selection control.
- **MenuContext**: Manages open/close state of the settings panel.
- **MIDI Integration**: Uses connected MIDI devices for input/output.

This component allows users to customize sound behavior for learning, playback, and experimentation.

---

## 🎓 Example Workflow

1. Open the settings panel by clicking the gear icon.
2. Adjust tempo, volume, and ADSR values.
3. Select a pattern or waveform.
4. Choose MIDI input and output devices (if applicable).
5. Use the **Clear Selections** button to reset the grid.

---

## 🔗 Related Modules

- **`AppContext`**: State for sound settings, patterns, MIDI devices, and selection control.
- **`MenuContext`**: State for UI layout (open/close states).

---

The **SettingsCard** acts as the **central control hub** for sound and playback customization in the Maqam Network.
