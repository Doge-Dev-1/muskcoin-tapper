import React from 'react';
import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [muskCount, setMuskCount] = useState(0);

  const handleClick = () => {
    setMuskCount(muskCount + 1);
  };

  return (
    <div>
      <Head>
        <title>MuskCoin Tapper</title>
      </Head>
      <h1>MuskCoin Tapper</h1>
      <div id="musk_Count">{muskCount} $MUSK</div>
      <button id="main_musk" onClick={handleClick}>
        Tap for $MUSK!
      </button>
    </div>
  );
}