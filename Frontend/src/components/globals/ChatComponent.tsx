"use client"

import * as React from "react"
import { Send, Bot, User, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import axios from "axios"
import { v4 as uuid } from "uuid"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: String
}

export function ChatComponent() {
    const [messages, setMessages] = React.useState<Message[]>([{
        id: "1",
        role: "assistant",
        content: "Hello! I'm your [PDF] assistant. You can question me about the content of the PDF.",
        timestamp: new Date().toDateString(),
    }])

    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    React.useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        if (!input.trim() || isLoading) return

        setMessages((prev) => [
            ...prev, {
                id: uuid(),
                role: "user",
                content: input,
                timestamp: new Date().toDateString(),
            },
        ])

        try {
            axios.post("http://localhost:3000/chat", { message: input })
                .then((response) => {
                    setMessages((prev) => [
                        ...prev, {
                            id: response.data.id,
                            role: response.data.role,
                            content: response.data.answer,
                            timestamp: response.data.timestamp,
                        },
                    ])
                })
                .catch((error) => {
                    console.error("Error fetching response:", error)
                })
                .finally(() => {
                    setIsLoading(false)
                    setInput("")
                })
        }
        catch (error) {
            console.error("Error fetching response:", error)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    return (
        <div className="flex h-screen flex-col">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <h1 className="text-lg font-semibold">AI Chat Assistant</h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                    <div key={message.id} className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        {message.role === "assistant" && (
                            <Avatar className="h-8 w-8 mt-1">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    <Bot className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                        )}

                        <Card
                            className={`max-w-[80%] p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}
                        >
                            <div className="prose prose-sm max-w-none">
                                <p className="m-0 whitespace-pre-wrap">{message.content}</p>
                            </div>

                            {message.role === "assistant" && (
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                    <span className="text-xs text-muted-foreground ml-auto">
                                        {message.timestamp}
                                    </span>
                                </div>
                            )}
                        </Card>

                        {message.role === "user" && (
                            <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                <AvatarFallback>
                                    <User className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4 justify-start">
                        <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                <Bot className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                        <Card className="max-w-[80%] p-4 bg-muted">
                            <div className="flex items-center gap-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                </div>
                                <span className="text-sm text-muted-foreground">AI is thinking...</span>
                            </div>
                        </Card>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-6">
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <div className="flex-1 relative">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                            className="min-h-[60px] max-h-[200px] resize-none pr-12"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="sm"
                            className="absolute bottom-2 right-2 h-8 w-8 p-0"
                            disabled={!input.trim() || isLoading}
                        >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send message</span>
                        </Button>
                    </div>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    AI can make mistakes. Consider checking important information.
                </p>
            </div>
        </div>
    )
}