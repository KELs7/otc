<script context ="module">
	import WalletController from "./walletController";
	
	const connectionRequest = {
			appName: 'otc dApp', 
			version: '1.0.0',
			logo: 'crowfer.png',
			contractName: 'con_otc17', 
			networkType: 'testnet' 
		};
		
	export const lwc = new WalletController(connectionRequest);
		
</script>