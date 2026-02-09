import { useState, useEffect } from 'react'
import { addDays, format, differenceInDays } from 'date-fns'
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useCase } from '../context/CaseContext'

export function TimelineComponent() {
    const { setDeadlines: setContextDeadlines } = useCase()
    const [serviceDate, setServiceDate] = useState('')
    const [deadlines, setDeadlines] = useState([])

    // Default rules (customizable later)
    const RULES = [
        { name: 'Answer / Motion to Dismiss', days: 20, type: 'critical' },
        { name: 'Initial Disclosures', days: 45, type: 'procedural' },
        { name: 'Discovery Cutoff (Standard)', days: 180, type: 'milestone' },
        { name: 'Dispositive Motions', days: 210, type: 'critical' },
    ]

    useEffect(() => {
        if (!serviceDate) {
            setDeadlines([])
            return
        }

        const start = new Date(serviceDate)
        const calculated = RULES.map(rule => ({
            ...rule,
            date: addDays(start, rule.days),
            isPast: differenceInDays(new Date(), addDays(start, rule.days)) > 0
        })).sort((a, b) => a.date - b.date)

        setDeadlines(calculated)
        setContextDeadlines(calculated)
    }, [serviceDate, setContextDeadlines])

    return (
        <div className="space-y-6">
            <div className="bg-card border border-white/5 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    Critical Dates Calculator
                </h2>

                <div className="flex gap-4 items-end mb-8">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Date Served
                        </label>
                        <input
                            type="date"
                            className="bg-background border border-white/10 rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={serviceDate}
                            onChange={(e) => setServiceDate(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-muted-foreground pb-3">
                        Enter the date the complaint was served to generate the timeline.
                    </div>
                </div>

                <div className="space-y-4">
                    {deadlines.length > 0 ? (
                        deadlines.map((item, idx) => (
                            <TimelineItem key={idx} item={item} />
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground border border-dashed border-white/10 rounded-lg">
                            No dates calculated yet. Enter a service date above.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function TimelineItem({ item }) {
    return (
        <div className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${item.isPast
            ? 'bg-white/5 border-white/5 opacity-60'
            : item.type === 'critical'
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-card border-white/10'
            }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.isPast
                ? 'bg-white/10 text-muted-foreground'
                : item.type === 'critical'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-primary/10 text-primary'
                }`}>
                {item.isPast ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className={`font-semibold ${item.type === 'critical' ? 'text-red-400' : 'text-foreground'}`}>
                        {item.name}
                    </h4>
                    <span className="text-sm font-mono bg-white/5 px-2 py-1 rounded">
                        {format(item.date, 'MMM d, yyyy')}
                    </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                    {item.days} days from service {item.isPast && '(Past due)'}
                </div>
            </div>
        </div>
    )
}
