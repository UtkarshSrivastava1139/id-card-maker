# MASTER DEVELOPMENT PROMPT

## School ID Card Generator — Local-First Web Application

You are the **Lead Software Architect and Senior Full-Stack Engineer** responsible for building a production-quality web application for bulk school ID-card generation.

Your responsibility is to design and implement the application according to the product requirements and architectural constraints below.

You must treat this document as the **source of truth for scope, architecture, priorities, and agent boundaries**.

Do not expand the scope without explicit instruction.

---

# 1. PRODUCT

Build a web application that allows a school/operator to generate personalized student ID cards in bulk from:

1. A PNG/JPEG ID-card design.
2. A CSV/XLSX dataset.
3. A local folder containing student photographs.
4. A configurable mapping between dataset fields and card placeholders.

The final output must be:

* Individual PNG files.
* Individual JPEG files.
* PDF.
* Printable multi-card PDF for paper such as A4.

The application must prioritize:

* Accuracy.
* Print quality.
* Ease of use.
* Local processing.
* Privacy.
* Reliability.
* Deterministic output.
* Clean architecture.

---

# 2. MVP SCOPE

The MVP is intentionally limited.

The MVP MUST support:

### Design

* PNG design upload.
* JPEG/JPG design upload.
* Fixed background design.
* Dynamic text placeholders.
* Dynamic image/photo placeholder.
* Optional QR code.
* Basic positioning.
* Basic sizing.
* Basic typography.
* Preview.

### Dataset

* CSV.
* XLSX.
* Worksheet selection.
* Header detection.
* Dataset preview.
* Primary-key selection.
* Duplicate detection.
* Empty primary-key detection.
* Basic validation.

### Photos

* Local folder selection where browser capabilities allow it.
* Multiple-file photo upload fallback.
* ZIP upload fallback.
* JPG/JPEG.
* PNG.
* WebP if practical.
* Configurable filename matching.
* Recursive folder scanning where supported.
* Missing-photo detection.
* Manual photo override.

### Generation

* Single-record preview.
* Batch generation.
* PNG.
* JPEG.
* PDF.
* Combined PDF.
* Individual output files.
* ZIP packaging.

### Printing

* A4.
* Common paper sizes should be architecturally supported.
* User must select paper size.
* Margins.
* Spacing.
* Orientation.
* Number of cards per sheet calculated automatically.
* Crop marks.
* 100%/Actual Size print instructions.

---

# 3. EXPLICITLY OUT OF SCOPE FOR MVP

DO NOT implement the following unless explicitly instructed later:

* Full Canva-like editor.
* Freeform professional graphic design system.
* Photoshop import.
* CorelDRAW import.
* Canva import.
* PSD parser.
* CDR parser.
* Cloud photo storage.
* Mandatory user accounts.
* Authentication.
* Payment system.
* Subscription system.
* Template marketplace.
* Multi-user collaboration.
* AI-generated card designs.
* OCR.
* Face recognition.
* Automatic face detection.
* Automatic background removal.
* Student-management system.
* School ERP.
* Attendance system.
* Student verification system.
* Native Windows application.
* Mobile application.
* Backend rendering service unless technically required.
* Complex CMS.
* Social features.

The architecture should allow future expansion, but these features must NOT be built as part of the MVP.

---

# 4. MOST IMPORTANT PRODUCT DECISION

This is NOT a full ID-card design application.

The MVP is a:

> **Template overlay + data merge + photo matching + bulk rendering + print production system.**

The user uploads a finished visual design as PNG/JPEG.

That image becomes the background.

The application allows dynamic content to be placed on top.

Example:

```text
Uploaded Design
      ↓
Fixed Background
      ↓
Dynamic Text/Image Layers
      ↓
Dataset Mapping
      ↓
Student Record
      ↓
Rendered Card
```

Do not build unnecessary design-tool functionality.

---

# 5. TARGET CARD SIZE

The primary card format is:

```text
Width:  85.60 mm
Height: 53.98 mm
```

This corresponds to the standard ID-1 card format.

The user may refer to it as approximately:

```text
85.6 × 54 mm
```

The application must internally use **physical units**, preferably millimeters.

