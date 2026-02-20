# Skill Authoring Best Practices

> Adapted from Anthropic's official skill authoring documentation. See [Anthropic Docs](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/best-practices) for the canonical source.

Good Skills are concise, well-structured, and tested with real usage. This guide provides practical authoring decisions to help you write Skills that Claude can discover and use effectively.

## Core Principles

### Concise is Key

The context window is a public good. Your Skill shares the context window with everything else Claude needs to know, including:

* The system prompt
* Conversation history
* Other Skills' metadata
* Your actual request

Not every token in your Skill has an immediate cost. At startup, only the metadata (name and description) from all Skills is pre-loaded. Claude reads SKILL.md only when the Skill becomes relevant, and reads additional files only as needed. However, being concise in SKILL.md still matters: once Claude loads it, every token competes with conversation history and other context.

**Default assumption**: Claude is already very smart

Only add context Claude doesn't already have. Challenge each piece of information:

* "Does Claude really need this explanation?"
* "Can I assume Claude knows this?"
* "Does this paragraph justify its token cost?"

**Good example: Concise** (approximately 50 tokens):

````markdown
## Extract PDF text

Use pdfplumber for text extraction:

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

**Bad example: Too verbose** (approximately 150 tokens):

```markdown
## Extract PDF text

PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available for PDF processing, but we
recommend pdfplumber because it's easy to use and handles most cases well.
First, you'll need to install it using pip. Then you can use the code below...
```

The concise version assumes Claude knows what PDFs are and how libraries work.

### Set Appropriate Degrees of Freedom

Match the level of specificity to the task's fragility and variability.

**High freedom** (text-based instructions):

Use when:
* Multiple approaches are valid
* Decisions depend on context
* Heuristics guide the approach

**Medium freedom** (pseudocode or scripts with parameters):

Use when:
* A preferred pattern exists
* Some variation is acceptable
* Configuration affects behavior

**Low freedom** (specific scripts, few or no parameters):

Use when:
* Operations are fragile and error-prone
* Consistency is critical
* A specific sequence must be followed

**Analogy**: Think of Claude as a robot exploring a path:
* **Narrow bridge with cliffs on both sides**: There's only one safe way forward. Provide specific guardrails and exact instructions (low freedom).
* **Open field with no hazards**: Many paths lead to success. Give general direction and trust Claude to find the best route (high freedom).

### Test with All Models You Plan to Use

Skills act as additions to models, so effectiveness depends on the underlying model. Test your Skill with all the models you plan to use it with.

**Testing considerations by model**:
* **Claude Haiku** (fast, economical): Does the Skill provide enough guidance?
* **Claude Sonnet** (balanced): Is the Skill clear and efficient?
* **Claude Opus** (powerful reasoning): Does the Skill avoid over-explaining?

What works perfectly for Opus might need more detail for Haiku. If you plan to use your Skill across multiple models, aim for instructions that work well with all of them.

## Skill Structure

**YAML Frontmatter**: The SKILL.md frontmatter supports two fields:
* `name` - Human-readable name of the Skill (64 characters maximum)
* `description` - One-line description of what the Skill does and when to use it (1024 characters maximum)

### Naming Conventions

Use consistent naming patterns. We recommend **gerund form** (verb + -ing) for Skill names.

**Good naming examples (gerund form)**:
* "Processing PDFs"
* "Analyzing spreadsheets"
* "Managing databases"
* "Testing code"
* "Writing documentation"

**Acceptable alternatives**:
* Noun phrases: "PDF Processing", "Spreadsheet Analysis"
* Action-oriented: "Process PDFs", "Analyze Spreadsheets"

**Avoid**:
* Vague names: "Helper", "Utils", "Tools"
* Overly generic: "Documents", "Data", "Files"
* Inconsistent patterns within your skill collection

### Writing Effective Descriptions

The `description` field enables Skill discovery and should include both what the Skill does and when to use it.

**Always write in third person**. The description is injected into the system prompt, and inconsistent point-of-view can cause discovery problems.
* **Good:** "Processes Excel files and generates reports"
* **Avoid:** "I can help you process Excel files"
* **Avoid:** "You can use this to process Excel files"

**Be specific and include key terms**. Include both what the Skill does and specific triggers/contexts for when to use it.

