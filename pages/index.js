import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  // Player state
  const [player, setPlayer] = useState({
    muskCount: 0,
    cpc: 1,
    cps: 0,
    goldenMusk: 0,
    clicks: 0,
    fallingGrabbed: 0,
    elonLevel: 1,
    grimesLevel: 0,
    prestigeLevel: 0,
    nfts: [], // Stubbed NFT ownership
  });
  const [drops, setDrops] = useState([]);
  const [fallingId, setFallingId] = useState(0);
  const [tasks, setTasks] = useState({});
  const [lastClaimDate, setLastClaimDate] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTasks = localStorage.getItem('completedTasks');
      const savedDate = localStorage.getItem('lastClaimDate');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedDate) setLastClaimDate(savedDate);
    }
  }, []);

  // CPS interval with NFT boost
  useEffect(() => {
    const cpsInterval = setInterval(() => {
      if (player.cps > 0) {
        const nftCpsBoost = player.nfts.includes('tesla-coil') ? 1.5 : 1; // +50% CPS
        setPlayer((p) => ({
          ...p,
          muskCount: p.muskCount + (p.cps * (1 + p.prestigeLevel * 0.1) * nftCpsBoost) / 10,
        }));
      }
    }, 100);
    return () => clearInterval(cpsInterval);
  }, [player.cps, player.prestigeLevel, player.nfts]);

  // Save tasks to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('completedTasks', JSON.stringify(tasks));
      localStorage.setItem('lastClaimDate', lastClaimDate);
    }
  }, [tasks, lastClaimDate]);

  // Click handler with NFT boost
  const handleClick = (e) => {
    const nftCpcBoost = player.nfts.includes('tesla-coil') ? 1.5 : 1; // +50% CPC
    const cpcWithPrestige = player.cpc * (1 + player.prestigeLevel * 0.1) * nftCpcBoost;
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount + cpcWithPrestige,
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

  // Falling $MUSK with NFT boost
  const fallingMusk = () => {
    const roll = Math.ceil(Math.random() * 100);
    console.log(`Falling roll: ${roll}`);
    if (roll > 1) return; // 1% chance
    const type = 'musk';
    const nftCpcBoost = player.nfts.includes('tesla-coil') ? 1.5 : 1;
    const rewardVariation = (Math.ceil(Math.random() * 1500) + 500) / 100;
    const amount = Math.round(player.cpc * rewardVariation * (1 + player.prestigeLevel * 0.1) * nftCpcBoost);

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

  // Upgrade Elon
  const upgradeElon = () => {
    const price = Math.floor(100 * Math.pow(1.11, player.elonLevel - 1));
    if (player.muskCount < price) return;
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount - price,
      elonLevel: p.elonLevel + 1,
      cpc: p.elonLevel + 1,
    }));
  };

  // Hire/Upgrade Grimes
  const upgradeGrimes = () => {
    const hireCost = 200;
    const levelCost = Math.floor(200 * Math.pow(1.058, player.grimesLevel));
    const price = player.grimesLevel === 0 ? hireCost : levelCost;
    if (player.muskCount < price) return;
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount - price,
      grimesLevel: p.grimesLevel + 1,
      cps: p.cps + 1,
    }));
  };

  // Prestige
  const prestige = () => {
    if (player.muskCount < 10000) return;
    const goldenEarned = Math.floor(player.muskCount / 10000);
    setPlayer((p) => ({
      muskCount: 0,
      cpc: 1,
      cps: 0,
      goldenMusk: p.goldenMusk + goldenEarned,
      clicks: 0,
      fallingGrabbed: 0,
      elonLevel: 1,
      grimesLevel: 0,
      prestigeLevel: p.prestigeLevel + 1,
      nfts: p.nfts, // Persist NFTs across prestige
    }));
    setDrops([]);
    setTasks({});
    setLastClaimDate('');
    if (typeof window !== 'undefined') {
      localStorage.setItem('completedTasks', JSON.stringify({}));
      localStorage.setItem('lastClaimDate', '');
    }
  };

  // Stub NFT purchase
  const buyNFT = (nftId) => {
    const price = 5000; // Placeholder—$MUSK cost
    if (player.muskCount < price || player.nfts.includes(nftId)) return;
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount - price,
      nfts: [...p.nfts, nftId],
    }));
  };

  // Task handler
  const startTask = (taskId, taskUrl) => {
    const today = new Date().toISOString().split('T')[0];
    if (tasks[taskId] === today) {
      alert('You’ve already completed this task today.');
      return;
    }
    window.open(taskUrl, '_blank');
    setTimeout(() => {
      setTasks((t) => ({ ...t, [taskId]: today }));
    }, 5000);
  };

  // Claim daily reward
  const claimReward = () => {
    const today = new Date().toISOString().split('T')[0];
    if (lastClaimDate === today) {
      alert('You can only claim once a day.');
      return;
    }
    const taskIds = ['task-x-post'];
    const allCompleted = taskIds.every((id) => tasks[id] === today);
    if (!allCompleted) return;
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount + 200,
    }));
    setLastClaimDate(today);
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <Head>
        <title>MuskCoin Tapper</title>
      </Head>
      <h1>MuskCoin Tapper</h1>
      <div id="musk_Count">{Math.floor(player.muskCount)} $MUSK</div>
      <p>Golden $MUSK: {player.goldenMusk} | Prestige Level: {player.prestigeLevel}</p>
      <button id="main_musk" onClick={handleClick}>
        Tap for $MUSK!
      </button>
      <div>
        <p>Elon Level: {player.elonLevel} | CPC: {(player.cpc * (1 + player.prestigeLevel * 0.1) * (player.nfts.includes('tesla-coil') ? 1.5 : 1)).toFixed(1)}</p>
        <button
          onClick={upgradeElon}
          disabled={player.muskCount < Math.floor(100 * Math.pow(1.11, player.elonLevel - 1))}
        >
          Upgrade Elon (Cost: {Math.floor(100 * Math.pow(1.11, player.elonLevel - 1))} $MUSK)
        </button>
      </div>
      <div>
        <p>Grimes Level: {player.grimesLevel} | CPS: {(player.cps * (1 + player.prestigeLevel * 0.1) * (player.nfts.includes('tesla-coil') ? 1.5 : 1)).toFixed(1)}</p>
        <button
          onClick={upgradeGrimes}
          disabled={
            player.muskCount <
            (player.grimesLevel === 0 ? 200 : Math.floor(200 * Math.pow(1.058, player.grimesLevel)))
          }
        >
          {player.grimesLevel === 0
            ? 'Hire Grimes (200 $MUSK)'
            : `Upgrade Grimes (Cost: ${Math.floor(200 * Math.pow(1.058, player.grimesLevel))} $MUSK)`}
        </button>
      </div>
      <div>
        <button onClick={prestige} disabled={player.muskCount < 10000}>
          Prestige (Reset for {Math.floor(player.muskCount / 10000)} Golden $MUSK)
        </button>
      </div>
      <div>
        <h2>NFTs</h2>
        <p>Tesla Coil: +50% CPC & CPS {player.nfts.includes('tesla-coil') ? '(Owned)' : ''}</p>
        <button
          onClick={() => buyNFT('tesla-coil')}
          disabled={player.muskCount < 5000 || player.nfts.includes('tesla-coil')}
        >
          Buy Tesla Coil (5000 $MUSK)
        </button>
      </div>
      <div>
        <h2>Daily Tasks</h2>
        <div id="task-x-post">
          <p>Post on X: &quot;Loving #MUSK Tapper!&quot;</p>
          <button
            onClick={() => startTask('task-x-post', 'https://x.com')}
            disabled={tasks['task-x-post'] === new Date().toISOString().split('T')[0]}
          >
            {tasks['task-x-post'] === new Date().toISOString().split('T')[0] ? 'Done' : 'Start'}
          </button>
        </div>
        <button
          onClick={claimReward}
          disabled={
            tasks['task-x-post'] !== new Date().toISOString().split('T')[0] ||
            lastClaimDate === new Date().toISOString().split('T')[0]
          }
        >
          Claim 200 $MUSK
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