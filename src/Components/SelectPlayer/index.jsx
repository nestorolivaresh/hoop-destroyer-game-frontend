import React, { useEffect, useState } from "react";
import "./SelectPlayer.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformPlayerData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import LoadingIndicator from "../LoadingIndicator";

function SelectPlayer({ setPlayerNFT }) {
  const [players, setPlayers] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingPlayer, setMintingPlayer] = useState(false);

  function callContract() {
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
  }

  async function getPlayers() {
    try {
      console.log("Getting contract players to mint");
      const playersTxn = await gameContract.getAllDefaultPlayers();
      console.log("playersTxn:", playersTxn);
      const players = playersTxn.map((playerData) =>
        transformPlayerData(playerData)
      );
      setPlayers(players);
    } catch (err) {
      console.log("err", err);
    }
  }

  function renderPlayers() {
    return players.map((player, index) => (
      <div className="character-item" key={player.name}>
        <div className="name-container">
          <p>{player.name}</p>
        </div>
        <img src={`${player.imageURI}`} alt={player.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={() => mintPlayerNFTAction(index)}
        >{`Mint ${player.name}`}</button>
      </div>
    ));
  }

  async function mintPlayerNFTAction(playerId) {
    try {
      if (gameContract) {
        setMintingPlayer(true);
        const mintTxn = await gameContract.mintPlayerNFT(playerId, {
          gasLimit: 300000,
        });
        await mintTxn.wait();
        console.log("mintTxn:", mintTxn);
        setMintingPlayer(false);
      }
    } catch (err) {
      console.log("err", err);
      setMintingPlayer(false);
    }
  }

  async function onPlayerMint(sender, tokenId, playerIndex) {
    console.log(
      `playerNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} playerIndex: ${playerIndex.toNumber()}`
    );

    if (gameContract) {
      const playerNFT = await gameContract.checkIfUserHasNFT();
      console.log("playerNFT: ", playerNFT);
      setPlayerNFT(transformPlayerData(playerNFT));
    }
  }

  useEffect(() => {
    callContract();
  }, []);

  useEffect(() => {
    if (gameContract) {
      getPlayers();
      gameContract.on("PlayerNFTMinted", onPlayerMint);
    }
    return () => {
      gameContract && gameContract.off("PlayerNFTMinted", onPlayerMint);
    };
  }, [gameContract]);

  return (
    <div className="select-character-container">
      <h2>Mint Your Player. Choose wisely.</h2>
      {players.length > 0 && (
        <div className="character-grid">{renderPlayers()}</div>
      )}
      {mintingPlayer && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
          <img
            src="https://media.giphy.com/media/3oEjI105rmEC22CJFK/giphy.gif"
            alt="Minting loading indicator"
          />
        </div>
      )}
    </div>
  );
}

export default SelectPlayer;
