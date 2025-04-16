import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="stylesheet" href="/styles.css?v=9" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        <style jsx global>{`
          body {
            font-family: 'Orbitron', Arial, sans-serif;
          }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}