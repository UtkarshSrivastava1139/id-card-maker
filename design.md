# ID Card Studio — Design Specification

## 1. Purpose

This document defines the complete **UI/UX and visual design system** for ID Card Studio.

It is intended for:

* Frontend developers
* UI/UX designers
* AI coding agents
* Design-system agents
* QA agents reviewing visual implementation

This document is subordinate to the Product Requirements Document for product scope, but is the **source of truth for interface and visual decisions**.

The application must feel like a polished professional desktop productivity application rather than a student project.

---

# 2. Product Design Philosophy

ID Card Studio should communicate:

* Professional
* Reliable
* Precise
* Simple
* Fast
* Trustworthy
* Privacy-conscious
* Production-ready

The interface should make the user feel:

> “I can give this application my Excel file, photos and design, and it will take care of the rest.”

The UI must reduce cognitive load.

Do not expose technical implementation details to the normal user.

---

# 3. Design Principles

## 3.1 Simplicity over feature density

The application has a technically complex workflow, but the UI should feel simple.

Avoid:

* unnecessary controls,
* excessive configuration,
* large settings panels,
* complicated terminology.

---

## 3.2 Progressive disclosure

Only show advanced options when needed.

Example:

Basic photo matching:

```text
Match using:
[ Student ID ▼ ]

Filename:
[ {{Student ID}} ]
```

Advanced:

```text
Advanced options
────────────────────────
[x] Search subfolders
[x] Ignore filename case
[x] Trim whitespace
[x] Normalize special characters
```

Advanced settings should remain collapsed by default.

---

## 3.3 Always show the next action

Every major screen should have one obvious primary CTA.

Examples:

```text
Upload Dataset
```

then:

```text
Connect Photos
```

then:

```text
Continue to Design
```

Avoid multiple equally prominent actions.

---

## 3.4 Errors should be actionable

Never merely say:

```text
Error
```

Instead:

```text
5 photos could not be matched.

[View 5 records]
```

or:

```text
3 records have missing names.

[Review Records]
```

---

# 4. Visual Direction

The visual language should be inspired by modern professional productivity applications.

References in terms of design philosophy:

* Linear
* Notion
* Figma
* Vercel
* Stripe Dashboard
* modern desktop creative tools

Do not copy any particular product.

Use the principles:

* restrained color,
* strong typography,
* clean spacing,
* subtle borders,
* clear hierarchy,
* minimal decoration.

---

# 5. Overall Application Layout

Desktop-first.

Primary viewport target:

```text
1280 × 720
```

Ideal:

```text
1440 × 900
```

Basic structure:

```text
┌───────────────────────────────────────────────────────┐
│ Top Bar                                               │
├───────────────┬───────────────────────────────────────┤
│               │                                       │
│ Sidebar       │ Main Content                          │
│               │                                       │
│               │                                       │
│               │                                       │
│               │                                       │
└───────────────┴───────────────────────────────────────┘
```

---

# 6. Global Navigation

Sidebar:

```text
ID Card Studio

⌂ Dashboard

Projects
  All Projects
  Recent

Templates

────────────────

Settings
```

The sidebar should remain compact.

Do not create a huge navigation system for the MVP.

---

# 7. Sidebar

Recommended width:

```text
220–240px
```

Elements:

```text
Logo
Product name

Dashboard
Projects
Templates

Settings
```

Active navigation item should have a subtle highlighted background and clear text contrast.

---

# 8. Top Bar

The top bar changes according to context.

Dashboard:

```text
ID Card Studio                         + New Project
```

Project:

```text
← Projects     School ID Cards 2026      Save
```

Editor:

```text
← Project       School ID Cards 2026      Preview  Generate
```

The top bar should remain visually stable.

---

# 9. Dashboard

The dashboard should immediately communicate:

> Start a project or continue working on an existing one.

Layout:

```text
┌─────────────────────────────────────────────────────┐
│ Good afternoon                                      │
│ Create professional ID cards from your data.        │
│                                                     │
│ [ + New Project ]                                   │
└─────────────────────────────────────────────────────┘

Recent Projects

┌────────────────────┐ ┌────────────────────┐
│ School Cards 2026  │ │ Class 10 Cards     │
│ 842 records        │ │ 430 records        │
│ Updated today      │ │ Updated yesterday  │
└────────────────────┘ └────────────────────┘
```

---

# 10. Project Cards

Each project card should display:

