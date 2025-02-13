'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import axios from "axios"

const API_KEY = process.env.FIRESTREAM_API_KEY
const API_URL = process.env.NEXT_PUBLIC_FIRESTREAM_API_URL

export async function getFiles() {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error('You must be signed in to access files')
    }

    const files = await db.file.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return files
  } catch (error) {
    console.error('Error fetching files:', error)
    throw new Error(error instanceof Error ? error.message : 'An error occurred while fetching files')
  }
}

export async function uploadFile(file: File) {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error('You must be signed in to upload files')
    }

    if (!API_KEY || !API_URL) {
      throw new Error('Missing API configuration')
    }

    const formData = new FormData()
    formData.append('files', file)

    const response = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'multipart/form-data'
      }
    })

    if (!response.data?.files?.[0]) {
      throw new Error('Invalid response from upload server')
    }

    revalidatePath('/overview')
    return response.data.files[0]

  } catch (error) {
    console.error('Error uploading file:', error)
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed - please check your API credentials')
      }
      if (error.response?.status === 413) {
        throw new Error('File is too large')
      }
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to upload server')
      }
    }

    throw new Error(error instanceof Error ? error.message : 'An error occurred while uploading file')
  }
}

export async function deleteFile(id: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error('You must be signed in to delete files')
    }

    if (!API_KEY || !API_URL) {
      throw new Error('Missing API configuration')
    }

    // First verify the file exists and belongs to user
    const file = await db.file.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!file) {
      throw new Error('File not found or access denied')
    }

    // Delete from database
    await db.file.delete({
      where: {
        id,
        userId: session.user.id
      }
    })

    // Attempt to delete from storage
    try {
      await axios.delete(`${API_URL}/api/files/${id}`, {
        headers: {
          'x-api-key': API_KEY
        }
      })
    } catch (storageError) {
      console.error('Warning: Failed to delete from storage:', storageError)
      // File is already deleted from DB, log warning but don't throw
    }

    revalidatePath('/overview')
  } catch (error) {
    console.error('Error deleting file:', error)
    throw new Error(error instanceof Error ? error.message : 'An error occurred while deleting file')
  }
}
