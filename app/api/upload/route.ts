import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 401 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "No file received." },
        { status: 400 }
      );
    }

    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_FIRESTREAM_API_URL}/api/upload`, formData, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'multipart/form-data'
      }
    });

    return NextResponse.json({
      message: data.message,
      files: data.files
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error uploading file." },
      { status: 500 }
    );
  }
}
