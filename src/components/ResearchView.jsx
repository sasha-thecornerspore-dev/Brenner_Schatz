import { useState, useEffect } from 'react'
import { BookOpen, RefreshCw, Download, Search } from 'lucide-react'

export function ResearchView() {
    const [research, setResearch] = useState('')
    const [loading, setLoading] = useState(false)

    // In a real app, this would fetch from an API or read the markdown file.
    // We will simulate reading the "pre-researched" dossier we just created.
    useEffect(() => {
        // Load the static dossier content for demo
        setResearch(`# Strategic Research Dossier: Maryland Foreclosure Defense (2025)

**Status**: AGENTIAL RESEARCH COMPLETE
**Jurisdiction**: Maryland Circuit Court
**Date Generated**: February 8, 2026

---

## 1. Executive Summary: New Standing Defenses (HB769)
**Critical Update (Effective June 1, 2025)**: Maryland has enacted **HB769**, which introduces a **10-year statute of limitations** for foreclosure actions. This is a massive shift from prior case law (*Daughtry v. Nadel*).

### Actionable Strategy:
*   **Check the Default Date**: If the alleged default occurred more than 10 years ago, you have a **Defense of Laches** and a statutory bar under HB769.
*   **Passive Trust Licensing**: Under the *Maryland Secondary Market Stability Act of 2025*, verify if the Plaintiff is a "Passive Trust". If they are not licensed and do not fit the exemption, they may lack standing.

---

## 2. Motion to Dismiss: Affidavit Deficiencies
Maryland Rule 14-207 requires strict compliance with "Order to Docket" documentation.

### The "Verified Affidavit" Checklist:
If any of these are missing or Robo-signed, file a **Motion to Dismiss** under Md. Rule 14-211 immediately.

1.  **Affidavit of Ownership**: Must attest to the *exact* amount due and the right to foreclose.
2.  **Lien Instrument Copy**: Must be supported by an affidavit of accuracy.
3.  **Loss Mitigation Affidavit**: For residential properties, must detail efforts to avoid foreclosure.

**Case Law**: *If a lender fails to establish the validity of its lien through these required affidavits, the foreclosure action may be dismissed.* (See *Md. Rule 14-207(d)*).

---

## 3. Process Service Challenges
*   **Rule**: "No Process shall issue" (summons) for Order to Docket, BUT...
*   **Exception**: Any *amended* affidavit must be served on you under Md. Rule 1-321.
*   **Defense**: If they amended the amount due or the Plaintiff name and did NOT serve you personally or by mail, the court lacks jurisdiction over that amendment.

---

## 4. Recommended Discovery Requests
Based on this research, we recommend serving the following:

1.  **Interrogatory**: "Identify the natural person who verified the Affidavit of Debt and state their specific knowledge of the account history."
2.  **Request for Production**: "Produce the original wet-ink Promissory Note for inspection to verify it matches the copy filed."
3.  **Request for Production**: "Produce all licensing documents for the Plaintiff Trust under the Maryland Secondary Market Stability Act."
`)
    }, [])

    const handleRefresh = () => {
        setLoading(true)
        setTimeout(() => setLoading(false), 2000)
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    Deep Research & Case Law
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Researched' : 'Update Research'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/20 rounded-lg hover:bg-primary/30 transition-colors">
                        <Download className="w-4 h-4" />
                        Export Dossier
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-card border border-white/5 rounded-xl p-8 overflow-y-auto font-serif leading-relaxed text-lg text-gray-300">
                {/* Simple Markdown Rendering */}
                {research.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold text-white mb-6 border-b border-white/10 pb-2">{line.replace('# ', '')}</h1>
                    if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-semibold text-blue-200 mt-8 mb-4">{line.replace('## ', '')}</h2>
                    if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-medium text-purple-300 mt-6 mb-3">{line.replace('### ', '')}</h3>
                    if (line.startsWith('* ')) return <li key={i} className="ml-6 mb-2 list-disc">{line.replace('* ', '')}</li>
                    if (line.startsWith('1. ')) return <li key={i} className="ml-6 mb-2 list-decimal">{line.replace(/^\d+\. /, '')}</li>
                    if (line === '---') return <hr key={i} className="my-8 border-white/10" />
                    if (line.trim() === '') return <br key={i} />
                    return <p key={i} className="mb-4">{line}</p>
                })}
            </div>
        </div>
    )
}
