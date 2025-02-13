import { Card } from "@/components/ui/card";
import ApiKeysManager from "../_components/api-keys-manager";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function KeysPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    return (
        <div className="container py-8">
            <Card>
                <ApiKeysManager />
            </Card>
        </div>
    );
}
