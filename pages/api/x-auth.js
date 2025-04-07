export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, redirect_uri } = req.body;
  const CLIENT_ID = 'ak1Va19OV25BZ2d1X1FIVDNya2g6MTpjaQ';
  const CLIENT_SECRET = process.env.X_CLIENT_SECRET;

  // Validate that CLIENT_SECRET is set
  if (!CLIENT_SECRET) {
    console.error('X_CLIENT_SECRET is not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Create the Basic Auth header
  const authString = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const base64Auth = Buffer.from(authString).toString('base64');
  const authHeader = `Basic ${base64Auth}`;

  try {
    // Step 1: Exchange code for access token
    console.log('Exchanging code for token:', code);
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri,
        code_verifier: 'challenge', // Matches code_challenge in X_AUTH_URL
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Token exchange response:', tokenData);
    if (!tokenResponse.ok) {
      throw new Error(tokenData.error || 'Token exchange failed');
    }

    // Step 2: Fetch user data using the access token
    console.log('Fetching user data with access token:', tokenData.access_token);
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    console.log('User data from X:', userData);
    if (!userResponse.ok) {
      throw new Error(userData.error || 'Failed to fetch user data');
    }

    // Step 3: Return the user data to the client
    res.status(200).json({ user: userData.data });
  } catch (error) {
    console.error('Error in /api/x-auth:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}