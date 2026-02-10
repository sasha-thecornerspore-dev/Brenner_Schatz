import { useState, useEffect } from 'react'
import {
    Gavel, AlertTriangle, FileSearch, Calendar, TrendingUp,
    CheckCircle, XCircle, Clock, Filter, Search, ArrowUpRight,
    Scale, FileText, Users, DollarSign
} from 'lucide-react'

export function CaseAnalytics() {
    const [timeRange, setTimeRange] = useState('all')
    const [animatedStats, setAnimatedStats] = useState({ motions: 0, wins: 0, pending: 0 })

    // Animate stats on mount
    useEffect(() => {
        const targets = { motions: 12, wins: 8, pending: 3 }
        const duration = 1500
        const steps = 60
        const interval = duration / steps

        let current = { motions: 0, wins: 0, pending: 0 }
        const increments = {
            motions: targets.motions / steps,
            wins: targets.wins / steps,
            pending: targets.pending / steps
        }

        const timer = setInterval(() => {
            current = {
                motions: Math.min(current.motions + increments.motions, targets.motions),
                wins: Math.min(current.wins + increments.wins, targets.wins),
                pending: Math.min(current.pending + increments.pending, targets.pending)
            }
            setAnimatedStats({
                motions: Math.round(current.motions),
                wins: Math.round(current.wins),
                pending: Math.round(current.pending)
            })
            if (current.motions >= targets.motions) clearInterval(timer)
        }, interval)

        return () => clearInterval(timer)
    }, [])

    const CASE_EVENTS = [
        { date: '2026-01-13', type: 'hearing', title: 'Hearing on MSJ', status: 'completed', icon: Gavel },
        { date: '2025-11-19', type: 'motion', title: 'Motion to Waive Filing Fee', status: 'pending', icon: FileText },
        { date: '2025-11-01', type: 'order', title: 'Foreclosure Sale Scheduled', status: 'adverse', icon: AlertTriangle },
        { date: '2025-10-15', type: 'discovery', title: 'Request for Production', status: 'completed', icon: FileSearch },
        { date: '2025-09-20', type: 'motion', title: 'Motion to Stay', status: 'pending', icon: Clock },
    ]

    const OPPOSING_COUNSEL = {
        firm: 'Law Offices of Daniel Herbst',
        attorney: 'Daniel Herbst, Esq.',
        responseRate: 'About Average',
        avgResponseTime: '15-20 days',
        commonTactics: ['Procedural Delays', 'Standing Challenges', 'Lost Note Affidavits']
        // Updated based on case context (Schatz/Herbst)
    }

    const FINANCIAL_SUMMARY = {
        principal: 580000, // Estimated
        alleged: 625450,
        disputed: 45450, // Fees/Interest
        fees: 18500
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-7 h-7 text-primary" />
                        Case Analytics
                    </h2>
                    <p className="text-muted-foreground mt-1">Deep insights into your case performance and patterns.</p>
                </div>
                <div className="flex bg-white/5 rounded-lg p-1">
                    {['week', 'month', 'all'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-1.5 text-sm rounded-md transition-all ${timeRange === range
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-white'
                                }`}
                        >
                            {range === 'all' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    icon={<FileText className="w-5 h-5" />}
                    label="Motions Filed"
                    value={animatedStats.motions}
                    color="blue"
                />
                <StatCard
                    icon={<CheckCircle className="w-5 h-5" />}
                    label="Favorable Rulings"
                    value={animatedStats.wins}
                    color="green"
                    suffix={`/ ${animatedStats.motions}`}
                />
                <StatCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Pending Matters"
                    value={animatedStats.pending}
                    color="amber"
                />
                <StatCard
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Disputed Amount"
                    value={`$${FINANCIAL_SUMMARY.disputed.toLocaleString()}`}
                    color="purple"
                    small
                />
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Case Timeline */}
                <div className="col-span-2 bg-card border border-white/5 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Case Timeline</h3>
                        <div className="flex gap-2">
                            <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors">
                                <Filter className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors">
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {CASE_EVENTS.map((event, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${event.status === 'favorable' ? 'bg-green-500/20 text-green-400' :
                                    event.status === 'adverse' ? 'bg-red-500/20 text-red-400' :
                                        event.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    <event.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{event.title}</div>
                                    <div className="text-xs text-muted-foreground">{event.date}</div>
                                </div>
                                <div className={`text-xs px-2 py-1 rounded-full ${event.status === 'favorable' ? 'bg-green-500/20 text-green-400' :
                                    event.status === 'adverse' ? 'bg-red-500/20 text-red-400' :
                                        event.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {event.status}
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Opposing Counsel Intel */}
                <div className="bg-card border border-white/5 rounded-xl p-5">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-400" />
                        Opposing Counsel Intel
                    </h3>

                    <div className="space-y-4">
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="text-xs text-red-400/80 mb-1">Firm</div>
                            <div className="font-medium text-sm">{OPPOSING_COUNSEL.firm}</div>
                            <div className="text-xs text-muted-foreground mt-1">{OPPOSING_COUNSEL.attorney}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white/5 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Response Rate</div>
                                <div className="font-bold text-lg">{OPPOSING_COUNSEL.responseRate}</div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Avg Response</div>
                                <div className="font-bold text-lg">{OPPOSING_COUNSEL.avgResponseTime}</div>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-muted-foreground mb-2">Common Tactics</div>
                            <div className="flex flex-wrap gap-2">
                                {OPPOSING_COUNSEL.commonTactics.map((tactic, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full border border-amber-500/20">
                                        {tactic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-card border border-white/5 rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    Financial Breakdown
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    <FinancialItem label="Original Principal" value={FINANCIAL_SUMMARY.principal} />
                    <FinancialItem label="Alleged Balance" value={FINANCIAL_SUMMARY.alleged} variant="warning" />
                    <FinancialItem label="Disputed Amount" value={FINANCIAL_SUMMARY.disputed} variant="danger" />
                    <FinancialItem label="Alleged Fees/Costs" value={FINANCIAL_SUMMARY.fees} variant="muted" />
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, color, suffix, small }) {
    const colors = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    }

    return (
        <div className={`p-4 rounded-xl border ${colors[color]}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</span>
            </div>
            <div className={`font-bold ${small ? 'text-xl' : 'text-3xl'}`}>
                {value}
                {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
            </div>
        </div>
    )
}

function FinancialItem({ label, value, variant = 'default' }) {
    const variants = {
        default: 'text-white',
        warning: 'text-amber-400',
        danger: 'text-red-400',
        muted: 'text-muted-foreground'
    }

    return (
        <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-xs text-muted-foreground mb-2">{label}</div>
            <div className={`text-xl font-bold ${variants[variant]}`}>
                ${value.toLocaleString()}
            </div>
        </div>
    )
}
