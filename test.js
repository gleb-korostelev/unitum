const web3 =  require('@solana/web3.js');
const fs = require('fs').promises;
const BufferLayout = require('buffer-layout');
const path = require('path');

const PROGRAM_PATH = path.resolve(__dirname, './');
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'sol_json-keypair.json');


(async () => {

    //create connection to devnet
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

	const SecretKeyString = await fs.readFile("./key.json", {encoding: 'utf8'})
	const SecretKey = Uint8Array.from(JSON.parse(SecretKeyString))
	const payer = web3.Keypair.fromSecretKey(SecretKey)

	let lamports = await connection.getBalance(payer.publicKey);
	console.log(`Payer account ${payer.publicKey.toBase58()} containing ${(lamports / 1000000000).toFixed(2)}SOL`);
	
	const programKeypairString = await fs.readFile("./sol_json-keypair.json", {encoding: 'utf8'})
	const programKey = Uint8Array.from(JSON.parse(programKeypairString))
	const programKeypair = web3.Keypair.fromSecretKey(programKey)
    const programId = programKeypair.publicKey;
	const programInfo = await connection.getAccountInfo(programId);
	//console.log(programInfo)
	console.log(`Using program ${programId.toBase58()}`);

	const SEED = '123';
	let greetedPubkey = await web3.PublicKey.createWithSeed(
	  payer.publicKey,
	  SEED,
	  programId,
	);
	const greetedAccount = await connection.getAccountInfo(greetedPubkey);
	console.log('Creating account', greetedPubkey.toBase58(), 'to say hello to',)

	const characterLength = 1000;
	const structure = BufferLayout.struct([BufferLayout.blob(characterLength,'txt')]);
	const space = structure.span;
	const lampor = await connection.getMinimumBalanceForRentExemption(
		space,
	  );
	console.log({space})
	const transaction = new web3.Transaction().add(
		web3.SystemProgram.createAccountWithSeed({
			fromPubkey: payer.publicKey,
			basePubkey: payer.publicKey,
			seed: SEED,
			newAccountPubkey: greetedPubkey,
			lampor,
			space: space,
			programId,
		}),
	  );
	console.log({transaction});
	await web3.sendAndConfirmTransaction(
		connection,
		transaction,
		[payer]
	);
	console.log("Trans")
	//console.log({transaction});
	const jsonString = '{"abc":123}';
	const paddedMsg = jsonString.padEnd(1000);
	const buffer = Buffer.from(paddedMsg, 'utf8');
	console.log("ok??")
	const instruction = new web3.TransactionInstruction({
		keys: [{pubkey: greetedPubkey, isSigner: false, isWritable: true}],
		programId,
		data: buffer, // All instructions are hellos
	});
	console.log("???")
	await web3.sendAndConfirmTransaction(
		connection,
		new web3.Transaction().add(instruction),
		[payer],
	);
	console.log("what now?")

	const accountInfo = await connection.getAccountInfo(greetedPubkey);
	const testJSON = Buffer.from(accountInfo.data).toString().substr(4,1000).trim();
	console.log(`Test: ${JSON.parse(testJSON).abc}`);
	

	
	// //generate keypair and airdrop 1000000000 Lamports (1 SOL)
	// const arr = new Uint8Array(SecretKey)
    // const myKeypair = new web3.Keypair(SecretKey);
	// console.log()
    // //await connection.requestAirdrop(myKeypair.publicKey, 1000000000);

    // console.log('solana public address: ' + myKeypair.publicKey.toBase58());

    // //set timeout to account for airdrop finalization
    // let mint;
    // var myToken
    // setTimeout(async function(){ 
// "7kETcp3AkeU28bViE63bBvykz81Pjm2rz5Yh2HDWNDny"
    //     //create mint
    //     mint = await splToken.Token.createMint(connection, myKeypair, myKeypair.publicKey, null, 9, splToken.TOKEN_PROGRAM_ID)

    //     console.log('mint public address: ' + mint.publicKey.toBase58());

    //     //get the token accont of this solana address, if it does not exist, create it
    //     myToken = await mint.getOrCreateAssociatedAccountInfo(
    //         myKeypair.publicKey
    //     )

    //     console.log('token public address: ' + myToken.address.toBase58());

    //     //minting 100 new tokens to the token address we just created
    //     await mint.mintTo(myToken.address, myKeypair.publicKey, [], 1000000000);

    //     console.log('done');

    // }, 20000);

})();