* Project name.
* Card dimensions.
* Record count.
* Last modified.
* Small card thumbnail.
* Status.

Example:

```text
School ID Cards 2026

[Card Preview]

842 records
85.6 × 54 mm

Ready to generate

Updated today
```

---

# 11. Project Status

Use clear statuses:

```text
Draft
Needs attention
Ready
Generating
Completed
```

Avoid too many states visually.

---

# 12. New Project

The new-project screen should feel like a short wizard.

Header:

```text
Create a new project
```

Step indicator:

```text
1 Setup → 2 Dataset → 3 Photos → 4 Design → 5 Mapping → 6 Review
```

Keep the step indicator visually lightweight.

---

# 13. Setup Screen

Ask only essential information.

```text
Create Project

Project name
[ School ID Cards 2026 ]

Card size

○ Standard ID-1
  85.60 × 53.98 mm

○ Custom

Orientation

○ Landscape
○ Portrait

[ Continue ]
```

Default:

```text
ID-1
85.60 × 53.98 mm
Landscape
```

---

# 14. Dataset Upload Screen

Primary visual element:

```text
┌─────────────────────────────────────────┐
│                                         │
│          Upload your dataset            │
│                                         │
│     Drag CSV or Excel file here         │
│                                         │
│            [ Browse Files ]              │
│                                         │
│        CSV · XLSX supported              │
│                                         │
└─────────────────────────────────────────┘
```

Below:

```text
Your data stays on this device.
```

Keep privacy reassurance subtle rather than alarming.

---

# 15. Dataset Loaded State

After upload:

```text
students.xlsx

✓ File loaded

842 records
8 columns

Worksheet
[ Students ▼ ]

Primary identifier
[ Student ID ▼ ]

[ Continue ]
```

---

# 16. Dataset Preview

Use a spreadsheet-like table.

Example:

```text
┌──────────────────────────────────────────────────────────────┐
│ Search records...                                842 records │
├───────────┬────────────────┬───────┬─────────┬───────────────┤
│ Student ID│ Name           │ Class │ Section │ Father Name   │
├───────────┼────────────────┼───────┼─────────┼───────────────┤
│ J240001   │ Rahul Sharma   │ X     │ A       │ Rajesh Sharma │
│ J240002   │ Riya Singh     │ X     │ A       │ Amit Singh    │
│ J240003   │ Aman Verma     │ X     │ B       │ Sanjay Verma  │
└───────────┴────────────────┴───────┴─────────┴───────────────┘
```

The table should support horizontal scrolling.

---

# 17. Primary Key UI

The primary key selection should be visually important.

```text
Which column uniquely identifies each record?

[ Student ID ▼ ]

✓ 842 unique values
✓ No empty values
```

If invalid:

```text
⚠ 3 duplicate values found
```

CTA should remain disabled until the issue is resolved.

---

# 18. Photo Connection Screen

Header:

```text
Connect student photos
```

Description:

```text
We'll match each photo to a record using the identifier in your dataset.
```

Options:

```text
Photo source

[ Select Folder ]

or

[ Upload Photos ]

[ Upload ZIP ]
```

---

# 19. Folder Selection State

After selection:

```text
Student Photos

✓ Folder connected

1,024 image files found

[ Configure Matching ]
```

---

# 20. Photo Matching UI

Primary controls:

```text
Match photos using

[ Student ID ▼ ]

Filename pattern

[ {{student_id}} ]

Supported extensions

☑ JPG
☑ JPEG
☑ PNG
☑ WebP
```

Advanced:

```text
⌄ Advanced matching options
```

---

# 21. Photo Matching Results

Use a prominent summary.

```text
Photo matching

        842
      records

       837
     matched

         5
      missing
```

Then:

```text
✓ 837 photos matched
⚠ 5 photos need attention
```

Primary CTA:

```text
[ Review Missing Photos ]
```

Secondary:

```text
[ Continue ]
```

---

# 22. Missing Photo List

Example:

```text
Missing photos

5 records could not be matched.

┌─────────────────────────────────────────────┐
│ Student ID     Name             Action      │
├─────────────────────────────────────────────┤
│ J240212031     Amit Kumar       [Select]    │
│ J240212074     Neha Sharma      [Select]    │
│ J240212119     Rohan Singh      [Select]    │
└─────────────────────────────────────────────┘
```

---

# 23. Design Screen

The design screen is the core editor.

