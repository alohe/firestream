"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function updateUserRole(userId: string, role: "ADMIN" | "USER") {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { 
        role: role
      },
    });
    revalidatePath("/overview");
    return user;
  } catch (error) {
    console.error("Failed to update user role:", error);
    throw new Error("Failed to update user role");
  }
}

export async function deleteUser(userId: string) {
  try {
    await db.user.delete({
      where: { id: userId },
    });
    revalidatePath("/overview");
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error("Failed to delete user");
  }
}