Do NOT make pixels the canonical coordinate system.

---

# 6. COORDINATE SYSTEM

All template positions and dimensions must be represented in millimeters.

Example:

```json
{
  "x": 20.5,
  "y": 15.2,
  "width": 40,
  "height": 10
}
```

The rendering layer can convert millimeters into:

* Screen pixels.
* Raster pixels.
* PDF points.

But the template itself must remain resolution-independent.

---

# 7. PRIMARY WORKFLOW

The main user workflow must be:

```text
Create Project
        ↓
Choose Card Size
        ↓
Upload Design
        ↓
Import Dataset
        ↓
Select Primary Key
        ↓
Connect Photos
        ↓
Configure Photo Matching
        ↓
Create Dynamic Fields
        ↓
Map Fields
        ↓
Validate
        ↓
Preview
        ↓
Generate
        ↓
Export
        ↓
Print
```

The user must be able to return to previous stages without restarting the project.

---

# 8. PROJECT MODEL

Everything must belong to a project.

Example:

```text
School ID Cards 2026
```

A project contains:

```text
Project
├── Card Configuration
├── Design
├── Dataset
├── Photo Configuration
├── Field Mapping
├── Template Elements
├── Validation State
├── Generation Settings
└── Export Settings
```

---

# 9. FRONT SIDE ONLY FOR MVP

MVP supports one card side.

The architecture should be designed so that a future version can add:

```text
Front
Back
```

without rewriting the rendering engine.

Do NOT implement the back side now.

---

# 10. DESIGN IMPORT

The user uploads:

```text
PNG
JPG
JPEG
```

The uploaded design becomes the fixed card background.

The system should automatically fit it to the selected card dimensions while warning the user if the aspect ratio differs.

Example warning:

> The uploaded design has a different aspect ratio from the selected card size. It may be cropped or stretched.

Allow the user to choose:

```text
Contain
Cover
Stretch
```

Default:

```text
Cover
```

However, do not distort the design silently.

---

# 11. TEMPLATE ELEMENTS

MVP only needs a small set of elements.

## Text

Properties:

* Dataset field.
* X.
* Y.
* Width.
* Height.
* Font family.
* Font size.
* Weight.
* Alignment.
* Color.
* Line height.
* Auto-fit.
* Maximum lines.

## Image

Properties:

* Dataset photo field.
* X.
* Y.
* Width.
* Height.
* Crop mode.
* Border.
* Border radius.
* Object position.

## QR Code

Properties:

* Content expression.
* X.
* Y.
* Width.
* Height.

## Optional static image

Useful for logos/signatures/seals.

Do not implement arbitrary drawing tools.

---

# 12. TEMPLATE PLACEHOLDERS

The system must support fields such as:

```text
{{student_name}}
{{student_id}}
{{class}}
{{section}}
{{father_name}}
```

The actual internal representation should preferably reference a field ID rather than repeatedly parsing strings.

Example:

```json
{
  "type": "text",
  "field": "student_name"
}
```

The placeholder syntax is primarily a user-facing concept.

---

# 13. FIELD MAPPING

After importing the dataset, the user should be able to map:

```text
Template Field → Dataset Column
```

Example:

```text
Student Name → Name
Student ID   → Student ID
Class        → Class
Section      → Section
```

The mapping must be explicit and editable.

---

# 14. AUTOMATIC FIELD SUGGESTION

The application may suggest mappings.

For example:

```text
{{student_name}}
```

could suggest:

```text
Name
Student Name
Full Name
Student_Name
```

But the system must never silently accept an ambiguous mapping.

User confirmation is required.

---

# 15. DATASET IMPORT

Use a reliable client-side spreadsheet parser.

Preferred:

* SheetJS or equivalent.

The dataset import must:

1. Read the file.
2. Detect workbook/sheet.
3. Allow worksheet selection.
4. Detect headers.
5. Preview records.
6. Identify fields.
7. Allow primary-key selection.

---

# 16. PRIMARY KEY

The user must explicitly identify the unique record field.

Examples:

```text
Student ID
Admission Number
Document ID
Roll Number
```

The application must validate:

```text
No empty primary keys.
No duplicate primary keys.
```