It must remain deliberately simple.

Layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ Toolbar                                                     │
├─────────────┬───────────────────────────────┬───────────────┤
│ Elements    │                               │ Properties    │
│             │                               │               │
│ Text        │        ID CARD                │ Position      │
│ Photo       │        CANVAS                 │ Size          │
│ QR Code     │                               │ Typography    │
│ Image       │                               │ Mapping       │
│             │                               │               │
└─────────────┴───────────────────────────────┴───────────────┘
```

---

# 24. Design Canvas

The card must visually resemble a physical ID card.

For example:

```text
          85.60 mm
    ┌─────────────────────┐
    │                     │
    │      SCHOOL         │
    │                     │
    │    ┌──────────┐     │
    │    │          │     │
    │    │  PHOTO   │     │
    │    │          │     │
    │    └──────────┘     │
    │                     │
    │    Rahul Sharma     │
    │    Class X - A      │
    │                     │
    └─────────────────────┘
          53.98 mm
```

Show subtle measurement/grid information when useful.

---

# 25. Canvas Background

The uploaded PNG/JPEG design should appear as the base layer.

It should be visually distinct from dynamic elements.

Dynamic elements should have selection outlines when selected.

---

# 26. Canvas Toolbar

Toolbar should contain only relevant actions:

```text
Select
Add Text
Add Photo
Add QR
Add Image

────────

Undo
Redo

────────

Zoom
Grid
```

Do not create a large Photoshop-like toolbar.

---

# 27. Add Text

Clicking:

```text
+ Text
```

creates a text element.

Initial state:

```text
Text
```

The properties panel then allows:

```text
Content
[ Select field ▼ ]

Font
[ Inter ▼ ]

Size
[ 10 ]

Weight
[ 600 ]

Align
[ Left ▼ ]

Auto-fit
[x]
```

---

# 28. Dynamic Text Indicator

Dynamic fields should visibly indicate that they are data-driven.

Example:

```text
┌────────────────────────────┐
│ {{ Student Name }}         │
└────────────────────────────┘
```

Use a subtle badge:

```text
DATA
```

or a small database/link icon.

Static text should look different from dynamic fields.

---

# 29. Add Photo

Clicking:

```text
+ Photo
```

creates:

```text
[ PHOTO ]
```

Properties:

```text
Photo source
[ Student ID ▼ ]

Fit
[ Cover ▼ ]

Border radius
[ 0 mm ]

Border
[ None ▼ ]
```

---

# 30. Photo Placeholder Visualization

Before mapping:

```text
┌──────────────┐
│              │
│   PHOTO      │
│              │
└──────────────┘
```

After mapping and selecting a sample record, display the actual student's photo.

This dramatically improves user confidence.

---

# 31. Add QR Code

Properties:

```text
QR Content

○ Student ID
○ Custom text
○ URL

Value:
[ {{student_id}} ]
```

Preview should immediately render the QR code.

---

# 32. Properties Panel

The right properties panel changes based on selection.

If nothing is selected:

```text
Select an element
to edit its properties.
```

If text is selected:

```text
Text

Data
[ Name ▼ ]

Position
X [ 32.0 ]
Y [ 15.0 ]

Size
W [ 45.0 ]
H [ 6.0 ]

Typography
Font [ Inter ]
Size [ 10 ]
Weight [ 600 ]

Alignment
[ Left ]

Auto-fit
☑
```

---

# 33. Numeric Inputs

Physical dimensions should be explicitly labeled:

```text
X
32.0 mm

Y
15.0 mm

Width
45.0 mm

Height
6.0 mm
```

Do not hide units.

---

# 34. Precision

Allow fine adjustments.

Example:

```text
0.1 mm
```

increment for keyboard/property adjustments.

Arrow keys may move elements by:

```text
0.1 mm
```

Shift + Arrow:

```text
1 mm
```

---

# 35. Alignment Guides

When moving elements:

Show subtle guides for:

* Card center.
* Card edges.
* Alignment with other elements.

Example:

```text
             │
             │
─────────────┼─────────────
             │
```

Guides should not visually overwhelm the card.

---

# 36. Layers

A compact layer panel can appear beneath the properties panel or as a separate toggle.

Example:

```text
Layers

