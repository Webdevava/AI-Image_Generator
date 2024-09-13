import { NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

const fallbackModels = [
  "stabilityai/stable-diffusion-2-1",
  "runwayml/stable-diffusion-v1-5",
  "CompVis/stable-diffusion-v1-4"
]

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json()

    if (!prompt || !model) {
      return NextResponse.json({ message: 'Prompt and model are required' }, { status: 400 })
    }

    console.log(`Attempting to generate image with prompt: "${prompt}" using model: ${model}`)

    const modelsToTry = [model, ...fallbackModels]

    for (const currentModel of modelsToTry) {
      try {
        console.log(`Trying model: ${currentModel}`)
        const response = await hf.textToImage({
          inputs: prompt,
          model: currentModel,
          parameters: {
            negative_prompt: "blurry, bad anatomy, extra limbs, poorly drawn face, poorly drawn hands, missing fingers",
          },
        })

        if (!response) {
          console.log(`No response from model: ${currentModel}`)
          continue
        }

        // Convert the blob to a base64 string
        const buffer = await response.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        const dataUrl = `data:image/png;base64,${base64}`

        console.log(`Successfully generated image using model: ${currentModel}`)
        return NextResponse.json({ imageUrl: dataUrl, usedModel: currentModel })
      } catch (modelError) {
        console.error(`Error with model ${currentModel}:`, modelError)
        // Log the full error object for debugging
        console.error('Full error object:', JSON.stringify(modelError, null, 2))
      }
    }

    // If we've tried all models and none worked
    throw new Error('All models failed to generate an image')

  } catch (error) {
    console.error('Error in image generation:', error)
    // Log the full error object for debugging
    console.error('Full error object:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { message: `Image generation failed: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}