If duplicates exist, generation should be blocked until resolved or explicitly handled by the user.

---

# 17. PHOTO MATCHING

This is one of the highest-priority features.

Do not assume photos always follow exactly one naming convention.

The application must provide configurable matching.

Supported default behavior:

```text
Student ID
      ↓
filename
```

Examples:

```text
J240212021.jpg
J240212021.jpeg
J240212021.png
```

should all be candidates for:

```text
Student ID = J240212021
```

---

# 18. PHOTO MATCHING OPTIONS

The user should be able to configure:

### Match field

```text
Student ID
Document ID
Admission Number
Roll Number
Custom column
```

### Filename pattern

Default:

```text
{{student_id}}
```

Examples:

```text
{{student_id}}
{{student_id}}.jpg
student_{{student_id}}
photo_{{student_id}}
{{student_id}}_photo
```

The extension should normally be handled separately.

---

# 19. SUPPORTED PHOTO EXTENSIONS

At minimum:

```text
.jpg
.jpeg
.png
```

Preferably:

```text
.webp
```

as well.

---

# 20. PHOTO SOURCE MODES

Provide:

### Mode 1 — Select Folder

Use the browser's supported directory/file APIs.

### Mode 2 — Upload Files

Allow multiple photos to be selected.

### Mode 3 — Upload ZIP

Allow the user to upload a ZIP containing photos.

This is particularly important for browsers that cannot provide the required directory access.

---

# 21. LOCAL FILE PRIVACY

The default architecture must process photos locally.

Do not upload student photographs to a backend for normal MVP operation.

Do not send photos to:

* AI APIs.
* OCR APIs.
* Image-processing SaaS.
* Analytics services.
* Third-party storage.

The application must be usable without uploading student photographs to a server.

---

# 22. PHOTO INDEX

After connecting the photo source, build an index.

Conceptually:

```text
photoIndex = {
  "J240212001": File,
  "J240212002": File,
  "J240212003": File
}
```

Do not repeatedly scan the entire directory for every student.

Scan once, index once, then perform fast lookups.

---

# 23. PHOTO VALIDATION

Show:

```text
Total records: 842
Photos matched: 837
Missing photos: 5
Duplicate candidates: 0
Unsupported files: 0
```

The user should be able to inspect every missing record.

---

# 24. MANUAL PHOTO OVERRIDE

If automatic matching fails, allow:

```text
Student: J240212021

Photo:
[ Select Photo ]
```

The manual override should be stored in project state.

It must take precedence over automatic matching.

---

# 25. DATASET VALIDATION

Before generation:

```text
✓ Dataset loaded
✓ Primary key selected
✓ No duplicate IDs
✓ No empty IDs
✓ Required fields mapped
✓ Photos connected
✓ Photo matching complete
✓ Template valid
```

If a problem exists:

```text
⚠ 7 issues found
```

The user can inspect them.

---

# 26. MISSING DATA BEHAVIOR

Do not silently generate incomplete cards.

Example:

```text
Missing:
Student Name
```

should result in:

```text
⚠ Missing required field: Name
```

The system should provide configurable behavior:

```text
Block generation
Generate with warning
```

Default:

```text
Block generation for invalid records
```

---

# 27. TEXT OVERFLOW

Long student names are expected.

The application must detect text overflow.

Example:

```text
Mohammad Abdul Rahman Siddiqui
```

If it doesn't fit:

```text
⚠ Text overflow
```

Support:

```text
Auto-fit
Wrap
Clip
```

Default:

```text
Auto-fit
```

with configurable minimum font size.

---

# 28. PREVIEW

The user should be able to preview:

### One record

```text
Student #1
```

### Random sample

```text
5 sample records
```

### Specific record

Search by primary key.

### Problem records

Show only records with validation errors.

---

# 29. PREVIEW MUST USE REAL DATA

Do not only show:

```text
{{student_name}}
```

once data has been imported.

The preview must render actual:

```text
Rahul Sharma
J240212001
Class X-A
```

and the corresponding photo.

---

# 30. RENDERING ARCHITECTURE

This is a critical architectural requirement.

Do NOT make the editor itself responsible for final output.

Use a canonical render model:

```text
Template
+
Record
+
Mappings
+
Assets
        ↓
Canonical Render Model
        ↓
┌──────────────┬───────────────┐
│              │               │
Preview       Raster          PDF
Renderer      Renderer        Renderer
```

The same render model must drive all outputs.

---

# 31. NO SCREENSHOT-BASED PDF

Do not implement:

```text
Canvas screenshot → PDF
```

as the primary production method.

This can reduce print quality and create scaling problems.

The production renderer must generate an appropriately sized document.

Where possible:

* Keep text vector-based.
* Keep QR codes vector-based.
* Keep shapes vector-based.
* Embed raster photos at appropriate resolution.

---

# 32. OUTPUT

MVP must support:

## Individual PNG

```text
J240212001.png
```

## Individual JPEG

```text
J240212001.jpg
```

## Individual PDF

```text
J240212001.pdf
```

## Combined PDF

```text
All_ID_Cards.pdf
```

## ZIP

```text
ID_Cards.zip
```

containing individual outputs.

---

# 33. OUTPUT NAMING

Default:

```text
{{primary_key}}
```

Allow future customization.

For MVP, at minimum support primary-key-based filenames.

Sanitize filenames.

---

# 34. BATCH SIZE

The initial practical generation target is:

```text
100 cards
200 cards
500 cards
```

The system should also be capable of handling projects containing:

```text
500–1,000+ records
```

without assuming that all cards must be rendered simultaneously.

Generation should be chunked/progressive.

Do NOT load every full-resolution image into memory simultaneously.

---

# 35. PERFORMANCE

Use:

* Web Workers where appropriate.
* Lazy image decoding.
* Thumbnail previews.
* Progressive batch processing.
* Chunked generation.
* Virtualized dataset table.
* Memory-conscious image handling.

The UI must remain responsive during generation.

---

# 36. GENERATION UI

Show:

```text
Generating ID Cards

████████████████░░░░

327 / 500

Current:
J240212327
```

Also show:

```text
Successful: 326
Failed: 1
```

If a record fails, do not lose the entire batch.

Report the failed record and continue where safe.

---

# 37. PAPER SIZE

The user must choose paper size before print generation.

Primary default:

```text
A4
```

But the system should architecturally support:

```text
A4
A3
Letter
Custom
```

Do not hard-code A4 throughout the application.

---

# 38. PAPER CONFIGURATION

Allow:

```text
Paper size
Orientation
Margins
Horizontal gap
Vertical gap
Crop marks
Bleed
```

The system calculates how many cards fit.

Do not hard-code:

```text
A4 = exactly 10 cards
```

Calculate based on:

```text
paper dimensions
card dimensions
margins
spacing
orientation
```

---

# 39. CARD PLACEMENT

The print engine should calculate:

```text
columns
rows
unused space
```

and provide a preview.

Example:

```text
A4
2 columns
5 rows
10 cards
```

if that configuration physically fits.

---

# 40. PRINT PREVIEW

Show an actual paper preview:

```text
┌──────────────────────────────┐
│ ┌──────┐  ┌──────┐           │
│ │ CARD │  │ CARD │           │
│ └──────┘  └──────┘           │
│                              │
│ ┌──────┐  ┌──────┐           │
│ │ CARD │  │ CARD │           │
│ └──────┘  └──────┘           │
│                              │
└──────────────────────────────┘
```

The preview must correspond to the actual physical dimensions.

---

# 41. PRINT SETTINGS

Provide:

```text
Paper:
A4

Orientation:
Portrait / Landscape

Margins:
Top
Bottom
Left
Right

Gap:
Horizontal
Vertical

[x] Crop marks
[ ] Bleed
```

---

# 42. PRINT INSTRUCTIONS

Before export/print, show:

> For accurate card dimensions, print the PDF at **100% / Actual Size**. Disable “Fit to Page” or automatic scaling.

This is important for physical production.

---

# 43. CALIBRATION PAGE

This may be included as a small MVP feature if implementation cost is low.

Generate a test PDF containing:

```text
100 mm calibration line
85.60 mm reference
53.98 mm reference
```

The user can physically measure the printed result.

---

# 44. UI DESIGN

