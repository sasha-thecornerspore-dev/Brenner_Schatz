import { createContext, useContext, useState, useEffect } from 'react'

const CaseContext = createContext()

export function CaseProvider({ children }) {
    const [selectedCase, setSelectedCase] = useState(null)
    const [availableCases, setAvailableCases] = useState([])

    // Case Data
    const [caseName, setCaseName] = useState('')
    const [serviceDate, setServiceDate] = useState('')
    const [deadlines, setDeadlines] = useState([])
    const [files, setFiles] = useState([])
    const [defenseTheory, setDefenseTheory] = useState('')
    const [notes, setNotes] = useState([])

    // Load available cases on mount
    useEffect(() => {
        fetch('http://localhost:3001/api/cases')
            .then(res => res.json())
            .then(data => setAvailableCases(data))
            .catch(err => console.error("Failed to load cases", err))
    }, [])

    // Reset state when case changes
    useEffect(() => {
        if (selectedCase) {
            setCaseName(selectedCase.replace(/_/g, ' '))
            // Here you could also load case-specific settings if they existed
        }
    }, [selectedCase])

    // AI "Brain" - Analysis of current state
    const [aiAnalysis, setAiAnalysis] = useState({
        status: 'Unknown',
        riskLevel: 'Low',
        nextAction: 'Review Complaint',
        missingEvidence: []
    })

    // Update AI analysis whenever state changes
    useEffect(() => {
        analyzeCase()
    }, [deadlines, files, defenseTheory])

    const analyzeCase = () => {
        let status = 'Discovery Phase'
        let risk = 'Low'
        let action = 'Review Strategy'
        let missing = []

        // Deadline Analysis
        const urgentDeadlines = deadlines.filter(d => !d.isPast && d.daysRemaining < 5)
        if (urgentDeadlines.length > 0) {
            risk = 'High'
            action = `URGENT: ${urgentDeadlines[0].name} due in ${urgentDeadlines[0].daysRemaining} days!`
        }

        // Evidence Analysis
        const hasNote = files.some(f => f.name.toLowerCase().includes('note'))
        const hasAssignment = files.some(f => f.name.toLowerCase().includes('assign'))

        if (!hasNote) missing.push('Promissory Note')
        if (!hasAssignment) missing.push('Assignments of Mortgage')

        if (missing.length > 0 && defenseTheory === 'standing') {
            action = 'File Motion to Compel Production of Note'
        }

        setAiAnalysis({
            status,
            riskLevel: risk,
            nextAction: action,
            missingEvidence: missing
        })
    }

    const addNote = (text, sender = 'User') => {
        setNotes(prev => [...prev, { text, sender, time: new Date() }])
    }

    return (
        <CaseContext.Provider value={{
            selectedCase, setSelectedCase,
            availableCases,
            caseName, setCaseName,
            serviceDate, setServiceDate,
            deadlines, setDeadlines,
            files, setFiles,
            defenseTheory, setDefenseTheory,
            aiAnalysis,
            notes, addNote
        }}>
            {children}
        </CaseContext.Provider>
    )
}

export const useCase = () => useContext(CaseContext)
