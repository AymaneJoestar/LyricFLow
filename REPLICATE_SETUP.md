# Replicate API Setup Instructions

## Step 1: Get Your Replicate API Token

1. Go to [Replicate](https://replicate.com)
2. Sign up or log in to your account
3. Navigate to your [Account Settings](https://replicate.com/account/api-tokens)
4. Copy your API token

## Step 2: Add Token to .env.local

Add this line to your `.env.local` file:

```
REPLICATE_API_TOKEN=your_token_here
```

**Important**: Use `REPLICATE_API_TOKEN` (not `VITE_REPLICATE_API_TOKEN`) because this is a **server-side only** token and should not be exposed to the browser.

Replace `your_token_here` with your actual Replicate API token.

## Step 3: Restart the Dev Server

After adding the token:
1. Stop the server (if running)
2. Run `npm run build` to rebuild the frontend
3. Run `npm run start` to restart the server

## How It Works

The image generation now uses **Stable Diffusion XL** via Replicate's API:

- **Model**: SDXL (Stable Diffusion XL)
- **Resolution**: 1024x1024px
- **Generation time**: ~10-30 seconds per image
- **Cost**: ~$0.003 per image (check Replicate for current pricing)

## Testing

1. Go to any song in your library
2. Click "Generate Art" button
3. Wait for the image to generate (you'll see a loading state)
4. The cover art will appear and auto-save to the song

## Troubleshooting

**Error: "Replicate API token not configured"**
- Make sure you added `VITE_REPLICATE_API_TOKEN` to `.env.local`
- Restart the dev server after adding the token

**Error: "Failed to generate cover art"**
- Check that your API token is valid
- Verify you have credits in your Replicate account
- Check the browser console for detailed error messages

**Image generation is slow**
- This is normal! Stable Diffusion takes 10-30 seconds to generate
- The loading spinner will show while it's generating
- Don't close the page while generating

## Pricing

Replicate charges per second of generation time:
- SDXL typically costs ~$0.003 per image
- You can track usage in your Replicate dashboard
- Consider adding a generation limit for free tier users

## Alternative Models

To use a different model, update the `version` in `imageService.ts`:

Current: `ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4` (SDXL)

Other options:
- Flux: Check Replicate for latest version
- Stable Diffusion 1.5: Cheaper, faster, lower quality
