import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code } = req.body

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: '327482679565-kha6bmflarl6ol3orsvlcr3jsdrrcutn.apps.googleusercontent.com',
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: 'https://localyst2-0.vercel.app/auth/callback',
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Token exchange failed')
    }

    res.status(200).json(tokenData)
  } catch (error) {
    console.error('Token exchange error:', error)
    res.status(500).json({ error: 'Token exchange failed' })
  }
}