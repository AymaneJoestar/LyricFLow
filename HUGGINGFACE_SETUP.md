# Hugging Face API Setup Instructions

## Step 1: Get Your Hugging Face API Token (FREE!)

1. Go to [Hugging Face](https://huggingface.co)
2. Sign up or log in to your account  
3. Navigate to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
4. Click "New token"
5. Give it a name (e.g., "LyricFlow")
6. Select "Read" permission
7. Copy your API token

## Step 2: Add Token to .env.local

Add this line to your `.env.local` file:

```
HUGGINGFACE_API_TOKEN=hf_your_token_here
```

**Important**: Use `HUGGINGFACE_API_TOKEN` (server-side only, no VITE_ prefix needed).

Replace `hf_your_token_here` with your actual Hugging Face token (starts with `hf_`).

## Step 3: Restart the Server

After adding the token:
1. Stop the server (Ctrl+C or `taskkill /F /IM node.exe`)
2. Run `npm run start` to restart

## How It Works

The image generation now uses **Stable Diffusion XL** via Hugging Face's free inference API:

- **Model**: stabilityai/stable-diffusion-xl-base-1.0
- **Resolution**: 1024x1024px (returned as base64)
- **Generation time**: ~5-15 seconds per image
- **Cost**: ✨ **100% FREE** (with rate limits)

## Important Notes

### Free Tier Limits
- **Rate Limited**: ~1000 requests/day (plenty for personal use!)
- **Model Loading**: First request after idle may take 20-30 seconds (model needs to load)
- **Cold Start**: If you see "Model is loading", wait 20-30 seconds and try again

### Image Format
- Images are returned as **base64 data URLs** (embedded in the page)
- No external hosting needed
- Images save directly to the song data

## Testing

1. Go to any song in your library
2. Click "Generate Art" button
3. Wait 5-15 seconds for generation
4. If you see "Model is loading", wait 20 seconds and try again
5. The cover art will appear and auto-save to the song

## Troubleshooting

**Error: "Hugging Face API token not configured"**
- Make sure you added `HUGGINGFACE_API_TOKEN` to `.env.local`
- Restart the server after adding the token

**Error: "Model is loading, please try again"**
- This is normal! The model needs to "wake up"
- Wait 20-30 seconds and click "Generate Art" again
- This only happens after periods of inactivity

**Error: "429 Too Many Requests"**
- You've hit the rate limit (rare for personal use)
- Wait a few minutes before trying again
- Consider spacing out your generations

**Slow generation**
- First generation after idle: 20-30 seconds (model loading)
- Subsequent generations: 5-15 seconds
- This is normal for free tier!

## Why Hugging Face?

✅ **Completely FREE**  
✅ **No credit card required**  
✅ **High quality** (same Stable Diffusion XL as Replicate)  
✅ **Simple setup**  
✅ **Generous rate limits**  

Perfect for personal projects and getting started!
