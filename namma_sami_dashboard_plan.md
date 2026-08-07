# MASTER IMPLEMENTATION PLAN: 3-Question Person Grading, PDF Generator, AI Photo OCR & Analytics (v2.0)

## Executive Summary
This document defines the complete end-to-end architecture, technical specifications, data schemas, PDF generation parameters, AI photo OCR workflow, and executive reporting dashboard for the **Namma Sami Namma Kovil (NSNK)** platform release **v2.0**.

---

## 1. Approved 3 Questions & Grading Logic

### The 3 Survey Questions:
1. **Q1: Meaning of your Name?** *(உங்கள் பெயரின் பொருள் தெரியுமா?)*
2. **Q2: Do you know your Parampara?** *(உங்கள் பரம்பரை / பாரம்பரியம் தெரியுமா?)*
3. **Q3: Do you know your Gothram?** *(உங்கள் கோத்திரம் தெரியுமா?)*

### Points Allocation & Overall Grade Calculation Rules:
- **`A`** = Full Knowledge (2 Points)
- **`B`** = Partial Knowledge (1 Point)
- **`C`** = No Knowledge (0 Points)

$$\text{Total Score} = \text{Points}(Q1) + \text{Points}(Q2) + \text{Points}(Q3) \quad (\text{Range: } 0 \text{ to } 6 \text{ Points})$$

| Total Score | Pattern Examples | Overall Grade | Badge & Status | Description |
| :---: | :--- | :---: | :---: | :--- |
| **5 to 6 Pts** | `AAA`, `AAB`, `ABA`, `BAA` | 🟢 **Grade A** | Gold Champion | High Knowledge (Knew all 3 or 2+ A's) |
| **3 to 4 Pts** | `BBB`, `AAC`, `ABB`, `BBA` | 🔵 **Grade B** | Silver Active | Moderate Awareness (Knew 1 or 2 items) |
| **0 to 2 Pts** | `CCC`, `CCB`, `BCC`, `CBA` | 🟠 **Grade C** | Bronze Learner | Needs Orientation / Guidance |

---

## 2. PDF Printout Specifications (500 Persons / PDF File)

### Sequential JSON Order & PDF Parameters:
- **Record Order**: Preserves the **EXACT line-by-line sequence of `namma_sami_namma_kovil_full.json`** (from Person #1 to Person #62,521).
- **Page Layout**: **20 Persons per A4 Page** (100% Un-Truncated Tamil Name Meanings).
- **Batch Size**: **500 Persons per PDF File** (25 A4 pages per PDF file).
- **Total Master Files**: **126 Sequential PDF Files** (3,126 A4 pages total).
- **1-Shot Master ZIP Download**: `NSNK_Master_126_PDF_Batches_ZIP.zip` (**~140 MB**, downloads in **5 to 10 seconds** from CDN).

### Page Header Dual Tracking (Barcode + Code):
Every printed PDF page includes a high-contrast tracking header:
```
+----------------------------------------------------------------------------------------------------+
|  நம்ம சாமி நம்ம கோவில் - PDF அழைப்புத் தாள் (20 Members / Page)                                       |
|  CODE: [ NSNK-B042-P12 ]   •  Batch: #042  •  Page: 12/25  •  Persons: #00821 to #00840             |
|                                                                          [ BARCODE / QR CODE ]     |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Sheet Return & AI Photo OCR Upload Pipeline

```
[ Step 1: Admin Downloads PDF Batch (e.g. NSNK_Batch_001.pdf - 25 pages / 500 persons) ]
                 ↓
[ Step 2: Admin Prints PDF and Hands Physical Paper Pages to Caller ]
                 ↓
[ Step 3: Caller Phones Members, Reads Name Meaning Script, Marks (A)(B)(C) with Pen ]
                 ↓
[ Step 4: Caller Snaps Smartphone Photo of Filled PDF Paper Page ]
                 ↓
[ Step 5: Caller Opens Web App & Clicks "Upload Form Photo 📷" ]
                 ↓
[ Step 6: Gemini Vision AI Reads Header Barcode / CODE & Auto-Scans Bubbles in 3 Seconds ]
                 ↓
[ Step 7: Verification Modal: Caller Reviews Scanned Table & Clicks "Confirm & Save" ]
                 ↓
[ Step 8: namma_sami_namma_kovil_full.json Updates Instantly with Grades A/B/C ]
```

---

## 4. Grading Analytics & Reporting Dashboard

1. **Executive Progress KPI Banner**:
   - `Total Graded`, `Grade A Count (🟢)`, `Grade B Count (🔵)`, `Grade C Count (🟠)`, `Ungraded Count (⚪)`.
2. **Question Awareness Breakdown Bars**:
   - Percentage of respondents who knew Q1 (Name Meaning), Q2 (Parampara), and Q3 (Gothram).
3. **District & Union Grading Breakdown Heatmap Table**:
   - Live district progress table (Kanyakumari, Madurai, Chennai, etc.).
4. **1-Click Excel Grading Report Export**:
   - `[ 📊 Export Grading Report (.xlsx) ]` downloads multi-tab report.

---

## 5. Deployment & Release Protocol

Per Section 6 of **[`createNSNKWeb/SKILL.md`](file:///home/sabrisatharamanathan/my-project/Aram-NSNK/.agents/skills/createNSNKWeb/SKILL.md)**:
- Bump website version badge to **`v2.0`**.
- Commit and push changes directly to `git@github.com:karmayogabg/namma-sami-namma-kovil.git`.
