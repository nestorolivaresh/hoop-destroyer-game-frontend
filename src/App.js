import React, { useEffect, useState } from "react";
import { CONTRACT_ADDRESS, transformPlayerData } from "./constants";
import myEpicGame from "./utils/MyEpicGame.json";
import twitterLogo from "./assets/twitter-logo.svg";
import SelectPlayer from "./Components/SelectPlayer";
import LoadingIndicator from "./Components/LoadingIndicator";
import Arena from "./Components/Arena";
import { ethers } from "ethers";
import "./App.css";

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [playerNFT, setPlayerNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function checkIfWalletIsConnected() {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      try {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        const account = accounts[0];

        if (account) {
          setCurrentAccount(account);
        } else {
          setIsLoading(false);
          console.log("No account found");
        }
        console.log("We have the ethereum object", ethereum);
      } catch (err) {
        console.log("checkIfWalletIsConnected err: ", err);
      }
    }
  }

  async function connectWalletAction() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const [account] = await ethereum.request({
          method: "eth_requestAccounts",
        });

        if (account) {
          console.log({ account });
          setCurrentAccount(account);
        } else {
          console.log("No account found");
        }
      }
    } catch (err) {
      console.log("err", err);
    }
  }

  function renderContent() {
    if (isLoading) {
      return <LoadingIndicator />;
    }
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <div>
            <img
              src="https://media1.giphy.com/media/hpFTV3KfDXTQ9X8pEX/giphy.gif?cid=ecf05e47h6vrcqe964c0nx5v8zrw41mirjiojkro23isglgc&rid=giphy.gif&ct=g"
              alt="Minting loading indicator"
            />
          </div>
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
    } else if (currentAccount && !playerNFT) {
      console.log("here");

      return <SelectPlayer setPlayerNFT={setPlayerNFT} />;
    } else if (currentAccount && playerNFT) {
      return <Arena playerNFT={playerNFT} setPlayerNFT={setPlayerNFT} />;
    }
  }

  async function fetchNFTMetadata() {
    console.log("Checking for Character NFT on address:", currentAccount);
    const { ethereum } = window;
    if (ethereum.chainId !== "0x4") {
      alert(
        "Please change your account network to Rinkeby and reload the page to play!"
      );
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      myEpicGame.abi,
      signer
    );

    const txn = await gameContract.checkIfUserHasNFT();
    if (txn.name) {
      console.log("User has player NFT");
      setPlayerNFT(transformPlayerData(txn));
    }
    setIsLoading(false);
  }

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (currentAccount) {
      console.log("CurrentAccount:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">🏀 Hoop Destroyer 🏀</p>
          <p className="sub-text">
            Team up to score as many points as you can!
          </p>
          {renderContent()}
        </div>
        <div className="footer">
          <div className="footer-container">
            <img
              alt="Twitter Logo"
              className="twitter-logo"
              src={twitterLogo}
            />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built with @${TWITTER_HANDLE}`}</a>
          </div>
          <div>
            <a
              className="footer-text"
              href="https://twitter.com/neoh_dev"
              target="_blank"
              rel="noreferrer"
            >{`by @neoh_dev`}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
