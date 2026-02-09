import { useState, useRef } from 'react'
import { FileText, Download, Wand2, ArrowRight, BookOpen, Scale, Copy, Check, Loader2, ChevronDown, RefreshCw } from 'lucide-react'

export function MotionDrafter() {
    const [selectedMotion, setSelectedMotion] = useState(null)
    const [draftContent, setDraftContent] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [copied, setCopied] = useState(false)
    const [caseFacts, setCaseFacts] = useState('')
    const textareaRef = useRef(null)

    const MOTION_TEMPLATES = [
        {
            id: 'dismiss_standing',
            name: 'Motion to Dismiss (Lack of Standing)',
            category: 'Dispositive',
            description: 'Challenge plaintiff\'s authority to foreclose based on chain of title defects.',
            template: `MOTION TO DISMISS FOR LACK OF STANDING

COMES NOW the Defendant, appearing pro se, and moves this Honorable Court to dismiss the Complaint for failure to state a claim upon which relief can be granted, and in support thereof states:

I. INTRODUCTION

1. The Plaintiff has failed to establish standing to bring this foreclosure action.

2. Standing is a jurisdictional prerequisite that must be established at the inception of the suit.

II. STATEMENT OF FACTS

[CASE_FACTS]

III. LEGAL ARGUMENT

A. Standing Must Be Established at Inception

Under Maryland law, "standing" requires that the party invoking the court's jurisdiction must have suffered an injury-in-fact that is fairly traceable to the defendant's conduct. Specifically in foreclosure actions, the plaintiff must demonstrate actual possession of the Note or be entitled to enforce under UCC § 3-301.

B. Chain of Title Defects

[Insert specific chain of title issues - missing assignments, MERS issues, etc.]

C. Holder Status Not Established

The Plaintiff has failed to produce evidence that it is the "holder" of the Note as defined by Md. Commercial Law § 1-201(b)(21).

IV. CONCLUSION

WHEREFORE, Defendant respectfully requests that this Honorable Court:
1. Dismiss the Complaint with prejudice;
2. Award Defendant costs; and
3. Grant such other relief as the Court deems just.

Respectfully submitted,

____________________
[DEFENDANT NAME]
Pro Se
[ADDRESS]
[PHONE]
[EMAIL]`
        },
        {
            id: 'compel_discovery',
            name: 'Motion to Compel Discovery',
            category: 'Discovery',
            description: 'Force opposing party to respond to outstanding discovery requests.',
            template: `MOTION TO COMPEL DISCOVERY RESPONSES

COMES NOW the Defendant, appearing pro se, and moves this Court for an Order compelling Plaintiff to provide complete responses to Defendant's outstanding discovery requests, and in support thereof states:

I. BACKGROUND

1. On [DATE], Defendant served Plaintiff with [Interrogatories / Requests for Production].

2. Plaintiff's responses were due on [DUE DATE].

3. As of this filing, Plaintiff has either (a) failed to respond, or (b) provided evasive/incomplete responses.

II. OUTSTANDING DISCOVERY

The following discovery remains deficient:

[DISCOVERY_ITEMS]

III. GOOD FAITH EFFORT

Defendant contacted Plaintiff's counsel on [DATE] via [method] in an attempt to resolve this matter without Court intervention. [Describe response or lack thereof].

IV. LEGAL STANDARD

Maryland Rule 2-432 provides that a party may move for an order compelling discovery when another party fails to answer.

V. RELIEF REQUESTED

WHEREFORE, Defendant respectfully requests:
1. An Order compelling complete responses within 10 days;
2. Sanctions pursuant to Md. Rule 2-433; and
3. Such other relief as the Court deems appropriate.

Respectfully submitted,

____________________
[DEFENDANT NAME]
Pro Se`
        },
        {
            id: 'reconsider',
            name: 'Motion for Reconsideration',
            category: 'Post-Judgment',
            description: 'Request court to revisit a prior ruling based on legal error or new evidence.',
            template: `MOTION FOR RECONSIDERATION

COMES NOW the Defendant, appearing pro se, and respectfully moves this Honorable Court to reconsider its [Order/Ruling] dated [DATE], and in support thereof states:

I. PROCEDURAL POSTURE

1. On [DATE], this Court entered an Order [describe the ruling].

2. The Defendant timely files this Motion within 30 days of said Order.

II. GROUNDS FOR RECONSIDERATION

A motion for reconsideration may be granted where: 
(1) there has been an intervening change in law;
(2) new evidence is available; or 
(3) the court's prior ruling was clearly erroneous.

[CASE_FACTS]

III. ARGUMENT

[Explain why the ruling should be reconsidered - cite specific errors, new evidence, or overlooked arguments]

IV. CONCLUSION

WHEREFORE, Defendant respectfully requests that this Court:
1. Grant this Motion for Reconsideration;
2. Vacate or Amend the [Order] dated [DATE]; and
3. Grant such other relief as the Court deems just.

Respectfully submitted,

____________________
[DEFENDANT NAME]
Pro Se`
        },
        {
            id: 'stay',
            name: 'Motion to Stay Proceedings',
            category: 'Procedural',
            description: 'Pause case proceedings pending appeal, bankruptcy, or related matter.',
            template: `MOTION TO STAY PROCEEDINGS

COMES NOW the Defendant, appearing pro se, and moves this Honorable Court to stay all proceedings in this matter pending [resolution of appeal / bankruptcy proceedings / related litigation], and in support thereof states:

I. INTRODUCTION

1. [Describe the pending matter that warrants a stay]

2. A stay is warranted to prevent prejudice and conserve judicial resources.

II. LEGAL STANDARD

Courts have inherent authority to manage their dockets, including the power to stay proceedings. A stay is appropriate when:
- There is a pending matter that may be dispositive;
- Proceeding now would cause undue burden or prejudice;
- The interests of judicial economy favor a stay.

III. ARGUMENT

[CASE_FACTS]

[Explain why a stay is necessary - risk of inconsistent rulings, waste of resources, etc.]

IV. CONCLUSION

WHEREFORE, Defendant respectfully requests that this Court:
1. Stay all proceedings pending [specific resolution];
2. Set a status conference date; and
3. Grant such other relief as the Court deems just.

Respectfully submitted,

____________________
[DEFENDANT NAME]
Pro Se`
        }
    ]

    const handleGenerate = () => {
        if (!selectedMotion) return
        setIsGenerating(true)

        setTimeout(() => {
            let content = selectedMotion.template
            if (caseFacts.trim()) {
                content = content.replace('[CASE_FACTS]', caseFacts)
            }
            content = content
                .replace('[DATE]', new Date().toLocaleDateString())
                .replace('[DUE DATE]', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString())

            setDraftContent(content)
            setIsGenerating(false)
        }, 1500)
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(draftContent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleExport = () => {
        const blob = new Blob([draftContent], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedMotion?.name.replace(/\s+/g, '_')}_Draft.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    const categories = [...new Set(MOTION_TEMPLATES.map(m => m.category))]

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-7 h-7 text-primary" />
                        Motion Drafter
                    </h2>
                    <p className="text-muted-foreground mt-1">Generate court-ready motion templates instantly.</p>
                </div>
                {draftContent && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-6 h-[calc(100%-6rem)]">
                {/* Motion Selector */}
                <div className="bg-card border border-white/5 rounded-xl p-5 overflow-y-auto">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Select Motion Type</h3>

                    {categories.map(category => (
                        <div key={category} className="mb-6">
                            <div className="text-xs text-muted-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <ChevronDown className="w-3 h-3" />
                                {category}
                            </div>
                            <div className="space-y-2">
                                {MOTION_TEMPLATES.filter(m => m.category === category).map(motion => (
                                    <button
                                        key={motion.id}
                                        onClick={() => { setSelectedMotion(motion); setDraftContent('') }}
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${selectedMotion?.id === motion.id
                                                ? 'bg-primary/20 border-primary text-primary'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="font-medium text-sm">{motion.name}</div>
                                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{motion.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input & Generate */}
                <div className="bg-card border border-white/5 rounded-xl p-5 flex flex-col">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                        <BookOpen className="w-4 h-4 inline mr-2" />
                        Case Context
                    </h3>

                    {selectedMotion ? (
                        <>
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
                                <div className="text-blue-300 font-medium text-sm">{selectedMotion.name}</div>
                                <div className="text-blue-200/60 text-xs mt-1">{selectedMotion.description}</div>
                            </div>

                            <label className="text-sm text-muted-foreground mb-2">
                                Paste relevant case facts (optional):
                            </label>
                            <textarea
                                ref={textareaRef}
                                value={caseFacts}
                                onChange={(e) => setCaseFacts(e.target.value)}
                                placeholder="E.g., The Note was assigned to ABC Trust on 01/15/2020, but the Trust closed on 01/01/2010..."
                                className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                            />

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5" />
                                        Generate Draft
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50">
                            <FileText className="w-12 h-12 mb-3" />
                            <p className="text-center text-sm">Select a motion type to begin drafting.</p>
                        </div>
                    )}
                </div>

                {/* Preview */}
                <div className="bg-card border border-white/5 rounded-xl p-5 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                            Draft Preview
                        </h3>
                        {draftContent && (
                            <button
                                onClick={handleGenerate}
                                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-white transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Regenerate
                            </button>
                        )}
                    </div>

                    {draftContent ? (
                        <div className="flex-1 overflow-y-auto bg-black/30 border border-white/10 rounded-lg p-4 font-mono text-xs whitespace-pre-wrap text-muted-foreground leading-relaxed">
                            {draftContent}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/30 border border-dashed border-white/10 rounded-lg">
                            <Wand2 className="w-10 h-10 mb-3" />
                            <p className="text-sm">Your draft will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
