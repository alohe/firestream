'use server'

import { db } from "@/lib/db"
import { nanoid } from "nanoid"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function getApiKeys() {
  try {
    const apiKeys = await db.apiKey.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return apiKeys
  } catch (_error) {
    console.error(_error)
    throw new Error('Failed to fetch API keys')
  }
}

export async function createApiKey(name: string, permission: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const apiKey = await db.apiKey.create({
      data: {
        name,
        key: `sk_${nanoid(32)}`,
        permission,
        userId: session.user.id
      }
    })
    revalidatePath('/overview')
    return apiKey
  } catch (_error) {
    console.error(_error)
    throw new Error('Failed to create API key')
  }
}

export async function deleteApiKey(id: string) {
  try {
    await db.apiKey.delete({
      where: {
        id
      }
    })
    revalidatePath('/overview')
  } catch (_error) {
    console.error(_error)
    throw new Error('Failed to delete API key')
  }
}

export async function updateApiKeyPermission(id: string, permission: string) {
  try {
    const apiKey = await db.apiKey.update({
      where: {
        id
      },
      data: {
        permission
      }
    })
    revalidatePath('/overview')
    return apiKey
  } catch (_error) {
    console.error(_error)
    throw new Error('Failed to update API key permission')
  }
}