☰ Background
☰ School Logo
☰ Photo
☰ Student Name
☰ Student ID
☰ QR Code
```

Allow:

* Hide.
* Lock.
* Reorder.

---

# 37. Selection

Selected element:

* thin visible outline,
* resize handles,
* no heavy neon borders,
* no excessive shadows.

The design itself must remain visible.

---

# 38. Zoom

Bottom-right:

```text
−   100%   +
```

Options:

```text
50%
75%
100%
150%
200%
Fit
```

---

# 39. Grid

Grid toggle:

```text
Grid
```

When enabled:

```text
1 mm
```

Default grid should be subtle.

---

# 40. Safe Area

Provide an optional:

```text
Safe Area
```

overlay.

It should show a subtle inset boundary.

Do not make it part of the exported card.

---

# 41. Design Save State

Top-right should communicate save status.

Examples:

```text
Saved
```

or:

```text
Saving...
```

or:

```text
Unsaved changes
```

Avoid intrusive notifications.

---

# 42. Preview Screen

The Preview screen is not the editor.

It should feel like a proofing/quality-control interface.

Header:

```text
Preview

842 cards
```

Controls:

```text
Search Student ID...
[ All ▼ ]

← Previous
1 / 842
Next →
```

---

# 43. Preview Layout

Center the card.

```text
┌───────────────────────────┐
│                           │
│        ID CARD            │
│                           │
│                           │
└───────────────────────────┘

J240212001
Rahul Sharma
```

The card should be large enough to inspect.

---

# 44. Preview Record Selector

Provide:

```text
Search by Student ID or Name
```

and:

```text
Previous
Next
Random
```

Optional:

```text
Show issues only
```

---

# 45. Validation Screen

Use a quality-control dashboard.

Example:

```text
Ready for generation

✓ Dataset
842 records

✓ Primary key
842 unique

✓ Photos
842 matched

✓ Mapping
5 fields configured

⚠ Text
2 records need attention

────────────────────────────

[ Review Issues ]
[ Generate Cards ]
```

---

# 46. Validation Severity

Three levels:

### Error

Blocks generation.

```text
✕ Duplicate primary key
```

### Warning

Does not necessarily block generation.

```text
⚠ Long text
```

### Information

```text
ⓘ 4 records contain unused fields
```

---

# 47. Issue Detail

Clicking an issue should show affected records.

Example:

```text
Text overflow

2 records

J240212031 — Mohammad Abdul Rahman Siddiqui
J240212119 — Abhishek Kumar Singh

[ Edit Text Settings ]
```

---

# 48. Generation Screen

The generation screen should be extremely clear.

Before generation:

```text
Generate ID Cards

842 valid records

Output

☑ PNG
☑ JPEG
☑ PDF

Individual files
☑

Combined PDF
☑

[ Generate ]
```

---

# 49. Generation Progress

During generation:

```text
Generating ID cards

██████████████████░░ 90%

756 / 842

Processed
756

Remaining
86
```

Do not freeze the application.

---

# 50. Generation Completion

Show:

```text
Generation complete

✓ 842 cards generated

PNG
842 files

JPEG
842 files

PDF
1 combined file

[ Download All ]
[ Create Print Sheet ]
```

---

# 51. Print Screen

The print interface should feel like a production tool.

Header:

```text
Create print sheet
```

Settings:

```text
Paper
[ A4 ▼ ]

Orientation
[ Portrait ▼ ]

Margins
Top      [ 10 mm ]
Bottom   [ 10 mm ]
Left     [ 10 mm ]
Right    [ 10 mm ]

Spacing
Horizontal [ 5 mm ]
Vertical   [ 5 mm ]

☑ Crop marks
☐ Bleed
```

---

# 52. Automatic Layout

Show calculated result:

```text
Cards per sheet

2 columns × 5 rows

10 cards / sheet

84 sheets total
```

If the user changes settings, update immediately.

---

# 53. Print Preview

Use a miniature but accurate paper representation.

```text
┌───────────────────────────────┐
│                               │
│  ┌───────┐   ┌───────┐       │
│  │       │   │       │       │
│  │ CARD  │   │ CARD  │       │
│  └───────┘   └───────┘       │
│                               │
│  ┌───────┐   ┌───────┐       │
│  │ CARD  │   │ CARD  │       │
│  └───────┘   └───────┘       │
│                               │
└───────────────────────────────┘
```

The preview must reflect actual dimensions.

---

# 54. Crop Marks

Crop marks should be subtle and professional.

Do not place them inside the card artwork.

They must not overlap important content.

---

# 55. Print Completion

Show:

```text
Your print-ready PDF is ready.

