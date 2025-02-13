import { Card } from "@/components/ui/card";
import UsersManager from "../_components/users-manager";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { User } from "@prisma/client";

export default async function OverviewPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    return (
        <div className="container py-8 space-y-8">
            <Card>
                <div className="p-6">
                    <h2 className="text-2xl font-semibold">User Management</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage user roles and permissions
                    </p>
                </div>
                <UsersManager user={session?.user as User} />
            </Card>


        </div>
    );
}
