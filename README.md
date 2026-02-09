# LegalMind - Foreclosure Litigation Tool

## Brenner v. Schatz Case

This repository documents Jeffrey Schatz's defense in the Maryland foreclosure case Brenner et al. v. Schatz (Case No. C-03-CV-24-003218), Circuit Court for Baltimore County, exposing plaintiffs' lack of standing, discovery violations, and bad faith tactics.

Key issues include contradictory sworn statements on note possession (Wells Fargo vs. Deutsche Bank custodian), a specially indorsed note misrepresented as blank, and failed securitization into the defunct Sequoia Mortgage Trust 2010-H1 (SEMT 2010-H1).

### Case Overview
- **Property**: 18 Edmondson Ridge Road, Catonsville, MD 21228.
- **Plaintiffs**: Andrew Brenner et al., Substitute Trustees (BWW Law Group, LLC; Christine N. Johnson).
- **Note Holder Claim**: U.S. Bank as Trustee; Custodian: Deutsche Bank.

### Core Defects:
- No possession by Wells Fargo (special indorsee), voiding trustee appointment (Md. Real Prop. § 7-105).
- FHA loss mitigation non-compliance (24 C.F.R. §§ 203.500, 203.604).
- Contempt of discovery order (Md. Rule 2-433).

### Key Documents
| Filing | Description | Highlights |
|--------|------------|-----------|
| Motion for Sanctions | Seeks dismissal for willful discovery failure | Plaintiffs defied Aug. 15, 2025 order; contradictory note location claims |
| Motion to Compel | Original discovery demands | Note inspection refused; bad faith evasion |
| Summary Judgment Motion | Proves standing failure | Void appointment; broken chain of title |
| Opposition Filings | Plaintiffs' responses | Admits Deutsche Bank possession; denies transfers |
| Internal Wells Fargo Notes | Servicing logs | Evidence of FHA violations |

### Legal Arguments
- **Standing Defect**: Plaintiffs' appointment void; Wells Fargo not "holder" lacking possession (Anderson v. Burson, 424 Md. 232).
- **Securitization Failure**: Note ineligible for SEMT 2010-H1 (wrong date, custodian, endorsement); trust defunct (SEC Form 15).
- **Bad Faith**: Perjured service certificates; contempt (Md. Rule 1-341).
- **FHA Violations**: No face-to-face interview or loss mitigation (24 C.F.R. § 203.604).

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- Git LFS

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/sasha-thecornerspore-dev/Brenner_Schatz.git
   ```
2. Navigate to the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
To use the full features (including file upload), you need to run both the backend and frontend.

1. **Start the Backend (File Server)**:
   Open a terminal in the project root and run:
   ```bash
   node server.js
   ```
   This server handles file uploads and runs on http://localhost:3001.

2. **Start the Frontend**:
   Open a second terminal in the project root and run:
   ```bash
   npm run dev
   ```
   This starts the React application on http://localhost:5173.

## Features
- **Dashboard**: Case overview.
- **Deadline Timeline**: Calculate critical litigation deadlines based on service date.
- **Discovery Generator**: Auto-draft interrogatories and requests for production based on defense theories.
- **Evidence Locker**: Git LFS-backed file storage for large documents (PDFs, ZIPs).

---

**Status**: Active motions pending; alerts set for docket updates. Contribute via issues/PRs for OSINT research.

**Disclaimer**: For educational/legal research; not advice. Verify with Maryland Rules (Title 2).
