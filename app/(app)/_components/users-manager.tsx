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
import { getUsers, updateUserRole, deleteUser } from "@/app/(app)/_actions/users";
import type { User } from "@prisma/client";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";

interface UsersManagerProps {
  user: User;
}

export default function UsersManager({ user }: UsersManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData as User[]);
      } catch (err) {
        console.error(err);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (user.role !== "ADMIN") {
    return (
      <CardContent>
        <p className="text-muted-foreground">
          You do not have permission to access this section.
        </p>
      </CardContent>
    );
  }

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

  const handleRoleChange = (userId: string, role: string) => {
    updateUserRole(userId, role as "ADMIN" | "USER")
      .then(() => {
        setUsers(users.map(u => 
          u.id === userId ? {...u, role} : u
        ));
      })
      .catch(console.error);
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingId(userId);
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <CardContent>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name || "N/A"}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={u.role}
                    onValueChange={(value) => 
                      handleRoleChange(u.id, value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
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
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={deletingId === u.id || u.id === user.id}
                        className="text-destructive"
                      >
                        {deletingId === u.id ? (
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
