import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import './App.css';



export default function App() {

  const [ currentAccount, setCurrentAccount ] = useState("")
  const [allWaves, setAllWaves] = useState([])
  const [wavesFromSomeone, setWavesFromSomeone] = useState("")
  const [waveMessage, setWaveMessage] = useState("")
  
  const contractAddress = "0xeb9738AF50ed0494D3ab1Db440419B191E8d909B";
  const contractABI = abi.abi;

  

  const checkIfWalletIsConnected = async ()=>{
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Garanta que possua a Metamask instalada!");
        return;
      } else {
        console.log("Temos o objeto ethereum", ethereum);
      }

      const accounts = await ethereum.request({method: "eth_accounts"})
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Encontrada a conta autorizada:", account);
        setCurrentAccount(account)
      } else {
        console.log("Nenhuma conta autorizada foi encontrada")
      }

      
    } catch (error) {
      console.log(error)
    }

  }

  useEffect(async () => {
    await checkIfWalletIsConnected();
    await getAllWaves()
    let wavePortalContract
    
    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };


    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }


    return () => {
      if(wavePortalContract){
        wavePortalContract.off("NewWave", onNewWave)
      }
    }
  }, [])

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
  
      if (!ethereum) {
        alert("MetaMask encontrada!");
        return;
      }
  
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  
      console.log("Conectado", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();
        console.log(waves)
        
        const wavesCleaned = waves.map(wave => {
          return {
            address: String(wave.from),
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          };
        });
        
        setAllWaves(wavesCleaned);
      } else {
        console.log("Objeto Ethereum não existe!")
      }
    } catch (error) {
      console.log(error);
    }
  }


  const verifyAddress = async (event)=>{
    const address = event.target.value
    if (address.length == 42){
      await totalWavesFrom(address)
    }
  }

  const totalWavesFrom = async (address)=>{

    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

      const totalWavesFromSomeone = await wavePortalContract.getWavesFrom(address)
      setWavesFromSomeone(totalWavesFromSomeone)
    }
  }

  
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Recuperado o número de tchauzinhos...", count.toNumber());
        
        console.log("Executando wave()")
        const txn = await wavePortalContract.wave(waveMessage);
        alert("Minerando bloco, aguarde um instante", txn.hash);

        await txn.wait();
        alert("Bloco minerado :) ", txn.hash);
        // window.location.reload(false)

        count = await wavePortalContract.getTotalWaves();
        console.log("Recuperado o número de tchauzinhos novos...", count.toNumber());
        
      } else {
        console.log("Objeto Ethereum não encontrado!");
      }
    } catch (error) {
      console.log(error)
    }

  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Olá Pessoal!
        </div>

        <div className="bio">
        Sou Antony do Brasil, Web3 Dev
        </div>

        <input placeholder="ID da pessoa para ver o total de tchauzinhos enviados"  className="waveButton" onChange={verifyAddress} />

        <h4 className="waveButton">{`Total de tchauzinhos: ${wavesFromSomeone}`}</h4>

        <input placeholder="Mensagem de tchau que quer enviar"  className="waveButton" onChange={(e)=>{setWaveMessage(e.target.value)}} />

        <button className="waveButton" onClick={wave}>
          Mandar Tchauzinho 🌟
        </button>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Conectar carteira
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Endereço: {wave.address}</div>
              <div>Data/Horário: {wave.timestamp.toString()}</div>
              <div>Mensagem: {wave.message}</div>
            </div>)
        })}


      </div>
    </div>
  );
}
