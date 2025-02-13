import FileManager from "../_components/files-manager";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function FilesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    return (
        <div className="container py-8">
            <FileManager />
        </div>
    );
}
