import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/theme-provider";
import SessionProvider from "@/components/session-provider";  
import Logo from "@/components/logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FireStream - Open Source S3 Alternative",
  description: "A powerful file management system built with Next.js and Express, featuring secure file uploads, API key authentication, and user management.",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {user ? (
              <SidebarProvider>
                <AppSidebar />
                <div className="flex flex-col flex-1">
                  <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex h-14 items-center px-4">
                      <div className="flex flex-1 items-center justify-between">
                        <Logo />
                        <div className="flex items-center gap-4">
                          <ThemeToggle />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Avatar className="cursor-pointer">
                                <AvatarImage src={user.image} alt={user.name || 'User avatar'} />
                                <AvatarFallback className="capitalize">{user.name?.[0] || user.email?.[0]}</AvatarFallback>
                              </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <form action={async () => {
                                  'use server';
                                  await signOut();
                                }}>
                                  <Button variant="ghost" className="w-full justify-start">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign out
                                  </Button>
                                </form>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </header>
                  <main className="flex-1 px-4">
                    {children}
                  </main>
                </div>
              </SidebarProvider>
            ) : (
              <main>
                {children}
              </main>
            )}
          </SessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
