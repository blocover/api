import Web3 from 'web3';
import IPFS from 'ipfs';
import * as fs from 'fs';
import * as bs58 from 'bs58';

const testnetUrl = "http://localhost:9545";
let web3 = new Web3(testnetUrl);
let ipfs = new IPFS()

let accounts = [];
let blocoverAccount;
let tnxOptions;
let contract;

async function loadAccounts() {
    accounts = await web3.eth.getAccounts();
    blocoverAccount = accounts[0];
    tnxOptions = { from: blocoverAccount, gas: gasLimit };
}

async function loadContracts() {
    contract = new web3.eth.Contract(abi, existingContractAddress);
}

const abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "to",
				"type": "address"
			}
		],
		"name": "donate",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "userId",
				"type": "string"
			},
			{
				"name": "artistName",
				"type": "string"
			}
		],
		"name": "registerUser",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "songIndex",
				"type": "uint256"
			}
		],
		"name": "playByIndex",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "songs",
		"outputs": [
			{
				"name": "hash",
				"type": "bytes"
			},
			{
				"name": "playCounter",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "users",
		"outputs": [
			{
				"name": "userAddress",
				"type": "address"
			},
			{
				"name": "userId",
				"type": "string"
			},
			{
				"name": "artistName",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "songHash",
				"type": "bytes"
			}
		],
		"name": "registerSong",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "songIndex",
				"type": "uint256"
			}
		],
		"name": "getPlayCounter",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "donations",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "depositFunds",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "songIndex",
				"type": "int256"
			}
		],
		"name": "SongPlayer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "songIndex",
				"type": "int256"
			},
			{
				"indexed": false,
				"name": "songHash",
				"type": "bytes"
			}
		],
		"name": "RegisterSong",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "userIndex",
				"type": "int256"
			},
			{
				"indexed": false,
				"name": "artistName",
				"type": "string"
			}
		],
		"name": "RegisterUser",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "songIndex",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "playCounter",
				"type": "uint256"
			}
		],
		"name": "Play",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "userAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Donation",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "",
				"type": "uint256"
			}
		],
		"name": "DepositFunds",
		"type": "event"
	}
];
const existingContractAddress = "0x8cdaf0cd259887258bc13a92c0a6da92698644c0";
const gasLimit = 3000000;


/// PUBLIC FUNCTION ///
// register user
export async function registerUser(user) {
    let tnx = await contract.methods.registerUser(user.id, user.artistName).send(tnxOptions);
    return tnx;
}

// play
export async function play(songId) {
    let tnx = await contract.methods.playByIndex(songId).send(tnxOptions);
    return tnx;
}
// register song
export async function registerSong(songHash) {
    let tnx = await contract.methods.registerSong(songHash).send(tnxOptions);
    return tnx;
}
// store in IPFS and hash into Ethereum for register
export async function storeSong(fileName) {
    let path = "blockchain-client/" + fileName;

    let fileOptions = {
        path: path,
        content: fs.readFileSync(path)
    };
    // store IPFS
    let result = await ipfs.files.add(fileOptions);

    // example ipfs hash QmNqnJJ99KnhwdXR7sqcRomPw6zUkcStKnwC8fsBQnp2yK
    // has to be converted for bytes32 recognition
    let songHash = ipfsHashToBytes32(result[0].hash);

    // store Ethereum
    // example hash 0x07766cc7169f5e9bacecea0e2bb08fdc9a0beb4d57f6cb26f960e73fa94a17ee
    return registerSong(songHash);
}
// donate for address / userID  --> currenlty not working out of gas
export async function donate(userId, amount) {
    // // clone tnx options and modify
    // let payedTnxOptions = Object.assign(tnxOptions);
    // payedTnxOptions.value = "5000000";
    // let tnx = await contract.methods.donate(userId).send(payedTnxOptions);
    // return tnx;
}
export async function getUser(userId) {
    let tnx = await contract.methods.users(userId).call(tnxOptions);
    return tnx;
}
export async function getSong(songId) {
    let tnx = await contract.methods.songs(songId).call(tnxOptions);
    return tnx;
}
export async function downloadSong(songHash) {
    // TODO
}

/// HELPERS /// 
function ipfsHashToBytes32(ipfs_hash) {
    var h = bs58.decode(ipfs_hash).toString('hex').replace(/^1220/, '');
    if (h.length != 64) {
        console.log('invalid ipfs format', ipfs_hash, h);
        return null;
    }
    return '0x' + h;
}

function bytes32ToIPFSHash(hash_hex) {
    //console.log('bytes32ToIPFSHash starts with hash_buffer', hash_hex.replace(/^0x/, ''));
    var buf = new Buffer(hash_hex.replace(/^0x/, '1220'), 'hex')
    return bs58.encode(buf)
}


// /// API ///

// // curl -d '{"id":"1", "artistName":"DJ Bobo"}' -H "Content-Type: application/json" -X POST http://localhost:8080/api/registerUser
// router.post('/registerUser', async (req, res) => {
//     let result = registerUser(req.body);
//     res.json(result);
// });

// // curl -d '' -H "Content-Type: application/json" -X POST http://localhost:8080/api/play/0
// router.post('/play/:id', async (req, res) => {
//     let songId = req.params.id;
//     let result = await play(songId);
//     res.json(result);
// });

// // curl http://localhost:8080/api/donate/0/5
// router.get('/donate/:id/:amount', async (req, res) => {
//     let userId = req.params.id;
//     let amount = parseInt(req.params.amount);
//     let result = donate(userId, amount);
//     res.json(result);
// });

// // curl -d '' -H "Content-Type: application/json" -X POST http://localhost:8080/api/storeSong
// router.post('/storeSong', async (req, res) => {
//     let filename = 'meta-ukulele.mp3.txt'; // testfile stored locally
//     let result = await storeSong(filename);
//     res.json(result);
// });

// // curl http://localhost:8080/api/users/1
// router.get('/users/:id/', async (req, res) => {
//     let userId = req.params.id;
//     let result = await getUser(userId);
//     res.json(result);
// });

// // curl http://localhost:8080/api/songs/0
// router.get('/songs/:id/', async (req, res) => {
//     let songId = req.params.id;
//     let result = await getSong(songId);
//     res.json(result);
// });

// // curl http://localhost:8080/api/downloadSong/1
// router.get('/downloadSong/:hash/', async (req, res) => {
//     let songHash = req.params.hash;
//     let result = await downloadSong(songHash);
//     //res.json(result); TODO
// });


/// SETUP ETHEREUM INTERACTION ///
loadAccounts();
loadContracts();
