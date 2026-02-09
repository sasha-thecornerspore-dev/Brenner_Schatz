import { useState } from 'react'
import { FileText, Copy, Check, Info } from 'lucide-react'

export function DiscoveryBuilder() {
    const [activeTheory, setActiveTheory] = useState('')
    const [copied, setCopied] = useState(false)

    const THEORIES = [
        {
            id: 'standing',
            name: 'Lack of Standing',
            description: 'Challenging the plaintiff\'s right to foreclose due to broken chain of title or possession.',
            requests: `1. Produce the original Wet Ink Note for inspection.
2. Produce all assignments of the mortgage from origination to present.
3. Identify the custodian of the collateral file.
4. Produce the Pooling and Servicing Agreement (PSA) for the trust.
5. Provide proof of delivery of the Note to the Trust prior to the closing date.`
        },
        {
            id: 'servicing',
            name: 'Servicing Violations (RESPA/TILA)',
            description: 'Alleging failure to follow federal servicing guidelines or dual tracking.',
            requests: `1. Produce the complete loan transaction history (pay history).
2. Produce all loss mitigation notes and communication logs.
3. Produce the "Notice of Default" and proof of mailing.
4. Identify all fees assessed to the account and their contractual basis.
5. Produce the single point of contact (SPOC) designation letter.`
        },
        {
            id: 'robo',
            name: 'Robo-Signing / Affidavit Fraud',
            description: 'Alleging that the affiant lacked personal knowledge of the records.',
            requests: `1. Identify the person who signed the Affidavit of Merit.
2. Produce the job description and training manual for the affiant.
3. State the volume of affidavits signed by the affiant on the date in question.
4. Produce time logs showing the duration of review for this file.
5. Admit that the affiant did not personally review the collateral file.`
        }
    ]

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const selectedTheory = THEORIES.find(t => t.id === activeTheory)

    return (
        <div className="space-y-6">
            <div className="bg-card border border-white/5 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    Discovery Generator
                </h2>

                <p className="text-muted-foreground mb-8">
                    Select a theory of defense to generate targeted Interrogatories and Requests for Production.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {THEORIES.map(theory => (
                        <button
                            key={theory.id}
                            onClick={() => setActiveTheory(theory.id)}
                            className={`text-left p-4 rounded-lg border transition-all ${activeTheory === theory.id
                                    ? 'bg-primary/20 border-primary text-primary'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="font-semibold mb-2">{theory.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">{theory.description}</div>
                        </button>
                    ))}
                </div>

                {selectedTheory && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">Generated Requests</h3>
                            <button
                                onClick={() => handleCopy(selectedTheory.requests)}
                                className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy Text'}
                            </button>
                        </div>

                        <div className="bg-black/30 border border-white/10 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap text-muted-foreground">
                            {selectedTheory.requests}
                        </div>

                        <div className="mt-4 flex gap-2 text-xs text-amber-400/80 bg-amber-400/10 p-3 rounded border border-amber-400/20">
                            <Info className="w-4 h-4 shrink-0" />
                            Disclaimer: These are template requests. Always review against local rules and specific case facts before serving.
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
