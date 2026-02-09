import { useState, useEffect, useRef } from 'react'
import { Upload, File, Folder, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { useCase } from '../context/CaseContext'

export function FileManager() {
    const { setFiles: setContextFiles } = useCase()
    const [files, setFiles] = useState([])
    const [currentPath, setCurrentPath] = useState('')
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)

    useEffect(() => {
        fetchFiles()
    }, [currentPath])

    useEffect(() => {
        setContextFiles(files)
    }, [files, setContextFiles])

    const fetchFiles = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/files?path=${encodeURIComponent(currentPath)}`)
            const data = await res.json()

            if (Array.isArray(data)) {
                // Sort: Folders first, then files
                setFiles(data.sort((a, b) => {
                    if (a.isDirectory === b.isDirectory) return 0;
                    return a.isDirectory ? -1 : 1;
                }))
            } else {
                setFiles([])
            }
        } catch (err) {
            console.error("Failed to fetch files", err)
            setFiles([])
        }
    }

    const handleNavigate = (folderName) => {
        setCurrentPath(prev => prev ? `${prev}/${folderName}` : folderName)
    }

    const handleUp = () => {
        setCurrentPath(prev => {
            if (!prev) return '';
            const parts = prev.split('/')
            parts.pop()
            return parts.join('/')
        })
    }

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('path', currentPath)

        try {
            const response = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                fetchFiles()
            } else {
                console.error('Upload failed')
            }
        } catch (error) {
            console.error('Error uploading:', error)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-card border border-white/5 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <File className="w-6 h-6 text-primary" />
                    Repository Browser
                </h2>

                {/* Navigation Bar */}
                <div className="flex items-center gap-2 mb-4 bg-white/5 p-2 rounded border border-white/10">
                    <button
                        onClick={handleUp}
                        disabled={!currentPath}
                        className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
                        title="Go Up"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="font-mono text-sm text-muted-foreground truncate">
                        root/{currentPath}
                    </div>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:bg-white/5 transition-colors cursor-pointer mb-6"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleUpload}
                    />
                    <div className="flex flex-col items-center gap-2">
                        {uploading ? (
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        ) : (
                            <Upload className="w-6 h-6 text-muted-foreground" />
                        )}
                        <div className="text-sm font-medium">
                            {uploading ? 'Uploading...' : 'Upload to this folder'}
                        </div>
                    </div>
                </div>

                {/* File List */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-muted-foreground px-3 uppercase tracking-wider">
                        <span>Name</span>
                        <span>Size</span>
                    </div>

                    {files.map((file, idx) => (
                        <div
                            key={idx}
                            onClick={() => file.isDirectory && handleNavigate(file.name)}
                            className={`flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all ${file.isDirectory ? 'cursor-pointer hover:bg-white/10' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {file.isDirectory ? (
                                    <Folder className="w-5 h-5 text-yellow-400 shrink-0" />
                                ) : (
                                    <File className="w-5 h-5 text-blue-400 shrink-0" />
                                )}
                                <span className="font-medium truncate">{file.name}</span>
                            </div>

                            <div className="text-xs text-muted-foreground shrink-0 ml-4">
                                {file.isDirectory ? '' : `${(file.size / 1024).toFixed(1)} KB`}
                            </div>
                        </div>
                    ))}

                    {files.length === 0 && (
                        <div className="text-center text-muted-foreground py-8 italic">
                            {currentPath ? 'Empty folder' : 'No files found'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
