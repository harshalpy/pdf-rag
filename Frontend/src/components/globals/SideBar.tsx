"use client"

import axios from "axios"
import * as React from "react"
import { Bot, Upload  } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
    const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([])
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) 
            return;

        const formData = new FormData()
        formData.append("file", file)
        axios.post("http://localhost:3000/pdf",formData)
            .then((response) => {
                console.log("PDF uploaded successfully:", response.data)
            })
            .catch((error) => {
                console.error("Error uploading PDF:", error)
            })
        
        setUploadedFiles((prevFiles) => [...prevFiles, file])
    }

    const triggerFileUpload = () => {
        fileInputRef.current?.click()
    }

    return (
        <Sidebar className="border-r">
            <SidebarHeader className="border-b px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">PDF AI</span>
                        <span className="text-xs text-muted-foreground">Making Your Pdf Smart</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-4 py-4">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Button
                                    onClick={triggerFileUpload}
                                    className="w-full justify-start gap-2 h-10"
                                    size="sm"
                                    variant="outline"
                                >
                                    <Upload className="h-4 w-4" />
                                    Upload PDF
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {uploadedFiles.length > 0 && (
                    <SidebarGroup className="mt-4">
                        <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2">
                            Uploaded PDFs ({uploadedFiles.length})
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {uploadedFiles.map((file, index) => (
                                    <SidebarMenuItem key={index}>
                                        <SidebarMenuButton asChild className="h-auto py-2">
                                            <div className="flex flex-col items-start gap-1 cursor-pointer">
                                                <div className="flex items-center gap-2 w-full">
                                                    <div className="h-4 w-4 bg-red-100 rounded flex items-center justify-center">
                                                        <span className="text-xs font-bold text-red-600">PDF</span>
                                                    </div>
                                                    <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground ml-6">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
