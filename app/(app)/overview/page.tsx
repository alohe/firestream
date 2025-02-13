import { Card } from "@/components/ui/card";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Users, Key, FolderOpen } from "lucide-react";
import { db } from "@/lib/db";

export default async function OverviewPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const userCount = await db.user.count();
    const fileCount = await db.file.count();
    const apiKeyCount = await db.apiKey.count();

    return (
        <div className="container py-8 space-y-8">
            <h1 className="text-3xl font-bold">Overview</h1>
            <div className="grid gap-4 lg:grid-cols-3">
                <Link href="/files">
                    <Card className="p-6 hover:bg-muted/50 transition-colors relative">
                        <FolderOpen className="w-5 h-5 mb-4 absolute top-5 right-5" />
                        <h2 className="text-xl font-semibold">Files</h2>
                        <p className="text-3xl font-bold mt-2">
                            {fileCount}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Total uploaded files
                        </p>
                    </Card>
                </Link>

                <Link href="/users">
                    <Card className="p-6 hover:bg-muted/50 transition-colors relative">
                        <Users className="w-5 h-5 mb-4 absolute top-5 right-5" />
                        <h2 className="text-xl font-semibold">Users</h2>
                        <p className="text-3xl font-bold mt-2">
                            {userCount}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Total registered users
                        </p>
                    </Card>
                </Link>

                <Link href="/keys">
                    <Card className="p-6 hover:bg-muted/50 transition-colors relative">
                        <Key className="w-5 h-5 mb-4 absolute top-5 right-5" />
                        <h2 className="text-xl font-semibold">Active API Keys</h2>
                        <p className="text-3xl font-bold mt-2">
                            {apiKeyCount}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Currently active API keys
                        </p>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