Each Skill has exactly one description field. The description is critical for skill selection: Claude uses it to choose the right Skill from potentially 100+ available Skills.

Effective examples:

```yaml
# PDF Processing skill:
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.

# Excel Analysis skill:
description: Analyze Excel spreadsheets, create pivot tables, generate charts. Use when analyzing Excel files, spreadsheets, tabular data, or .xlsx files.

# Git Commit Helper skill:
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
```

Avoid vague descriptions like:
```yaml
description: Helps with documents
description: Processes data
description: Does stuff with files
```

### Progressive Disclosure Patterns

SKILL.md serves as an overview that points Claude to detailed materials as needed, like a table of contents in an onboarding guide.

**Practical guidance:**
* Keep SKILL.md body under 500 lines for optimal performance
* Split content into separate files when approaching this limit
* Use the patterns below to organize instructions, code, and resources effectively

#### Pattern 1: High-level Guide with References

````markdown
---
name: PDF Processing
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files.
---

# PDF Processing

## Quick start

Extract text with pdfplumber:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## Advanced features

**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
**Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
````

Claude loads FORMS.md, REFERENCE.md, or EXAMPLES.md only when needed.

#### Pattern 2: Domain-specific Organization

For Skills with multiple domains, organize content by domain to avoid loading irrelevant context.

```
bigquery-skill/
├── SKILL.md (overview and navigation)
└── reference/
    ├── finance.md (revenue, billing metrics)
    ├── sales.md (opportunities, pipeline)
    ├── product.md (API usage, features)
    └── marketing.md (campaigns, attribution)
```

#### Pattern 3: Conditional Details

Show basic content, link to advanced content:

```markdown
# DOCX Processing

## Creating documents

Use docx-js for new documents. See [DOCX-JS.md](DOCX-JS.md).

## Editing documents

For simple edits, modify the XML directly.

**For tracked changes**: See [REDLINING.md](REDLINING.md)
**For OOXML details**: See [OOXML.md](OOXML.md)
```

### Avoid Deeply Nested References

Claude may partially read files when they're referenced from other referenced files. **Keep references one level deep from SKILL.md**.

**Bad: Too deep**:
```
SKILL.md → advanced.md → details.md → actual information
```

**Good: One level deep**:
```
SKILL.md → advanced.md (actual information)
SKILL.md → reference.md (actual information)
SKILL.md → examples.md (actual information)
```

### Structure Longer Reference Files

For reference files longer than 100 lines, include a table of contents at the top. This ensures Claude can see the full scope of available information even when previewing with partial reads.

## Workflows and Feedback Loops

### Use Workflows for Complex Tasks

Break complex operations into clear, sequential steps. For particularly complex workflows, provide a checklist that Claude can copy into its response and check off as it progresses.

### Implement Feedback Loops

**Common pattern**: Run validator then fix errors then repeat.

This pattern greatly improves output quality.

```markdown
## Document editing process

1. Make your edits
2. **Validate immediately**: `bun run scripts/validate.ts`
3. If validation fails:
   - Review the error message carefully
   - Fix the issues
   - Run validation again
4. **Only proceed when validation passes**
5. Test the output
```

## Content Guidelines

### Avoid Time-Sensitive Information

Don't include information that will become outdated. Use "Current method" / "Old patterns" sections instead of date-based conditionals.

### Use Consistent Terminology

Choose one term and use it throughout the Skill:

**Good - Consistent**:
* Always "API endpoint"
* Always "field"
* Always "extract"

**Bad - Inconsistent**:
* Mix "API endpoint", "URL", "API route", "path"
* Mix "field", "box", "element", "control"

## Common Patterns

### Template Pattern

Provide templates for output format. Match the level of strictness to your needs.

### Examples Pattern

For Skills where output quality depends on seeing examples, provide input/output pairs just like in regular prompting.

### Conditional Workflow Pattern

Guide Claude through decision points:

```markdown
## Document modification workflow

1. Determine the modification type:

   **Creating new content?** Follow "Creation workflow" below
   **Editing existing content?** Follow "Editing workflow" below

2. Creation workflow:
   - Use library to build from scratch
   - Export to desired format

3. Editing workflow:
   - Unpack existing document
   - Modify directly
   - Validate after each change
   - Repack when complete
```