A4
10 cards per sheet
84 sheets
Actual card size:
85.60 × 53.98 mm

When printing, select:
100% / Actual Size

[ Download PDF ]
```

---

# 56. Empty States

Every screen must have a useful empty state.

Example:

```text
No dataset yet

Upload a CSV or Excel file to start.

[ Upload Dataset ]
```

Another:

```text
No photos connected

Connect a folder or upload your photos.

[ Connect Photos ]
```

---

# 57. Loading States

Prefer skeletons for tables and content.

For operations such as:

* importing,
* scanning,
* generating,

use meaningful progress indicators.

Avoid generic:

```text
Loading...
```

when actual progress can be measured.

---

# 58. Toast Notifications

Use toasts only for lightweight events:

```text
Project saved
```

```text
Template duplicated
```

```text
Export complete
```

Do not use toasts for critical errors.

Critical errors should appear in context.

---

# 59. Dialogs

Dialogs should be used for:

* Confirm delete.
* Replace design.
* Disconnect photo source.
* Export settings where appropriate.

Do not use dialogs for the main workflow.

---

# 60. Confirmation Dialog

Example:

```text
Delete project?

This cannot be undone.

[Cancel]   [Delete]
```

Destructive actions should be visually distinct but restrained.

---

# 61. Typography

Use a modern sans-serif font.

Recommended primary:

```text
Inter
```

Fallback:

```text
system-ui
```

Hierarchy:

```text
Page title
24–32px

Section heading
18–20px

Body
14–16px

Secondary text
12–14px

Small metadata
11–12px
```

Do not use oversized marketing typography.

---

# 62. Spacing System

Use a consistent spacing scale.

Recommended:

```text
4
8
12
16
20
24
32
40
48
64
```

Most UI spacing should fall within this system.

---

# 63. Border Radius

Use restrained rounding.

Suggested:

```text
Small controls: 6px
Cards: 8–12px
Dialogs: 12px
Large upload areas: 12–16px
```

Avoid excessive pill-shaped UI.

---

# 64. Borders

Use subtle neutral borders.

Borders should establish hierarchy rather than decoration.

Avoid heavy outlines around every component.

---

# 65. Shadows

Use very subtle shadows.

Prefer:

* elevation through spacing,
* borders,
* background contrast.

Avoid dramatic shadows.

---

# 66. Color System

Use a neutral foundation.

Primary accent should be used for:

* primary CTA,
* active navigation,
* selected states,
* progress,
* focus.

Semantic colors:

```text
Success
Warning
Error
Info
```

Do not use semantic colors excessively.

A successful project should not look like a green dashboard.

---

# 67. Dark Mode

Dark mode is not required for the initial MVP.

However, avoid architectural choices that make dark mode impossible later.

Do not hard-code colors throughout components.

Use semantic design tokens.

---

# 68. Design Tokens

Create centralized tokens for:

```text
background
surface
surface-elevated
border
text-primary
text-secondary
text-muted
accent
success
warning
error
focus
```

Spacing and typography should also be tokenized.

---

# 69. Buttons

Primary:

```text
[ Generate Cards ]
```

Secondary:

```text
[ Preview ]
```

Tertiary:

```text
[ Cancel ]
```

Destructive:

```text
[ Delete Project ]
```

Do not make every button look equally important.

---

# 70. Button States

Every button should support:

```text
Default
Hover
Active
Focus
Disabled
Loading
```

Example:

```text
[ Generating... ]
```

rather than allowing duplicate clicks.

---

# 71. Forms

Labels should always be visible.

Avoid placeholder-only labels.

Good:

```text
Filename pattern

