'use client';

import { CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { ApiKey } from "@prisma/client";
import Loader from "@/components/loader";
import { getApiKeys, createApiKey, deleteApiKey, updateApiKeyPermission } from "../_actions/keys";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermission, setNewKeyPermission] = useState("READ");
  const [error, setError] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const data = await getApiKeys();
      setApiKeys(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load API keys.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    try {
      const newKey = await createApiKey(newKeyName, newKeyPermission);
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName("");
      setNewKeyPermission("READ");
      setDialogOpen(false);
      toast.success("API key created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create API key");
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this API key? This action cannot be undone.");
    if (!confirmed) return;

    setDeletingId(keyId);
    try {
      await deleteApiKey(keyId);
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      toast.success("API key deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete API key");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePermissionChange = async (keyId: string, permission: string) => {
    try {
      const updatedKey = await updateApiKeyPermission(keyId, permission);
      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? updatedKey : key
      ));
      toast.success("Permission updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update permission");
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast("API key copied to clipboard", {
      description: "You can now paste it wherever you need it",
      duration: 2000
    });
  };

  if (error) {
    return (
      <CardContent>
        <p className="text-muted-foreground">{error}</p>
      </CardContent>
    );
  }

  if (loading) {
    return (
      <CardContent className="flex justify-center items-center min-h-[200px]">
        <Loader />
      </CardContent>
    );
  }

  return (
    <CardContent>
      <div className="flex justify-between items-center my-4">
        <div>
          <h2 className="text-2xl font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Manage API keys and their permissions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New API Key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Input
                placeholder="API Key Name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <Select
                value={newKeyPermission}
                onValueChange={setNewKeyPermission}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READ">Read</SelectItem>
                  <SelectItem value="WRITE">Write</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="FULL_ACCESS">Full Access</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateKey}>Create Key</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Permission</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell>{apiKey.name}</TableCell>
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span>
                      {revealedKey === apiKey.id ? apiKey.key : `${apiKey.key.slice(0, 8)}...${apiKey.key.slice(-4)}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyKey(apiKey.key)}
                      className="h-6 px-2"
                    >
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRevealedKey(revealedKey === apiKey.id ? null : apiKey.id)}
                      className="h-6 px-2"
                    >
                      {revealedKey === apiKey.id ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={apiKey.permission}
                    onValueChange={(value) => 
                      handlePermissionChange(apiKey.id, value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="READ">Read</SelectItem>
                      <SelectItem value="WRITE">Write</SelectItem>
                      <SelectItem value="DELETE">Delete</SelectItem>
                      <SelectItem value="FULL_ACCESS">Full Access</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(apiKey.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDeleteKey(apiKey.id)}
                        disabled={deletingId === apiKey.id}
                        className="text-destructive"
                      >
                        {deletingId === apiKey.id ? (
                          <Loader className="h-4 w-4 mr-2" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}
