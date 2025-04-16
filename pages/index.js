import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Head from 'next/head'; // Import Head from next/head
import { supabase } from '../supabase';

console.log('Using updated index.js - Version 6.9.3');

export default function Home() {
  const [player, setPlayer] = useState({
    muskCount: 0,
    cpc: 1,
    cps: 0,
    goldenMusk: 0,
    clicks: 0,
    fallingGrabbed: 0,
    elonLevel: 1,
    trumpLevel: 0,
    prestigeLevel: 0,
    nfts: [],
    xAccount: null,
    xId: null,
    walletAddress: null,
    starshipTier: 'default',
    tasks: {},
    taskClaims: {},
  });
  const [drops, setDrops] = useState([]);
  const [fallingId, setFallingId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const muskButtonRef = useRef(null);

  const nftSupply = {
    'starship-bronze': 1000,
    'starship-silver': 500,
    'starship-gold': 250,
    'starship-diamond': 100,
  };
  const [availableNFTs, setAvailableNFTs] = useState(nftSupply);

  const X_CLIENT_ID = 'ak1Va19OV25BZ2d1X1FIVDNya2g6MTpjaQ';
  const REDIRECT_URI = 'http://localhost:3000'; // Update to Vercel URL later
  const X_AUTH_URL = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${X_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=users.read%20tweet.read&state=state&code_challenge=challenge&code_challenge_method=plain`;

  // Load user data from Supabase
  const loadUserData = useCallback(async (xId) => {
    if (!xId) {
      console.log('No xId, skipping load.');
      return;
    }
    setIsLoading(true);
    try {
      console.log(`Fetching data for xId: ${xId}`);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', xId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        console.log('Loaded from Supabase:', data);
        setPlayer((p) => ({
          ...p,
          muskCount: data.musk_count || 0,
          cpc: data.cpc || 1,
          cps: data.cps || 0,
          goldenMusk: data.golden_musk || 0,
          clicks: data.clicks || 0,
          fallingGrabbed: data.falling_grabbed || 0,
          elonLevel: data.elon_level || 1,
          trumpLevel: data.trump_level || 0,
          prestigeLevel: data.prestige_level || 0,
          nfts: data.nfts || [],
          walletAddress: data.wallet_address || null,
          starshipTier: data.starship_tier || 'default',
          tasks: data.tasks || {},
          taskClaims: data.task_claims || {},
        }));
      } else {
        console.log('New user, initializing in Supabase');
        const newUser = {
          id: xId,
          x_account: player.xAccount,
          musk_count: 0,
          cpc: 1,
          cps: 0,
          golden_musk: 0,
          clicks: 0,
          falling_grabbed: 0,
          elon_level: 1,
          trump_level: 0,
          prestige_level: 0,
          nfts: [],
          wallet_address: null,
          starship_tier: 'default',
          tasks: {},
          task_claims: {},
        };
        await supabase.from('users').upsert(newUser);
        setPlayer((p) => ({
          ...p,
          ...newUser,
        }));
      }
    } catch (error) {
      console.error('Supabase load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [player.xAccount]);

  // Save data to Supabase
  const saveUserData = useCallback(async () => {
    if (!player.xId) {
      console.log('No xId, skipping save.');
      return;
    }
    if (isLoading) {
      console.log('Still loading data, skipping save to avoid overwrite.');
      return;
    }
    try {
      const dataToSave = {
        id: player.xId,
        x_account: player.xAccount,
        musk_count: player.muskCount,
        cpc: player.cpc,
        cps: player.cps,
        golden_musk: player.goldenMusk,
        clicks: player.clicks,
        falling_grabbed: player.fallingGrabbed,
        elon_level: player.elonLevel,
        trump_level: player.trumpLevel,
        prestige_level: player.prestigeLevel,
        nfts: player.nfts,
        wallet_address: player.walletAddress,
        starship_tier: player.starshipTier,
        tasks: player.tasks,
        task_claims: player.taskClaims,
      };
      console.log(`Saving data for xId: ${player.xId} Data: ${JSON.stringify(dataToSave)}`);
      const { data, error } = await supabase.from('users').upsert(dataToSave);
      if (error) throw error;
      console.log('Saved to Supabase:', data);
    } catch (error) {
      console.error('Supabase save error:', error);
    }
  }, [player, isLoading]);

  // Load user data on xId change
  useEffect(() => {
    if (player.xId) {
      loadUserData(player.xId);
    }

    // Handle X OAuth redirect
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        console.log('Handling X OAuth with code:', code);
        handleXCallback(code);
      }
    }
  }, [player.xId, loadUserData]);

  // Save data when specific fields change
  useEffect(() => {
    if (player.xId && !isLoading) {
      saveUserData();
    }
  }, [player.muskCount, player.clicks, player.taskClaims, player.xId, saveUserData, isLoading]);

  // CPS and Starship Tier Update
  useEffect(() => {
    const cpsInterval = setInterval(() => {
      if (player.cps > 0) {
        const nftCpsBoost = player.nfts.includes('tesla-coil') ? 1.5 : 1;
        const hyperloopBoost = player.nfts.filter((id) => id === 'hyperloop').length * 0.2;
        const starshipBoost = calculateStarshipBoost(player.nfts);
        const cpsIncrement = (player.cps * (1 + player.prestigeLevel * 0.1) * nftCpsBoost * (1 + hyperloopBoost) * (1 + starshipBoost)) / 10;
        if (isNaN(cpsIncrement)) return;
        setPlayer((p) => ({
          ...p,
          muskCount: p.muskCount + cpsIncrement,
        }));
      }
    }, 100);

    setPlayer((p) => {
      let newTier = 'default';
      if (p.prestigeLevel >= 75) newTier = 'diamond';
      else if (p.prestigeLevel >= 35) newTier = 'gold';
      else if (p.prestigeLevel >= 20) newTier = 'silver';
      else if (p.prestigeLevel >= 10) newTier = 'bronze';
      const imagePath = `/assets/${newTier === 'default' ? 'musk_token.png' : newTier + '_starship.png'}`;
      console.log(`Setting starshipTier to: ${newTier}, Image URL: ${imagePath}`);
      return { ...p, starshipTier: newTier };
    });

    return () => clearInterval(cpsInterval);
  }, [player.cps, player.prestigeLevel, player.nfts]);

  const handleClick = (e) => {
    const nftCpcBoost = player.nfts.includes('tesla-coil') ? 1.5 : 1;
    const starshipBoost = calculateStarshipBoost(player.nfts);
    const cpcWithPrestige = player.cpc * (1 + player.prestigeLevel * 0.1) * nftCpcBoost * (1 + starshipBoost);
    if (isNaN(cpcWithPrestige)) return;
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
    if (roll > 1) return;
    const type = 'musk';
    const nftCpcBoost = player.nfts.includes('tesla-coil') ? 1.5 : 1;
    const starshipDropBoost =
      player.nfts.includes('starship-diamond') ? 150 :
      player.nfts.includes('starship-gold') ? 100 :
      player.nfts.includes('starship-silver') ? 75 :
      player.nfts.includes('starship-bronze') ? 50 : 0;
    const rewardVariation = (Math.ceil(Math.random() * 1500) + 500) / 100;
    const amount = Math.round(player.cpc * rewardVariation * (1 + player.prestigeLevel * 0.1) * nftCpcBoost) + starshipDropBoost;
    if (isNaN(amount)) return;

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
    setFallingId(fallingId + 1);
    setDrops((d) => [...d, fallingDrop]);
    setTimeout(() => {
      setDrops((d) => d.filter((drop) => drop.id !== fallingDrop.id));
    }, 2600);
  };

  const catchMusk = (id, amount) => {
    setDrops((prevDrops) => {
      const newDrops = prevDrops.filter((drop) => drop.id !== id);
      setPlayer((p) => ({
        ...p,
        muskCount: p.muskCount + (isNaN(amount) ? 0 : amount),
        fallingGrabbed: p.fallingGrabbed + 1,
      }));
      return newDrops;
    });
  };

  const upgradeElon = () => {
    const price = Math.floor(100 * Math.pow(1.11, player.elonLevel - 1));
    if (player.muskCount < price || isNaN(price)) return;
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount - price,
      elonLevel: p.elonLevel + 1,
      cpc: p.elonLevel + 1,
    }));
  };

  const upgradeTrump = () => {
    const hireCost = 200;
    const levelCost = Math.floor(200 * Math.pow(1.058, player.trumpLevel));
    const price = player.trumpLevel === 0 ? hireCost : levelCost;
    if (player.muskCount < price || isNaN(price)) return;
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount - price,
      trumpLevel: p.trumpLevel + 1,
      cps: p.cps + 1,
    }));
  };

  const prestige = () => {
    if (player.muskCount < 10000 || isNaN(player.muskCount)) return;
    const goldenEarned = Math.floor(player.muskCount / 10000);
    setPlayer((p) => ({
      muskCount: 0,
      cpc: 1,
      cps: 0,
      goldenMusk: p.goldenMusk + goldenEarned,
      clicks: 0,
      fallingGrabbed: 0,
      elonLevel: 1,
      trumpLevel: 0,
      prestigeLevel: p.prestigeLevel + 1,
      nfts: p.nfts,
      xAccount: p.xAccount,
      xId: p.xId,
      walletAddress: p.walletAddress,
      starshipTier: p.starshipTier,
      tasks: {},
      taskClaims: {},
    }));
    setDrops([]);
  };

  const calculateStarshipBoost = (nfts) => {
    if (nfts.includes('starship-diamond')) return 0.5;
    if (nfts.includes('starship-gold')) return 0.3;
    if (nfts.includes('starship-silver')) return 0.2;
    if (nfts.includes('starship-bronze')) return 0.1;
    return 0;
  };

  const buyNFT = (nftId) => {
    const prices = {
      'tesla-coil': 5000,
      'hyperloop': 3000,
      'starship-bronze': 5000,
      'starship-silver': 7500,
      'starship-gold': 10000,
      'starship-diamond': 15000,
    };
    const price = prices[nftId];
    if (player.muskCount < price || availableNFTs[nftId] <= 0 || player.nfts.includes(nftId)) return;
    if (!player.walletAddress) {
      alert('Please connect your Polygon wallet first!');
      return;
    }
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount - price,
      nfts: [...p.nfts, nftId],
    }));
    setAvailableNFTs((a) => ({ ...a, [nftId]: a[nftId] - 1 }));
  };

  const generateNFT = (tier) => {
    const nftId = `starship-${tier}`;
    const costs = { bronze: 10000, silver: 20000, gold: 35000, diamond: 75000 };
    const minGoldenMusk = { bronze: 10, silver: 20, gold: 35, diamond: 75 };
    if (player.muskCount < costs[tier] || player.goldenMusk < minGoldenMusk[tier] || player.nfts.includes(nftId)) return;
    if (!player.walletAddress) {
      alert('Please connect your Polygon wallet first!');
      return;
    }
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount - costs[tier],
      nfts: [...p.nfts, nftId],
    }));
  };

  const loginWithX = () => {
    console.log('Attempting to redirect to X OAuth:', X_AUTH_URL);
    try {
      window.location.href = X_AUTH_URL;
    } catch (error) {
      console.error('Redirect failed:', error);
    }
  };

  const logoutFromX = () => {
    setPlayer((p) => {
      console.log(`Player state before logout: ${JSON.stringify(p)}`);
      const newState = {
        ...p,
        xAccount: null,
        xId: null,
      };
      console.log(`Player state after logout: ${JSON.stringify(newState)}`);
      return newState;
    });
    console.log('Logged out from X, cleared xAccount and xId.');
  };

  const handleXCallback = async (code) => {
    try {
      console.log('Sending POST to /api/x-auth with code:', code);
      const response = await fetch('/api/x-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
      });
      console.log('Response from /api/x-auth:', response.status, response.statusText);
      const data = await response.json();
      console.log('Data from /api/x-auth:', data);
      if (data.user) {
        console.log('User data from X:', data.user);
        setPlayer((p) => {
          const newState = {
            ...p,
            xAccount: `@${data.user.username}`,
            xId: data.user.id,
          };
          console.log(`Player state after X login: ${JSON.stringify(newState)}`);
          return newState;
        });
        alert(`Logged in as @${data.user.username}`);
        window.history.replaceState({}, document.title, REDIRECT_URI);
      } else {
        console.log('No user data in response:', data);
        alert('Login failed: No user data received.');
      }
    } catch (error) {
      console.error('X login failed:', error);
      alert('Login failed—check console for details.');
    }
  };

  const connectWallet = () => {
    const mockWallet = '0x1234567890abcdef1234567890abcdef12345678';
    setPlayer((p) => ({
      ...p,
      walletAddress: mockWallet,
    }));
    alert(`Connected wallet: ${mockWallet} (stubbed)`);
  };

  const buyPresale = () => {
    if (!player.xAccount) {
      alert('Login with X to join presale!');
      return;
    }
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount + 10,
    }));
    alert('Presale: +10 $MUSK (mock)');
  };

  const startTask = (taskId, taskUrl) => {
    const today = new Date().toISOString().split('T')[0];
    if (!player.xAccount) {
      alert('Please log in with X first!');
      return;
    }
    if (player.tasks[taskId] === today) {
      alert('You’ve already completed this task today.');
      return;
    }
    window.open(taskUrl, '_blank');
    setTimeout(() => {
      setPlayer((p) => ({
        ...p,
        tasks: { ...p.tasks, [taskId]: today },
      }));
    }, 5000);
  };

  const claimTaskReward = (taskId) => {
    const today = new Date().toISOString().split('T')[0];
    if (player.taskClaims[taskId] === today) {
      alert('You’ve already claimed this task today.');
      return;
    }
    if (player.tasks[taskId] !== today) {
      alert('Complete the task first!');
      return;
    }
    setPlayer((p) => ({
      ...p,
      muskCount: p.muskCount + 50,
      taskClaims: { ...p.taskClaims, [taskId]: today },
    }));
  };

  const buttonStyle = useMemo(() => ({
    position: 'relative',
    border: '2px solid blue',
    width: '200px',
    height: '200px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
    overflow: 'hidden',
  }), []);

  const imageStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  }), []);

  const textStyle = useMemo(() => ({
    position: 'relative',
    zIndex: 2,
    color: 'white',
    fontSize: '16px',
    textAlign: 'center',
    lineHeight: '200px',
    margin: 0,
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
  }), []);

  const tapperImage = `/assets/${player.starshipTier === 'default' ? 'musk_token.png' : player.starshipTier + '_starship.png'}`;

  useEffect(() => {
    console.log('Button style applied:', buttonStyle);
  }, [buttonStyle]);

  return (
    <div className="container">
      <Head>
        <title>MuskCoin Tapper</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>MuskCoin Tapper</h1>
      <div id="musk_Count" className="counter">{Math.floor(player.muskCount)} $MUSK</div>
      <p>Golden $MUSK: {player.goldenMusk} | Prestige Level: {player.prestigeLevel}</p>
      <p>X Account: {player.xAccount || 'Not logged in'}</p>
      <button onClick={loginWithX}>Login with X</button>
      {player.xAccount && (
        <button onClick={logoutFromX}>Logout from X</button>
      )}
      <p>Wallet: {player.walletAddress || 'Not connected'}</p>
      {!player.walletAddress && (
        <button onClick={connectWallet}>Connect Polygon Wallet</button>
      )}
      <p>Starship Tier: {player.starshipTier}</p>
      <button
        id="main_musk"
        className="main-musk-button"
        ref={muskButtonRef}
        onClick={handleClick}
        style={buttonStyle}
      >
        <img src={tapperImage} alt="Tapper Icon" style={imageStyle} />
        <span style={textStyle}>Zap for $MUSK!</span>
      </button>
      <div className="section">
        <p>Elon Level: {player.elonLevel} | CPC: {(player.cpc * (1 + player.prestigeLevel * 0.1) * (player.nfts.includes('tesla-coil') ? 1.5 : 1) * (1 + calculateStarshipBoost(player.nfts))).toFixed(1)}</p>
        <button
          onClick={upgradeElon}
          disabled={player.muskCount < Math.floor(100 * Math.pow(1.11, player.elonLevel - 1))}
        >
          Upgrade Elon (Cost: {Math.floor(100 * Math.pow(1.11, player.elonLevel - 1))} $MUSK)
        </button>
      </div>
      <div className="section">
        <p>Trump Level: {player.trumpLevel} | CPS: {(player.cps * (1 + player.prestigeLevel * 0.1) * (player.nfts.includes('tesla-coil') ? 1.5 : 1) * (1 + player.nfts.filter((id) => id === 'hyperloop').length * 0.2) * (1 + calculateStarshipBoost(player.nfts))).toFixed(1)}</p>
        <button
          onClick={upgradeTrump}
          disabled={
            player.muskCount <
            (player.trumpLevel === 0 ? 200 : Math.floor(200 * Math.pow(1.058, player.trumpLevel)))
          }
        >
          {player.trumpLevel === 0
            ? 'Hire Trump (200 $MUSK)'
            : `Upgrade Trump (Cost: ${Math.floor(200 * Math.pow(1.058, player.trumpLevel))} $MUSK)`}
        </button>
      </div>
      <div className="section">
        <button onClick={prestige} disabled={player.muskCount < 10000}>
          Prestige (Reset for {Math.floor(player.muskCount / 10000)} Golden $MUSK)
        </button>
      </div>
      <div className="section">
        <button onClick={buyPresale}>Presale: Buy 10 $MUSK</button>
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
        <p>Starship Bronze: +10% All Bonuses, +50 Drop ({availableNFTs['starship-bronze']} left) {player.nfts.includes('starship-bronze') ? '(Owned)' : ''}</p>
        <button
          onClick={() => buyNFT('starship-bronze')}
          disabled={player.muskCount < 5000 || availableNFTs['starship-bronze'] <= 0 || player.nfts.includes('starship-bronze')}
        >
          Buy (5000 $MUSK)
        </button>
        <button
          onClick={() => generateNFT('bronze')}
          disabled={player.muskCount < 10000 || player.goldenMusk < 10 || player.nfts.includes('starship-bronze')}
        >
          Generate (10000 $MUSK)
        </button>
        <p>Starship Silver: +20% All Bonuses, +75 Drop ({availableNFTs['starship-silver']} left) {player.nfts.includes('starship-silver') ? '(Owned)' : ''}</p>
        <button
          onClick={() => buyNFT('starship-silver')}
          disabled={player.muskCount < 7500 || availableNFTs['starship-silver'] <= 0 || player.nfts.includes('starship-silver')}
        >
          Buy (7500 $MUSK)
        </button>
        <button
          onClick={() => generateNFT('silver')}
          disabled={player.muskCount < 20000 || player.goldenMusk < 20 || player.nfts.includes('starship-silver')}
        >
          Generate (20000 $MUSK)
        </button>
        <p>Starship Gold: +30% All Bonuses, +100 Drop ({availableNFTs['starship-gold']} left) {player.nfts.includes('starship-gold') ? '(Owned)' : ''}</p>
        <button
          onClick={() => buyNFT('starship-gold')}
          disabled={player.muskCount < 10000 || availableNFTs['starship-gold'] <= 0 || player.nfts.includes('starship-gold')}
        >
          Buy (10000 $MUSK)
        </button>
        <button
          onClick={() => generateNFT('gold')}
          disabled={player.muskCount < 35000 || player.goldenMusk < 35 || player.nfts.includes('starship-gold')}
        >
          Generate (35000 $MUSK)
        </button>
        <p>Starship Diamond: +50% All Bonuses, +150 Drop ({availableNFTs['starship-diamond']} left) {player.nfts.includes('starship-diamond') ? '(Owned)' : ''}</p>
        <button
          onClick={() => buyNFT('starship-diamond')}
          disabled={player.muskCount < 15000 || availableNFTs['starship-diamond'] <= 0 || player.nfts.includes('starship-diamond')}
        >
          Buy (15000 $MUSK)
        </button>
        <button
          onClick={() => generateNFT('diamond')}
          disabled={player.muskCount < 75000 || player.goldenMusk < 75 || player.nfts.includes('starship-diamond')}
        >
          Generate (75000 $MUSK)
        </button>
      </div>
      <div className="section">
        <h2>Daily Tasks</h2>
        <div id="task-x-post">
          <p>Post on X: &quot;Loving #MUSK Tapper!&quot;</p>
          <button
            onClick={() => startTask('task-x-post', 'https://x.com')}
            disabled={player.tasks['task-x-post'] === new Date().toISOString().split('T')[0]}
          >
            {player.tasks['task-x-post'] === new Date().toISOString().split('T')[0] ? 'Done' : 'Start'}
          </button>
          <button
            onClick={() => claimTaskReward('task-x-post')}
            disabled={
              player.tasks['task-x-post'] !== new Date().toISOString().split('T')[0] ||
              player.taskClaims['task-x-post'] === new Date().toISOString().split('T')[0]
            }
          >
            Claim 50 $MUSK
          </button>
          <p>Last Claimed: {player.taskClaims['task-x-post'] || 'Never'}</p>
        </div>
        <div id="task-follow-elon">
          <p>Follow at ElonMusk on X</p>
          <button
            onClick={() => startTask('task-follow-elon', 'https://x.com/elonmusk')}
            disabled={player.tasks['task-follow-elon'] === new Date().toISOString().split('T')[0]}
          >
            {player.tasks['task-follow-elon'] === new Date().toISOString().split('T')[0] ? 'Done' : 'Start'}
          </button>
          <button
            onClick={() => claimTaskReward('task-follow-elon')}
            disabled={
              player.tasks['task-follow-elon'] !== new Date().toISOString().split('T')[0] ||
              player.taskClaims['task-follow-elon'] === new Date().toISOString().split('T')[0]
            }
          >
            Claim 50 $MUSK
          </button>
          <p>Last Claimed: {player.taskClaims['task-follow-elon'] || 'Never'}</p>
        </div>
        <div id="task-retweet-musk">
          <p>Retweet a post with #MUSK</p>
          <button
            onClick={() => startTask('task-retweet-musk', 'https://x.com/search?q=%23MUSK')}
            disabled={player.tasks['task-retweet-musk'] === new Date().toISOString().split('T')[0]}
          >
            {player.tasks['task-retweet-musk'] === new Date().toISOString().split('T')[0] ? 'Done' : 'Start'}
          </button>
          <button
            onClick={() => claimTaskReward('task-retweet-musk')}
            disabled={
              player.tasks['task-retweet-musk'] !== new Date().toISOString().split('T')[0] ||
              player.taskClaims['task-retweet-musk'] === new Date().toISOString().split('T')[0]
            }
          >
            Claim 50 $MUSK
          </button>
          <p>Last Claimed: {player.taskClaims['task-retweet-musk'] || 'Never'}</p>
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