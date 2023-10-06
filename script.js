let provider, signer, gameContract;

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            const contractAddress = "0x6AADa5BC3E480Ea388e213BDDEC52b15a4435097";
            const abi = [
                {
                    "inputs": [],
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "player",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "string",
                            "name": "result",
                            "type": "string"
                        }
                    ],
                    "name": "GameResult",
                    "type": "event"
                },
                {
                    "inputs": [],
                    "name": "addBalance",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "owner",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "enum Game.Choice",
                            "name": "playerChoice",
                            "type": "uint8"
                        }
                    ],
                    "name": "play",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                }
            ];




            gameContract = new ethers.Contract(contractAddress, abi, signer);

            document.getElementById("gameControls").style.display = "block";

        } catch (error) {
            console.error("User denied access to Metamask");
        }
    } else {
        alert('Metamask needs to be installed!');
    }
}

async function playGame() {
    try {
        const choice = document.getElementById("choice").value;
        const betAmount = document.getElementById("betAmount").value;

        const tx = await gameContract.play(choice, {
            value: ethers.utils.parseEther(betAmount),
            gasLimit: 1000000
        });

        const receipt = await tx.wait();

        console.log(receipt)

        const parsedLogs = receipt.logs.map(log => {
            try {
                return gameContract.interface.parseLog(log);
            } catch (error) {
                return null;
            }
        }).filter(parsedLog => parsedLog !== null);

        for (let parsedLog of parsedLogs) {
            if (parsedLog.name === "GameResult") {
                document.getElementById("result").innerText = parsedLog.args.result;
            }
        }

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("result").innerText = "An error occurred.";
    }
}