[ {{student_id}} ]
```

Bad:

```text
[ Enter pattern... ]
```

with no visible label.

---

# 72. File Upload UX

Support drag and drop.

When dragging:

```text
┌─────────────────────────────┐
│                             │
│ Drop your file here         │
│                             │
└─────────────────────────────┘
```

The drop target should visibly activate.

---

# 73. Accessibility

All interactive controls must have:

* keyboard focus,
* visible focus,
* accessible name,
* sufficient contrast.

Important canvas functionality must also have property-panel alternatives.

Users should not be forced to use mouse dragging for precision.

---

# 74. Keyboard Shortcuts

Show shortcuts where useful.

Example:

```text
Undo        Ctrl + Z
Redo        Ctrl + Shift + Z
Save        Ctrl + S
Delete      Delete
Duplicate   Ctrl + D
```

Do not show every shortcut everywhere.

---

# 75. Responsive Behavior

The MVP is desktop-first.

At narrower widths:

```text
1280px
```

editor remains fully functional.

At approximately:

```text
1024px
```

reduce sidebar and properties panel width.

Below approximately:

```text
900px
```

show a clear message:

> ID Card Studio is optimized for desktop screens for precise card design and printing.

Do not attempt to squeeze the full editor into a phone layout.

---

# 76. Mobile

Mobile is not a primary editing environment.

If accessed on mobile, provide:

* project list,
* basic preview,
* status,
* generated-output access.

The application should not attempt to replicate the full editor.

---

# 77. Microinteractions

Use subtle animation for:

* panel transitions,
* progress,
* dropdowns,
* drag states,
* success states.

Animation should be:

* quick,
* functional,
* unobtrusive.

Avoid decorative animation.

---

# 78. Editor Interaction Quality

The editor should feel responsive.

When dragging:

* no visible lag,
* no unnecessary re-rendering,
* accurate snapping,
* smooth movement.

When resizing:

* preserve aspect ratio for photos when locked,
* update physical dimensions immediately.

---

# 79. Data Table Interaction

Dataset table should support:

* sorting,
* search,
* horizontal scroll,
* selected row,
* row issue indicators.

Example:

```text
⚠ J240212031
```

A warning icon should allow the user to inspect the issue.

---

# 80. Photo Grid

The photo validation screen may optionally show thumbnails.

Example:

```text
┌──────┐ ┌──────┐ ┌──────┐
│ photo│ │ photo│ │  ⚠   │
│  ✓   │ │  ✓   │ │missing│
└──────┘ └──────┘ └──────┘
```

Use thumbnails, not full-resolution images.

---

# 81. Trust Indicators

The application can subtly communicate privacy:

```text
Local processing
```

or:

```text
Your files stay on this device.
```

This should not dominate the UI.

---

# 82. First-Time Experience

When there are no projects:

```text
Create your first ID-card project

Turn a spreadsheet, photo folder and existing design
into print-ready ID cards.

[ + New Project ]
```

Optional visual:

A simple example card.

Do not use a complicated onboarding carousel.

---

# 83. Project Progress

Inside a project, display a compact progress indicator:

```text
✓ Dataset
✓ Photos
✓ Design
✓ Mapping
⚠ Validation
○ Generate
○ Print
```

This helps users understand what remains.

---

# 84. Unsaved Changes

If the project has unsaved changes:

```text
Unsaved changes
```

Do not interrupt the user repeatedly.

Use autosave where practical.

---

# 85. Error Page

If an unexpected application error occurs:

```text
Something went wrong.

Your project data has not been deleted.

[ Try Again ]

If the problem continues:
[ Export Diagnostic Information ]
```

Do not expose stack traces to normal users.

---

# 86. Design Quality Checklist

Every screen must be checked for:

```text
□ Clear page title
□ Clear primary action
□ Correct hierarchy
□ Consistent spacing
□ Consistent typography
□ Empty state
□ Loading state
□ Error state
□ Success state
□ Keyboard accessibility
□ Responsive behavior
□ No unnecessary decoration
```

---

# 87. Editor Quality Checklist

```text
□ Card has correct physical aspect ratio
□ Background is clearly visible
□ Elements can be selected
□ Elements can be moved
□ Elements can be resized
□ Physical dimensions are visible
□ Dynamic fields are distinguishable
□ Real sample data can be previewed
□ Photo placeholder works
□ QR placeholder works
□ Undo works
□ Redo works
□ Save state is visible
```

---

# 88. Print UI Quality Checklist

```text
□ Paper size visible
□ Card size visible
□ Margins visible
□ Spacing visible
□ Card count calculated
□ Print preview available
□ Crop marks configurable
□ Output dimensions preserved
□ 100% printing instruction visible
```

---

# 89. Do Not Do These Things

The UI must NOT become:

```text
❌ Canva clone
❌ Photoshop clone
❌ Complex enterprise dashboard
❌ Overly colorful school-management UI
❌ Mobile-first interface
❌ Wizard with 20+ steps
❌ Configuration-heavy developer tool
```

The product is a focused production utility.

---

# 90. AI Agent Design Rules

Any AI agent implementing the frontend must:

1. Read this file before changing UI.
2. Follow the existing design tokens.
3. Reuse existing components.
4. Avoid creating duplicate components.
5. Avoid arbitrary colors.
6. Avoid arbitrary spacing.
7. Avoid arbitrary font sizes.
8. Preserve existing responsive behavior.
9. Preserve accessibility.
10. Never redesign unrelated screens.
11. Never introduce a new design language without approval.
12. Never add features outside its assigned task.
13. Never replace the entire UI because of a small requirement.
14. Test the actual interaction after implementation.

---

# 91. Agent Visual Boundary

If an agent is assigned to:

```text
Design Editor
```

it may modify:

* editor layout,
* canvas,
* toolbar,
* properties panel,
* element controls.

It must not modify:

* dataset parsing,
* photo matching algorithms,
* PDF generation,
* project persistence.

If an agent is assigned to:

```text
Dataset UI
```

it may modify:

* upload screen,
* dataset table,
* primary-key UI,
* validation display.

It must not redesign:

* template editor,
* printing system,
* application navigation.

---

# 92. No Visual Regression

Before completing a UI task, the agent should verify:

```text
Existing screen
        ↓