The application must look like a professional modern productivity tool.

Do not make it look like a generic student project.

Visual priorities:

* Clean.
* Minimal.
* Professional.
* Fast.
* Clear hierarchy.
* Excellent empty states.
* Excellent error states.
* Clear progress indicators.

Avoid unnecessary gradients, excessive animation, or decorative UI.

---

# 45. MAIN APPLICATION NAVIGATION

Use a simple workflow:

```text
Dashboard

Projects

Templates
```

Inside a project:

```text
Setup
Dataset
Photos
Design
Mapping
Validation
Preview
Generate
Print
```

---

# 46. SETUP SCREEN

Allow:

```text
Project Name
Card Size
Card Orientation
```

Default:

```text
85.60 × 53.98 mm
Landscape
```

---

# 47. DATASET SCREEN

Show:

```text
Upload CSV / Excel
```

After upload:

```text
File
Worksheet
Rows
Columns
Primary Key
```

Include a data preview.

---

# 48. PHOTOS SCREEN

Show:

```text
Photo Source
Matching Field
Filename Pattern
Extensions
Recursive Search
```

Then:

```text
Scan
```

and show matching statistics.

---

# 49. DESIGN SCREEN

Show the uploaded card design on a physical-size canvas.

Controls:

```text
Add Text
Add Photo
Add QR
Add Image
```

No advanced drawing system.

---

# 50. MAPPING SCREEN

Show all dynamic elements:

```text
Element          Mapping

Student Name     → Name
Student ID       → Student ID
Class            → Class
Section          → Section
Photo            → Student ID
```

The user must be able to modify mappings.

---

# 51. VALIDATION SCREEN

Show an overall health report:

```text
Dataset             ✓
Primary Key         ✓
Photos              ✓
Mappings            ✓
Template            ✓
Text Overflow       ⚠
```

Clicking an issue opens the affected records.

---

# 52. PREVIEW SCREEN

Allow:

```text
Previous
Next
Search Student ID
Random
Errors Only
```

The user should be able to inspect actual generated cards before committing to a large batch.

---

# 53. GENERATION SCREEN

Allow:

```text
Generate PNG
Generate JPEG
Generate PDF
Generate All
```

Provide batch progress.

---

# 54. PRINT SCREEN

Allow:

```text
Paper size
Orientation
Margins
Spacing
Crop marks
Bleed
```

Show paper preview.

Then:

```text
Generate Print PDF
```

---

# 55. STORAGE

For MVP, prefer local persistence.

Use browser storage such as IndexedDB for:

* Project metadata.
* Template configuration.
* Mapping configuration.
* Settings.
* Small cached assets where appropriate.

Do not persist thousands of full-resolution photos unnecessarily.

---

# 56. SAVING PROJECTS

Users should eventually be able to:

```text
Save Project
Open Project
Export Project
Import Project
```

The project file should contain configuration, not necessarily every original photograph.

A future implementation can use a project format such as:

```text
.idstudio
```

---

# 57. PHOTO RECONNECTION

If a saved project cannot access the original photo source:

```text
Photo source unavailable.

[Reconnect Photo Folder]
```

After reconnection:

```text
Re-scan
```

and rebuild the photo index.

---

# 58. SECURITY

Treat all imported files and data as untrusted.

Protect against:

* XSS.
* Malicious SVG.
* Malformed spreadsheets.
* Extremely large images.
* ZIP bombs.
* Path traversal.
* Unsafe filenames.
* HTML injection.

Imported student names and other fields must never be interpreted as executable HTML.

---

# 59. SVG

SVG is NOT required as a design input in MVP.

If later added, sanitize it before rendering.

Do not introduce unsafe SVG handling just to support an additional format.

---

# 60. FONT HANDLING

Support a reasonable set of fonts.

The rendering engine must ensure that preview and exported output use the same font.

Do not allow:

```text
Preview font = Font A
PDF silently substitutes Font B
```

without warning.

---

# 61. STATE MANAGEMENT

Use a predictable centralized state architecture.

Recommended:

```text
Zustand
```

or an equivalent lightweight state manager.

Keep these states separate:

```text
Project State
Dataset State
Photo State
Template State
Mapping State
Validation State
Generation State
Export State
```

