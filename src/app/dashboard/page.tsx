'use client'
import React, { useEffect, useState } from 'react'
import {
    Mic,
    Paperclip,
    Sun,
    Moon,
    Download,
    LogOut
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation'

function Dashboard() {
    const [prompt, setPrompt] = useState('')
    const [generatedImage, setGeneratedImage] = useState('')
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const { toast } = useToast()
    const [selectedModel, setSelectedModel] = useState('black-forest-labs/FLUX.1-dev')
    const router = useRouter()
    const [isDarkTheme, setIsDarkTheme] = useState(false)

    const toggleTheme = () => {
        setIsDarkTheme(prev => !prev)
    }

    useEffect(() => {
        // This code now runs only on the client side
        const savedTheme = localStorage.getItem('theme')
        setIsDarkTheme(savedTheme === 'dark')
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark')
        } else {
            document.body.classList.remove('dark')
        }
    }, [])

    useEffect(() => {
        // Update theme whenever isDarkTheme changes
        if (isDarkTheme) {
            document.body.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.body.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [isDarkTheme])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setProgress(0)
    
        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, model: selectedModel }),
            })
    
            const interval = setInterval(() => {
                setProgress((prev) => (prev >= 100 ? 100 : prev + 10))
            }, 100)
    
            const text = await response.text() // First, get the raw text response
            console.log('Raw response:', text) // Log the raw response for debugging
    
            let data
            try {
                data = JSON.parse(text) // Then try to parse it as JSON
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError)
                throw new Error('Invalid response from server')
            }
    
            clearInterval(interval)
    
            if (response.ok) {
                setGeneratedImage(data.imageUrl)
                toast({
                    title: 'Image generated successfully',
                    description: 'Your AI-generated image is ready!',
                })
            } else {
                throw new Error(data.message || 'Image generation failed')
            }
        } catch (error) {
            toast({
                title: 'Image generation failed',
                description: (error as Error).message,
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = () => {
        if (generatedImage) {
            const link = document.createElement('a')
            link.href = generatedImage
            link.download = 'generated-image.png'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const handleLogout = () => {
        // Remove the token from document.cookie
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        
        // Log the action (you can remove this in production)
        console.log('User logged out')
        
        // Redirect to login page
        router.push('/login')
        
        // Optionally, you can clear any other stored data
        localStorage.removeItem('user')
        sessionStorage.clear()
        
        // Show a toast notification
        toast({
            title: 'Logged out successfully',
            description: 'You have been logged out of your account.',
        })
    }

    return (
        <div className="h-screen w-full flex flex-col">
            <header className="sticky top-0 z-10 flex p-2 items-center gap-1 border-b bg-background px-4">
                <h1 className="text-xl font-semibold">Playground</h1>
                <div className="ml-auto flex gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5 text-sm">
                                <LogOut className="size-3.5" />
                                Logout
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will end your current session.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-sm"
                        onClick={toggleTheme}
                    >
                        {isDarkTheme ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                    </Button>
                </div>
            </header>
            <main className="p-4 h-full">
                <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
                    {generatedImage && !loading && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto gap-1.5 text-sm absolute right-3 top-3 z-50"
                            onClick={handleDownload}
                        >
                            <Download className="size-3.5" />
                            Download
                        </Button>
                    )}
                    <div className="flex-1">
                        {loading && (
                            <div className="h-full w-full flex items-center justify-center p-2">
                                <Skeleton className="h-[512px] w-[512px] border aspect-square" />
                            </div>
                        )}
                        {generatedImage && !loading && (
                            <div className="h-full w-full flex items-center justify-center p-2">
                                <img src={generatedImage} className="rounded-lg max-h-[512px] max-w-[512px] border aspect-square " alt="Generated Image" />
                            </div>
                        )}
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
                    >
                        <Label htmlFor="message" className="sr-only">
                            Message
                        </Label>
                        <Textarea
                            id="message"
                            placeholder="Type your prompt here..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            required
                            className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                        />
                        <div className="flex items-center gap-4 p-3 pt-0">
                            <Label htmlFor="model" className="sr-only">
                                Select Model
                            </Label>
                            <Select onValueChange={setSelectedModel} value={selectedModel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Models</SelectLabel>
                                        <SelectItem value="black-forest-labs/FLUX.1-dev">black-forest-labs/FLUX.1-dev</SelectItem>
                                        <SelectItem value="VideoAditor/Flux-Lora-Realism">VideoAditor/Flux-Lora-Realism</SelectItem>
                                        <SelectItem value="bingbangboom/flux_dreamscape">bingbangboom/flux_dreamscape</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Button type="submit" className="ml-auto" disabled={loading}>
                                {loading ? 'Generating...' : 'Generate Image'}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default Dashboard