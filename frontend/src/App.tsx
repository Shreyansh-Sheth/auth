import { useEffect, useState } from "react";
import * as ethers from "ethers";
import axios from "axios";
function App() {
  const [provider, setProvider] =
    useState<ethers.ethers.providers.Web3Provider>();
  const [walletAddress, useWalletAddress] = useState();
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);
  useEffect(() => {
    if (window && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum!,
        "any"
      );

      setProvider(provider);
      setIsWalletInstalled(true);
    } else {
      setIsWalletInstalled(false);
    }
  }, []);
  const address = async () => {
    if (!provider) return;
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const nonce = await getNonce(address);
    console.log(nonce);
    const signature = await signer.signMessage(nonce);
    console.log(signature);
    await verify(address, signature);
    console.log("Account:", address);
  };

  const verify = async (address: string, signature: string) => {
    const body = { signature };
    const token = await axios.post(
      `http://localhost:3001/${address}/signature`,
      body
    );

    console.log(token);
    return token;
  };
  const getNonce = async (address: string) => {
    const { nonce } = await (
      await fetch(`http://localhost:3001/${address}/nonce`)
    ).json();
    return nonce;
  };

  return (
    <div className="App">
      <div>
        <button onClick={() => address()}>Connect To Metamask</button>
      </div>
    </div>
  );
}

export default App;