## Evaluation and Iteration

### Build Evaluations First

**Create evaluations BEFORE writing extensive documentation.** This ensures your Skill solves real problems rather than documenting imagined ones.

**Evaluation-driven development:**
1. **Identify gaps**: Run Claude on representative tasks without a Skill. Document specific failures
2. **Create evaluations**: Build three scenarios that test these gaps
3. **Establish baseline**: Measure Claude's performance without the Skill
4. **Write minimal instructions**: Create just enough content to address the gaps
5. **Iterate**: Execute evaluations, compare against baseline, and refine

### Develop Skills Iteratively with Claude

Work with one instance of Claude ("Claude A") to create a Skill that will be used by other instances ("Claude B"). Claude A helps you design and refine instructions, while Claude B tests them in real tasks.

**Creating a new Skill:**
1. Complete a task without a Skill - notice what context you repeatedly provide
2. Identify the reusable pattern
3. Ask Claude A to create a Skill capturing the pattern
4. Review for conciseness - remove unnecessary explanations
5. Improve information architecture
6. Test on similar tasks with Claude B
7. Iterate based on observation

**Iterating on existing Skills:**
1. Use the Skill in real workflows
2. Observe Claude B's behavior - note where it struggles
3. Return to Claude A for improvements
4. Apply and test changes
5. Repeat based on usage

### Observe How Claude Navigates Skills

Watch for:
* **Unexpected exploration paths**: Structure might not be intuitive
* **Missed connections**: Links might need to be more explicit
* **Overreliance on certain sections**: Content might belong in main SKILL.md
* **Ignored content**: File might be unnecessary or poorly signaled

## Anti-Patterns to Avoid

### Avoid Windows-Style Paths
Always use forward slashes in file paths, even on Windows.

### Avoid Offering Too Many Options
Don't present multiple approaches unless necessary. Provide a default with an escape hatch.

## Advanced: Skills with Executable Code

### Solve, Don't Punt

When writing scripts for Skills, handle error conditions rather than punting to Claude.

Configuration parameters should be justified and documented to avoid "voodoo constants" (Ousterhout's law).

### Provide Utility Scripts

Even if Claude could write a script, pre-made scripts offer advantages:
* More reliable than generated code
* Save tokens (no need to include code in context)
* Save time (no code generation required)
* Ensure consistency across uses

**Important distinction**: Make clear whether Claude should:
* **Execute the script** (most common): "Run `scripts/analyze.ts` to extract fields"
* **Read it as reference** (for complex logic): "See `scripts/analyze.ts` for the extraction algorithm"

### Create Verifiable Intermediate Outputs

For complex tasks, use the "plan-validate-execute" pattern: analyze then create plan file then validate plan then execute then verify.

### Package Dependencies

List required packages in your SKILL.md and verify they're available in the target environment.

### MCP Tool References

If your Skill uses MCP tools, always use fully qualified tool names: `ServerName:tool_name`

## Technical Notes

### YAML Frontmatter Requirements
The SKILL.md frontmatter includes only `name` (64 characters max) and `description` (1024 characters max) fields.

### Token Budgets
Keep SKILL.md body under 500 lines for optimal performance. If your content exceeds this, split it into separate files using progressive disclosure patterns.

## Checklist for Effective Skills

### Core Quality
* [ ] Description is specific and includes key terms
* [ ] Description includes both what the Skill does and when to use it
* [ ] SKILL.md body is under 500 lines
* [ ] Additional details are in separate files (if needed)
* [ ] No time-sensitive information
* [ ] Consistent terminology throughout
* [ ] Examples are concrete, not abstract
* [ ] File references are one level deep
* [ ] Progressive disclosure used appropriately
* [ ] Workflows have clear steps

### Code and Scripts
* [ ] Scripts solve problems rather than punt to Claude
* [ ] Error handling is explicit and helpful
* [ ] No "voodoo constants" (all values justified)
* [ ] Required packages listed and verified
* [ ] Scripts have clear documentation
* [ ] No Windows-style paths
* [ ] Validation/verification steps for critical operations
* [ ] Feedback loops included for quality-critical tasks

### Testing
* [ ] At least three evaluations created
* [ ] Tested with real usage scenarios
* [ ] Team feedback incorporated (if applicable)
