<script>
	import {lwc} from './lwc.svelte';
	
	let url = "https://testnet-master-1.lamden.io/contracts/currency/balances?key="
	let WalletUrl = "https://chrome.google.com/webstore/detail/lamden-wallet-browser-ext/fhfffofbcgbjjojdnpcfompojdjjhdim";
	let interState;
	let state = "Wait...";
	let addr;
	let balUrl;
	
	
	const cw =()=> {	
	
		lwc.walletIsInstalled()
		.then(installed => {
			
			if (!installed) {state = ">>Install Wallet<<"};
			
		});
		
		lwc.events.on('newInfo' , (walletInfo)=> {
			
			if (walletInfo.locked) {
			
				state = "Unlock Wallet";
				
			} else {
			
				addr = walletInfo.wallets[0];
				
				balUrl = url + addr;
			
				fetch(balUrl)
				.then(response => response.json())
				.then(obj => {
					
					if (Object.values(obj.value) == null) {
					
						state = "0 TAU";
						
					} else {state = Object.values(obj.value) + " TAU"};
				
				});
				
			}
			
		});
	};	
			
	
</script>

<style>

	.d-nav {
		overflow: hidden;
		position: fixed;
		padding: 20px;
		//background-color: #b6c172;
		bottom: 0;
		width: 100%;
	}
	
	.btn {
		//border: 3px solid #b6c172;
		background-color: #b6c172;
		border-radius: 10px;
		color: #493e8d;
		padding: 5px 15px;
		text-decoration: none;
		font-weight: bold;	
		
	}
	
	.btn:hover {
		color: white;
		background-color: #F88379;
	}
	
	.btn-install {
		border: 3px solid #F88379;
		border-radius: 10px;
		color: #F88379;
		padding: 5px 15px;
		text-decoration: none;
		font-weight: bold;
		animation:blinking 1.2s infinite;
	}
	
	@keyframes blinking {
		0% { color: #F88379;}
		50% { color: yellow;}
		100% { color: #F88379;}
	}
		
</style>

<svelte:window on:load={cw}/> 
<div class="d-nav">
	{#if state == ">>Install Wallet<<"}
		<a class="btn-install"  href={WalletUrl}>
		{state}
		</a>
	{:else}
		<a class="btn"  href="#/">
		{state}
		</a>
	{/if}
</div>



