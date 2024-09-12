import { NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json() // Destructure model from request

    const response = await hf.textToImage({
      inputs: prompt,
      model: model, // Use the model from the request
    })

    // Convert the blob to a base64 string
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    return NextResponse.json({ imageUrl: dataUrl })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Image generation failed' }, { status: 500 })
  }
}