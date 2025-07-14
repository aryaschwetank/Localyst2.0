import { NextApiRequest, NextApiResponse } from 'next'
import { useRouter } from 'next/router'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' })
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://localyst2-0.vercel.app/auth/callback',
      }),
    })  // Exchange authorization code for access token
    const tokenData = await tokenResponse.json()
    res.status(200).json(tokenData)

  } catch (error) {
    console.error('Token exchange error:', error)
    res.status(500).json({ error: 'Token exchange failed' })
  }
}