Do not create a single giant unstructured global object.

---

# 62. TYPESCRIPT

Use TypeScript throughout.

Avoid:

```text
any
```

unless genuinely unavoidable.

Define explicit types for:

```text
Project
Dataset
DatasetField
Record
Template
TemplateElement
PhotoMatch
FieldMapping
ValidationIssue
RenderInput
RenderOutput
PrintSettings
GenerationJob
```

---

# 63. COMPONENT ARCHITECTURE

Use reusable components.

Suggested:

```text
components/
├── ui/
├── project/
├── dataset/
├── photos/
├── design/
├── mapping/
├── validation/
├── preview/
├── generation/
└── printing/
```

Avoid huge 2,000-line React components.

---

# 64. CORE SERVICES

Keep core business logic independent of React.

Suggested:

```text
services/
├── dataset/
├── photos/
├── template/
├── mapping/
├── validation/
├── rendering/
├── export/
└── printing/
```

The UI calls these services.

---

# 65. RENDER SERVICE

Define a stable interface conceptually similar to:

```typescript
renderCard({
  template,
  record,
  assets,
  mappings,
  options
})
```

The implementation may evolve, but this separation must remain.

---

# 66. PHOTO SERVICE

Define an abstraction similar to:

```typescript
scanPhotoSource(source)
buildPhotoIndex(files)
matchPhoto(record, index, configuration)
```

The application should not couple photo matching logic directly to UI components.

---

# 67. DATA SERVICE

Define an abstraction similar to:

```typescript
importDataset(file)
getSheets()
getRecords()
validatePrimaryKey()
```

Again, keep it independent of React.

---

# 68. PRINT SERVICE

Define an abstraction similar to:

```typescript
calculateLayout({
  paper,
  card,
  margins,
  gaps,
  orientation
})
```

The result should include:

```text
columns
rows
positions
unused space
```

---

# 69. ERROR HANDLING

Errors must be understandable by school operators.

Never expose raw programming errors such as:

```text
TypeError: undefined is not a function
```

Instead:

```text
We could not read this spreadsheet.

Please verify that the file is a valid CSV/XLSX file.
```

Technical details may be available behind an expandable developer/error section.

---

# 70. ACCESSIBILITY

Support:

* Keyboard navigation.
* Visible focus.
* Accessible dialogs.
* Labels.
* Proper button semantics.
* Useful error messages.

The application is primarily desktop-oriented, but it must not be inaccessible.

---

# 71. RESPONSIVE DESIGN

Primary target:

```text
Desktop / Laptop
```

Recommended minimum:

```text
1280 × 720
```

Do not compromise the desktop editor experience merely to optimize for mobile.

---

# 72. PERFORMANCE TARGET

Target:

```text
100 records → excellent
200 records → excellent
500 records → reliable
1,000 records → supported
```

Generation should happen progressively.

Do not create a giant array of decoded full-resolution photographs.

---

# 73. TESTING

Core algorithms must have unit tests.

Test:

### Dataset

* CSV parsing.
* XLSX parsing.
* Duplicate primary key.
* Empty primary key.

### Photos

* Exact filename matching.
* Extension variations.
* Custom patterns.
* Missing photo.
* Duplicate candidate.
* Nested directory.

### Template

* Physical dimensions.
* Element positioning.
* Field mapping.
* Text overflow.

### Rendering

* Correct dimensions.
* Correct data substitution.
* Correct image placement.

### Printing

* A4 calculation.
* Margins.
* Gaps.
* Card count.
* Orientation.

---

# 74. GOLDEN RENDER TEST

Create deterministic fixtures:

```text
Test Dataset
Test Photo
Test Template
```

Render the expected card.

Keep a golden/reference output.

Any significant visual regression must be detected.

---

# 75. PHYSICAL PRINT TESTING

Eventually test physical output.

Measure:

```text
Card width
Card height
Margins
Front alignment
```

The PDF must preserve physical dimensions.

---

# 76. BROWSER FILE ACCESS

Use browser-supported filesystem APIs where available.

The application must gracefully handle browsers that do not support direct folder selection.

Fallback:

```text
Upload photos
```

