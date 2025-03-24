import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  // Player state (from Player class)
  const [player, setPlayer] = useState({
    muskCount: 0,        // puppys
    cpc: 1,             // clicks per click
    cps: 0,             // clicks per second
    goldenMusk: 0,      // golden_puppys
    clicks: 0,          // total clicks
    fallingGrabbed: 0,  // falling_puppys_grabbed
    elonLevel: 1,       // From Boomer_Bill.lvl
  });
  const [drops, setDrops] = useState([]);
  const [fallingId, setFallingId] = useState(0);

  // CPS interval (from puppysPerSecond)
  useEffect(() => {
    const cpsInterval = setInterval(() => {
      if (player.cps > 0) {
        setPlayer((p) => ({
          ...p,
          muskCount: p.muskCount + p.cps / 10,
        }));
      }
    }, 100);
    return () => clearInterval(cpsInterval);
  }, [player.cps]);

  // Click handler
  const handleClick = (e) => {
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount + p.cpc,
      clicks: p.clicks + 1,
    }));
    const newDrop = {
      id: Date.now(),
      x: e.clientX + (Math.random() * 20 - 10),
      y: e.clientY + (Math.random() * 20 - 10),
      type: 'click',
    };
    setDrops((d) => [...d, newDrop]);
    setTimeout(() => {
      setDrops((d) => d.filter((drop) => drop.id !== newDrop.id));
    }, 1000);
    fallingMusk();
  };

  // Falling $MUSK (from fallingpuppy)
  const fallingMusk = () => {
    const roll = Math.ceil(Math.random() * 100);
    console.log(`Falling roll: ${roll}`);
    if (roll > 50) return; // 50% for testing
    const type = 'musk';
    const rewardVariation = (Math.ceil(Math.random() * 1500) + 500) / 100;
    const amount = Math.round(player.cpc * rewardVariation);

    const fallingDrop = {
      id: fallingId,
      x: Math.floor(Math.random() * 324),
      type,
      amount,
    };
    console.log(`Falling drop: +${amount} at x:${fallingDrop.x}`);
    setFallingId(fallingId + 1);
    setDrops((d) => [...d, fallingDrop]);
    setTimeout(() => {
      setDrops((d) => d.filter((drop) => drop.id !== fallingDrop.id));
    }, 2600);
  };

  // Catch falling $MUSK
  const catchMusk = (id, amount) => {
    setDrops((prevDrops) => {
      const newDrops = prevDrops.filter((drop) => drop.id !== id);
      setPlayer((p) => {
        const newCount = p.muskCount + amount;
        console.log(`Caught: +${amount}, new total: ${newCount}`);
        return {
          ...p,
          muskCount: newCount,
          fallingGrabbed: p.fallingGrabbed + 1,
        };
      });
      return newDrops;
    });
  };

  // Upgrade Elon (from levelUp)
  const upgradeElon = () => {
    const price = Math.floor(100 * Math.pow(1.11, player.elonLevel - 1)); // From getLevelPrice, simplified
    if (player.muskCount < price) return; // Not enough $MUSK
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount - price,
      elonLevel: p.elonLevel + 1,
      cpc: p.elonLevel + 1, // CPC scales with level
    }));
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <Head>
        <title>MuskCoin Tapper</title>
      </Head>
      <h1>MuskCoin Tapper</h1>
      <div id="musk_Count">{Math.floor(player.muskCount)} $MUSK</div>
      <button id="main_musk" onClick={handleClick}>
        Tap for $MUSK!
      </button>
      <div>
        <p>Elon Level: {player.elonLevel} | CPC: {player.cpc}</p>
        <button
          onClick={upgradeElon}
          disabled={player.muskCount < Math.floor(100 * Math.pow(1.11, player.elonLevel - 1))}
        >
          Upgrade Elon (Cost: {Math.floor(100 * Math.pow(1.11, player.elonLevel - 1))} $MUSK)
        </button>
      </div>
      {drops.map((drop) => (
        <div
          key={drop.id}
          onClick={() => drop.type === 'musk' && catchMusk(drop.id, drop.amount)}
          style={{
            position: 'absolute',
            left: `${drop.x}px`,
            top: `${drop.y}px`,
            fontSize: '20px',
            color: drop.type === 'musk' ? 'gold' : 'white',
            animation: drop.type === 'musk' ? 'fadeOut 2.6s ease-out' : 'fadeOut 1s ease-out',
            cursor: drop.type === 'musk' ? 'pointer' : 'default',
          }}
        >
          {drop.type === 'musk' ? `+${Math.floor(drop.amount)}` : '+1'}
        </div>
      ))}
      <style jsx>{`
        @keyframes fadeOut {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}