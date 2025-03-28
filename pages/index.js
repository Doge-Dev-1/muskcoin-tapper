import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
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
    nfts: [],
    xAccount: null,
    walletAddress: null,
  });
  const [drops, setDrops] = useState([]);
  const [fallingId, setFallingId] = useState(0);
  const [tasks, setTasks] = useState({});
  const [taskClaims, setTaskClaims] = useState({});
  const muskButtonRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPlayer = localStorage.getItem('player');
      const savedTasks = localStorage.getItem('completedTasks');
      const savedTaskClaims = localStorage.getItem('taskClaims');
      if (savedPlayer) setPlayer(JSON.parse(savedPlayer));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedTaskClaims) setTaskClaims(JSON.parse(savedTaskClaims));
    }
  }, []);

  useEffect(() => {
    const cpsInterval = setInterval(() => {
      if (player.cps > 0) {
        const nftCpsBoost = player.nfts.includes('tesla-coil') ? 1.5 : 1;
        const hyperloopBoost = player.nfts.filter((id) => id === 'hyperloop').length * 0.2;
        setPlayer((p) => ({
          ...p,
          muskCount: p.muskCount + (p.cps * (1 + p.prestigeLevel * 0.1) * nftCpsBoost * (1 + hyperloopBoost)) / 10,
        }));
      }
    }, 100);
    return () => clearInterval(cpsInterval);
  }, [player.cps, player.prestigeLevel, player.nfts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('player', JSON.stringify(player));
      localStorage.setItem('completedTasks', JSON.stringify(tasks));
      localStorage.setItem('taskClaims', JSON.stringify(taskClaims));
    }
  }, [player, tasks, taskClaims]);

  const handleClick = (e) => {
    const nftCpcBoost = player.nfts.includes('tesla-coil') ? 1.5 : 1;
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

  const fallingMusk = () => {
    const roll = Math.ceil(Math.random() * 100);
    console.log(`Falling roll: ${roll}`);
    if (roll > 1) return;
    const type = 'musk';
    const nftCpcBoost = player.nfts.includes('tesla-coil') ? 1.5 : 1;
    const starshipBoost = player.nfts.includes('starship') ? 100 : 0;
    const rewardVariation = (Math.ceil(Math.random() * 1500) + 500) / 100;
    const amount = Math.round(player.cpc * rewardVariation * (1 + player.prestigeLevel * 0.1) * nftCpcBoost) + starshipBoost;

    const buttonRect = muskButtonRef.current.getBoundingClientRect();
    const buttonX = buttonRect.left + buttonRect.width / 2;
    const buttonY = buttonRect.top;

    const fallingDrop = {
      id: fallingId,
      x: buttonX + (Math.random() * 50 - 25),
      y: buttonY - 20,
      type,
      amount,
    };
    console.log(`Falling drop: +${amount} at x:${fallingDrop.x}, y:${fallingDrop.y}`);
    setFallingId(fallingId + 1);
    setDrops((d) => [...d, fallingDrop]);
    setTimeout(() => {
      setDrops((d) => d.filter((drop) => drop.id !== fallingDrop.id));
    }, 2600);
  };

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
      nfts: p.nfts,
      xAccount: p.xAccount,
      walletAddress: p.walletAddress,
    }));
    setDrops([]);
    setTasks({});
    setTaskClaims({});
    if (typeof window !== 'undefined') {
      localStorage.setItem('completedTasks', JSON.stringify({}));
      localStorage.setItem('taskClaims', JSON.stringify({}));
    }
  };

  const buyNFT = (nftId) => {
    const prices = {
      'tesla-coil': 5000,
      'hyperloop': 3000,
      'starship': 10000,
    };
    const price = prices[nftId];
    if (player.muskCount < price || (nftId === 'tesla-coil' && player.nfts.includes('tesla-coil')) || (nftId === 'starship' && player.nfts.includes('starship'))) return;
    if (!player.walletAddress) {
      alert('Please connect your Polygon wallet first!');
      return;
    }
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount - price,
      nfts: [...p.nfts, nftId],
    }));
  };

  const loginWithX = () => {
    const mockXHandle = '@MuskTapperTest';
    setPlayer((p) => ({
      ...p,
      xAccount: mockXHandle,
    }));
    alert(`Logged in as ${mockXHandle} (stubbed)`);
  };

  const connectWallet = () => {
    const mockWallet = '0x1234567890abcdef1234567890abcdef12345678';
    setPlayer((p) => ({
      ...p,
      walletAddress: mockWallet,
    }));
    alert(`Connected wallet: ${mockWallet} (stubbed)`);
  };

  const startTask = (taskId, taskUrl) => {
    const today = new Date().toISOString().split('T')[0];
    if (!player.xAccount) {
      alert('Please log in with X first!');
      return;
    }
    if (tasks[taskId] === today) {
      alert('You’ve already completed this task today.');
      return;
    }
    window.open(taskUrl, '_blank');
    setTimeout(() => {
      setTasks((t) => ({ ...t, [taskId]: today }));
    }, 5000);
  };

  const claimTaskReward = (taskId) => {
    const today = new Date().toISOString().split('T')[0];
    if (taskClaims[taskId] === today) {
      alert('You’ve already claimed this task today.');
      return;
    }
    if (tasks[taskId] !== today) {
      alert('Complete the task first!');
      return;
    }
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount + 50,
    }));
    setTaskClaims((c) => ({ ...c, [taskId]: today }));
  };

  return (
    <div className="container">
      <Head>
        <title>MuskCoin Tapper</title>
        <link rel="stylesheet" href="/styles.css?v=7" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron&display=swap" rel="stylesheet" />
      </Head>
      <h1>MuskCoin Tapper</h1>
      <div id="musk_Count" className="counter">{Math.floor(player.muskCount)} $MUSK</div>
      <p>Golden $MUSK: {player.goldenMusk} | Prestige Level: {player.prestigeLevel}</p>
      <p>X Account: {player.xAccount || 'Not logged in'}</p>
      {!player.xAccount && (
        <button onClick={loginWithX}>Login with X</button>
      )}
      <p>Wallet: {player.walletAddress || 'Not connected'}</p>
      {!player.walletAddress && (
        <button onClick={connectWallet}>Connect Polygon Wallet</button>
      )}
      <button id="main_musk" ref={muskButtonRef} onClick={handleClick}>
        Tap for $MUSK!
      </button>
      <div className="section">
        <p>Elon Level: {player.elonLevel} | CPC: {(player.cpc * (1 + player.prestigeLevel * 0.1) * (player.nfts.includes('tesla-coil') ? 1.5 : 1)).toFixed(1)}</p>
        <button
          onClick={upgradeElon}
          disabled={player.muskCount < Math.floor(100 * Math.pow(1.11, player.elonLevel - 1))}
        >
          Upgrade Elon (Cost: {Math.floor(100 * Math.pow(1.11, player.elonLevel - 1))} $MUSK)
        </button>
      </div>
      <div className="section">
        <p>Grimes Level: {player.grimesLevel} | CPS: {(player.cps * (1 + player.prestigeLevel * 0.1) * (player.nfts.includes('tesla-coil') ? 1.5 : 1) * (1 + player.nfts.filter((id) => id === 'hyperloop').length * 0.2)).toFixed(1)}</p>
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
      <div className="section">
        <button onClick={prestige} disabled={player.muskCount < 10000}>
          Prestige (Reset for {Math.floor(player.muskCount / 10000)} Golden $MUSK)
        </button>
      </div>
      <div className="section">
        <h2>NFTs</h2>
        <p>Tesla Coil: +50% CPC & CPS {player.nfts.includes('tesla-coil') ? '(Owned)' : ''}</p>
        <button
          onClick={() => buyNFT('tesla-coil')}
          disabled={player.muskCount < 5000 || player.nfts.includes('tesla-coil')}
        >
          Buy Tesla Coil (5000 $MUSK)
        </button>
        <p>Hyperloop: +20% CPS (Stackable) ({player.nfts.filter((id) => id === 'hyperloop').length} Owned)</p>
        <button
          onClick={() => buyNFT('hyperloop')}
          disabled={player.muskCount < 3000}
        >
          Buy Hyperloop (3000 $MUSK)
        </button>
        <p>Starship: +100 $MUSK per Falling Drop {player.nfts.includes('starship') ? '(Owned)' : ''}</p>
        <button
          onClick={() => buyNFT('starship')}
          disabled={player.muskCount < 10000 || player.nfts.includes('starship')}
        >
          Buy Starship (10000 $MUSK)
        </button>
      </div>
      <div className="section">
        <h2>Daily Tasks</h2>
        <div id="task-x-post">
          <p>Post on X: &quot;Loving #MUSK Tapper!&quot;</p>
          <button
            onClick={() => startTask('task-x-post', 'https://x.com')}
            disabled={tasks['task-x-post'] === new Date().toISOString().split('T')[0]}
          >
            {tasks['task-x-post'] === new Date().toISOString().split('T')[0] ? 'Done' : 'Start'}
          </button>
          <button
            onClick={() => claimTaskReward('task-x-post')}
            disabled={
              tasks['task-x-post'] !== new Date().toISOString().split('T')[0] ||
              taskClaims['task-x-post'] === new Date().toISOString().split('T')[0]
            }
          >
            Claim 50 $MUSK
          </button>
          <p>Last Claimed: {taskClaims['task-x-post'] || 'Never'}</p>
        </div>
        <div id="task-follow-elon">
          <p>Follow @ElonMusk on X</p>
          <button
            onClick={() => startTask('task-follow-elon', 'https://x.com/elonmusk')}
            disabled={tasks['task-follow-elon'] === new Date().toISOString().split('T')[0]}
          >
            {tasks['task-follow-elon'] === new Date().toISOString().split('T')[0] ? 'Done' : 'Start'}
          </button>
          <button
            onClick={() => claimTaskReward('task-follow-elon')}
            disabled={
              tasks['task-follow-elon'] !== new Date().toISOString().split('T')[0] ||
              taskClaims['task-follow-elon'] === new Date().toISOString().split('T')[0]
            }
          >
            Claim 50 $MUSK
          </button>
          <p>Last Claimed: {taskClaims['task-follow-elon'] || 'Never'}</p>
        </div>
        <div id="task-retweet-musk">
          <p>Retweet a post with #MUSK</p>
          <button
            onClick={() => startTask('task-retweet-musk', 'https://x.com/search?q=%23MUSK')}
            disabled={tasks['task-retweet-musk'] === new Date().toISOString().split('T')[0]}
          >
            {tasks['task-retweet-musk'] === new Date().toISOString().split('T')[0] ? 'Done' : 'Start'}
          </button>
          <button
            onClick={() => claimTaskReward('task-retweet-musk')}
            disabled={
              tasks['task-retweet-musk'] !== new Date().toISOString().split('T')[0] ||
              taskClaims['task-retweet-musk'] === new Date().toISOString().split('T')[0]
            }
          >
            Claim 50 $MUSK
          </button>
          <p>Last Claimed: {taskClaims['task-retweet-musk'] || 'Never'}</p>
        </div>
      </div>
      {drops.map((drop) => (
        <div
          key={drop.id}
          onClick={() => drop.type === 'musk' && catchMusk(drop.id, drop.amount)}
          className={drop.type === 'musk' ? 'musk-drop' : 'click-drop'}
          style={{ left: `${drop.x}px`, top: `${drop.y}px` }}
        >
          {drop.type === 'musk' ? `+${Math.floor(drop.amount)}` : '+1'}
        </div>
      ))}
    </div>
  );
}