Implement change
        ↓
Check surrounding screens
        ↓
Ensure no layout regression
```

Do not optimize one screen at the expense of the rest of the application.

---

# 93. Component Philosophy

Prefer:

```text
Button
Input
Select
Card
Dialog
Badge
Tabs
Progress
Table
Tooltip
Dropdown
```

as reusable primitives.

Then compose:

```text
DatasetUploader
PhotoMatcher
TemplateEditor
ValidationSummary
PrintPreview
```

from those primitives.

Do not create one-off styling repeatedly.

---

# 94. Design System Architecture

Recommended:

```text
src/
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── features/
│   ├── dashboard/
│   ├── dataset/
│   ├── photos/
│   ├── design/
│   ├── validation/
│   ├── preview/
│   ├── generation/
│   └── printing/
│
└── styles/
    ├── tokens
    └── globals
```

---

# 95. Important Principle: Visual Accuracy

The editor must communicate physical reality.

The card shown in the application is not merely an abstract rectangle.

It represents:

```text
85.60 mm × 53.98 mm
```

The user should be able to trust that:

```text
What I see
≈
What I print
```

This principle should influence every design decision.

---

# 96. Important Principle: Real Data Early

Whenever possible, show actual imported records in the UI.

For example, after mapping:

```text
Rahul Sharma
J240212001
Class X-A
```

is much more useful than:

```text
{{name}}
{{student_id}}
{{class}}
```

The application should transition from configuration to real-data preview as early as possible.

---

# 97. Recommended Primary User Journey

The ideal visual journey is:

```text
Dashboard
   ↓
New Project
   ↓
Setup
   ↓
Upload Dataset
   ↓
Connect Photos
   ↓
Upload Design
   ↓
Add Fields
   ↓
Map Fields
   ↓
Validate
   ↓
Preview
   ↓
Generate
   ↓
Print
```

The user should always know:

```text
Where am I?
What have I completed?
What should I do next?
```

---

# 98. Final Design Goal

The application should feel like:

> **A professional print-production tool simplified for school administrators.**

Not:

> A complicated developer tool.

Not:

> A graphic-design application.

Not:

> A generic CRUD dashboard.

The interface should hide technical complexity while exposing exactly the controls required to produce accurate ID cards.

---

# 99. Final Visual Quality Bar

Before considering the frontend complete, ask:

### At first glance

Can a user understand what the application does within 5 seconds?

### During setup

Can a non-technical user understand what file to upload?

### During mapping

Can they clearly understand which dataset field is connected to which card element?

### During preview

Can they confidently verify a real student's card?

### During generation

Can they see exactly how many cards have been processed?

### During printing

Can they understand the physical output dimensions and paper layout?

If any answer is “no”, the UI is not finished.

---

# 100. Final Design Principle

The entire design system should optimize for one outcome:

```text
DATA
+
PHOTOS
+
DESIGN
        ↓
SIMPLE CONFIGURATION
        ↓
CLEAR VALIDATION
        ↓
CONFIDENT PREVIEW
        ↓
RELIABLE GENERATION
        ↓
ACCURATE PRINT
```

Every visual element that does not help this flow should be questioned.