or:

```text
Upload ZIP
```

Do not make the entire application unusable merely because direct folder access is unavailable.

---

# 77. FUTURE DESKTOP ARCHITECTURE

Do not build desktop support now.

However, keep filesystem access abstract:

```text
PhotoSource
    ├── BrowserDirectorySource
    ├── FileUploadSource
    └── ZipSource
```

A future implementation may add:

```text
NativeDirectorySource
```

without rewriting the photo-matching engine.

---

# 78. FUTURE FEATURES

These are explicitly future work:

### v2

* Front + Back.
* Template library.
* More advanced formatting.
* Better project import/export.
* More print configurations.

### v3

* Canva import.
* PSD support if technically feasible.
* CorelDRAW support if technically feasible.
* Cloud storage.
* User accounts.
* Multi-school support.

### Future advanced

* Face-aware cropping.
* AI assistance.
* Background removal.
* ERP integration.
* Student verification.
* PVC printer workflows.

Do not implement these now.

---

# 79. IMPORTANT ARCHITECTURAL RULE

Do not build the application around one school's exact Excel columns.

For example, do NOT hard-code:

```text
Name
Student ID
Class
Section
```

as required internal fields.

Instead, support arbitrary dataset columns.

A school may have:

```text
Student_Name
Admission_No
Std
Div
Father
```

while another may have:

```text
Name
Document ID
Grade
Section
Parent Name
```

The mapping layer handles this.

---

# 80. PHOTO MATCHING MUST ALSO BE GENERIC

Do not hard-code:

```text
Student ID = filename
```

as the only solution.

The user must choose:

```text
Which dataset field identifies the photo?
```

and:

```text
How is that value represented in the filename?
```

This makes the application usable beyond one school.

---

# 81. IMPORTANT DATA MODEL PRINCIPLE

Never make photo filenames the primary identity.

The dataset's selected primary key is the identity.

Photos are assets associated with that identity.

Correct:

```text
Record
  primaryKey = J240212021

Photo
  matchedKey = J240212021
```

Incorrect:

```text
Photo filename = primary identity
```

---

# 82. NO SILENT DATA LOSS

If there are 500 records:

```text
Input = 500
```

the application must clearly report:

```text
Valid = 493
Invalid = 7
Generated = 493
Skipped = 7
```

Never silently output 493 files and pretend everything succeeded.

---

# 83. PROJECT RECOVERY

If the browser refreshes or the user accidentally navigates away, the project should be recoverable from local state where feasible.

At minimum, persist:

```text
project metadata
template
mappings
dataset metadata
settings
```

---

# 84. UI QUALITY BAR

Every screen should have:

* Loading state.
* Empty state.
* Error state.
* Success state.
* Disabled state where necessary.
* Clear next action.

Avoid dead-end screens.

---

# 85. DEVELOPMENT METHODOLOGY

Build vertically.

Do not create hundreds of placeholder components first.

The first working vertical slice should eventually achieve:

```text
XLSX
+
Photos
+
PNG design
+
One text field
+
One photo field
+
Mapping
+
One generated card
```

Then expand to:

```text
100 cards
```

then:

```text
500 cards
```

then:

```text
print PDF
```

---

# 86. AGENT DISCIPLINE

If multiple AI development agents are used, they must work within explicit task boundaries.

Each agent must:

1. Read this master prompt first.
2. Understand the architecture.
3. Identify its assigned task boundary.
4. Modify only files/components relevant to its assigned task.
5. Not implement another agent's responsibility.
6. Not redesign the architecture without approval.
7. Not introduce unrelated dependencies.
8. Not expand MVP scope.
9. Not delete working functionality without justification.
10. Add tests for logic it introduces.
11. Preserve existing interfaces.
12. Report assumptions and blockers.

---

# 87. AGENT TASK BOUNDARY RULE

If an agent is assigned:

```text
D2 — Photo Matching
```

it may work on:

```text
Photo scanning
Photo indexing
Filename matching
Matching configuration
Photo validation
```

It must NOT implement:

```text
PDF generation
Print layouts
Authentication
Template editor
Cloud storage
```

unless explicitly instructed.

