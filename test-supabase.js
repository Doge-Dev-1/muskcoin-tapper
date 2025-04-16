export default {
    headers: async () => [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "connect-src 'self' https://api.twitter.com https://gjukwrlbtknwznwmshhj.supabase.co; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' data:; " +
              "script-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ],
  };