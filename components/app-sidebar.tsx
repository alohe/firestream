"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Users, Key, FolderOpen, LayoutDashboard } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <Link href="/" className={cn(
                        "flex items-center gap-2 px-4 py-2 hover:bg-muted/50 rounded-md",
                        pathname === "/overview" && "bg-muted"
                    )}>
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Overview</span>
                    </Link>
                    <Link
                        href="/files"
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 hover:bg-muted/50 rounded-md",
                            pathname === "/files" && "bg-muted"
                        )}
                    >
                        <FolderOpen className="w-5 h-5" />
                        <span>Files</span>
                    </Link>
                    <Link
                        href="/users"
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 hover:bg-muted/50 rounded-md",
                            pathname === "/users" && "bg-muted"
                        )}
                    >
                        <Users className="w-5 h-5" />
                        <span>Users</span>
                    </Link>
                    <Link
                        href="/keys"
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 hover:bg-muted/50 rounded-md",
                            pathname === "/keys" && "bg-muted"
                        )}
                    >
                        <Key className="w-5 h-5" />
                        <span>API Keys</span>
                    </Link>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}