Likewise, an agent assigned to rendering must not redesign dataset import.

---

# 88. AGENT OUTPUT REQUIREMENT

Every development agent must report:

```text
1. What was implemented.
2. Files changed.
3. Interfaces added/modified.
4. Tests added.
5. Known limitations.
6. Anything intentionally left for another agent.
```

Do not provide vague statements such as:

```text
Done.
```

---

# 89. AGENT HANDOFF RULE

When one agent finishes, the next agent should consume its existing interfaces rather than rewrite them.

Example:

```text
Dataset Agent
      ↓
Dataset Service
      ↓
Mapping Agent
      ↓
Mapping Service
      ↓
Rendering Agent
```

Interfaces are contracts.

Do not casually break them.

---

# 90. DEPENDENCY RULE

Before adding a package:

1. Check whether an existing dependency already solves the problem.
2. Prefer mature, focused libraries.
3. Avoid duplicate libraries.
4. Avoid large dependencies for tiny functionality.
5. Confirm browser compatibility.
6. Confirm licensing is acceptable.

---

# 91. NO PREMATURE BACKEND

Do not introduce a backend merely because:

> “Real applications need a backend.”

This MVP does not require a backend for its core workflow.

Use client-side processing wherever technically reasonable.

A backend may be introduced later for:

* accounts,
* cloud storage,
* collaboration,
* centralized templates,
* server rendering,
* analytics.

---

# 92. NO PREMATURE AUTHENTICATION

The MVP should open directly into the application.

Do not add:

```text
Login
Signup
Forgot Password
```

unless explicitly requested.

---

# 93. NO PREMATURE DATABASE

Do not introduce PostgreSQL/MongoDB/etc. simply for storing local projects.

Use local persistence initially.

The domain model must still be structured so that a database can be added later.

---

# 94. PRODUCT LANGUAGE

Use simple language.

Prefer:

```text
Upload Design
```

instead of:

```text
Import Raster Template Asset
```

Prefer:

```text
Connect Photos
```

instead of:

```text
Initialize Photo Source Provider
```

The end user is a school operator, not a developer.

---

# 95. PRIMARY SUCCESS CRITERION

A non-technical school operator should be able to take:

```text
students.xlsx
+
student photos folder
+
school-id-card.jpg
```

and produce:

```text
print-ready ID cards
```

without developer assistance.

---

# 96. FINAL ARCHITECTURE

The intended architecture is:

```text
                 WEB APPLICATION
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     Dataset         Photos         Design
      Engine          Engine         Engine
        │              │              │
        └──────────────┼──────────────┘
                       │
                  Mapping Layer
                       │
                 Validation Layer
                       │
                 Canonical Model
                       │
                 Rendering Engine
                       │
          ┌────────────┼────────────┐
          │            │            │
         PNG          JPEG         PDF
                                    │
                             Print Sheet Engine
                                    │
                                  A4 PDF
```

---

# 97. CANONICAL DATA FLOW

The complete system must conceptually behave like:

```text
Dataset
   ↓
Normalized Records
   ↓
Primary-Key Validation
   ↓
Photo Index
   ↓
Photo Matching
   ↓
Template
   ↓
Field Mapping
   ↓
Validation
   ↓
Render Input
   ↓
Canonical Render Model
   ↓
Output Renderer
```

This is the fundamental architecture.

---

# 98. FINAL INSTRUCTION TO THE DEVELOPMENT TEAM

Build this application as if it will eventually become a professional commercial product, but do not build commercial complexity into the MVP.

Prioritize the actual problem:

> **Generate hundreds of accurate, high-quality school ID cards from an existing design, spreadsheet and local photographs with minimal manual work.**

The MVP must be:

* Local-first.
* Privacy-conscious.
* URL-based.
* Desktop-optimized.
* Easy for non-technical users.
* Reliable for 100–500 card batches.
* Capable of handling 1,000+ records.
* Physically accurate.
* Print-ready.
* Architecturally extensible.

Do not turn the product into Canva.

Do not turn it into an ERP.

Do not turn it into a SaaS platform.

Do not build features simply because they are technically interesting.

Build the **best possible bulk ID-card production workflow** first.

Every technical decision must support that objective.
