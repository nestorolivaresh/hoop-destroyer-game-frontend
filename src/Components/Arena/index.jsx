import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformPlayerData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import "./Arena.css";
import LoadingIndicator from "../LoadingIndicator";

function Arena({ playerNFT, setPlayerNFT }) {
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState("");
  const [showToast, setShowToast] = useState(false);

  async function fetchBoss() {
    try {
      const bossTxn = await gameContract.getBoss();
      setBoss(transformPlayerData(bossTxn, true));
    } catch (err) {
      console.log("err", err);
    }
  }

  async function attackBoss() {
    try {
      if (gameContract) {
        setAttackState("attacking");
        console.log("attacking boss");
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        setAttackState("hit");

        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (err) {
      console.log("err", err);
      setAttackState("");
    }
  }

  async function onAttackComplete(updatedBossHp, updatedPlayerSp) {
    const bossHp = updatedBossHp.toNumber();
    const playerSp = updatedPlayerSp.toNumber();
    console.log(`AttackComplete: Boss Hp: ${bossHp} Player Sp: ${playerSp}`);

    setBoss((prevState) => ({ ...prevState, hp: bossHp }));
    setPlayerNFT((prevState) => ({ ...prevState, sp: playerSp }));
  }

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    if (gameContract) {
      fetchBoss();
      gameContract.on("AttackComplete", onAttackComplete);
    }

    return () => {
      if (gameContract) {
        gameContract.off("AttackComplete", onAttackComplete);
      }
    };
  }, [gameContract]);

  return (
    <div className="arena-container">
      {showToast && (
        <div id="toast" className="show">
          <div id="desc">{`💥 ${boss.name} was hit for ${playerNFT.shotAccuracy}!`}</div>
        </div>
      )}
      {/* Boss */}
      {boss && (
        <div className="boss-container">
          <div className={`boss-content ${attackState}`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
              <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={attackBoss}>
              {`💥 Attack ${boss.name}`}
            </button>
          </div>
          {attackState === "attacking" && (
            <div className="loading-indicator">
              <LoadingIndicator />
              <p>Shooting 🏀</p>
            </div>
          )}
        </div>
      )}

      {playerNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Player</h2>
            <div className="player">
              <div className="image-content">
                <h2>{playerNFT.name}</h2>
                <img
                  src={playerNFT.imageURI}
                  alt={`Character ${playerNFT.name}`}
                />
                <div className="health-bar">
                  <progress value={playerNFT.sp} max={playerNFT.maxSp} />
                  <p>{`${playerNFT.sp} / ${playerNFT.maxSp} HP`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`🏀 Shot Accuracy: ${playerNFT.shotAccuracy}`}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Arena;
