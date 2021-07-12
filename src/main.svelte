<script>
	import {lwc} from './lwc.svelte';
	import {offerID} from './inputs.svelte';
	import {makerCont, makerAmt, takerCont, takerAmt} from './inputs.svelte';
	import Spinner from './spinner.svelte';
	import Modal from './modal.svelte';
	
	let url = "https://testnet-master-1.lamden.io/contracts/con_otc17/data?key="
	let v = 'copy id';
	let otcId;
	let copyId;
	let button;
	let spinnerComp;
	let otc_form;
	let state;
	let maker;
	let offer_amt;
	let offer_token;
	let take_amt;
	let take_token;
	let modal;
	let r;
	let title;
	let modalContent;
	
	const copy = () => {
		copyId.select();
		copyId.setSelectionRange(0, 64);
		document.execCommand("copy");
		button.style.backgroundColor = '#b6c172';
		button.style.color = '#493e8d'
		v = '\u2713';
		
	}
	
	const submitOffer = ()=> {
	
		spinnerComp.showSpinner();
		
		setTimeout(() => {
		
		lwc.events.on('newInfo', (walletInfo)=> {
		
			if (walletInfo.setup) {
				
				const offerTxInfo = {
				networkType: 'testnet', 
				methodName: 'make_offer', 
					kwargs: {
						offer_token: makerCont,
						offer_amount: {'__fixed__': makerAmt.toString()},
						take_token: takerCont,
						take_amount: {'__fixed__': takerAmt.toString()},	
							}, 
					stampLimit: 100
				};	

			    lwc.sendTransaction(offerTxInfo);
			    lwc.events.on('txStatus', (txResults) => {
				
					if (txResults.data.resultInfo.type == "error") {
						r = 'mErr'
						title = txResults.data.resultInfo.title;
						modalContent = txResults.data.resultInfo.errorInfo + " " + txResults.data.resultInfo.stampsUsed + " stamps used.";
						
						spinnerComp.showSpinner();
						modal.show();
						
					} else {
						r = 'mSucc'
						title = txResults.data.resultInfo.title;
						console.log(txResults.data.resultInfo)
						otcId = txResults.data.resultInfo.returnResult.replace(/['"]+/g, '');
						//otcId = otc_id.replace(/['"]+/g, '');
	
						spinnerComp.showSpinner();
						modal.show();
					
					}
						
				});	
			
			}
		
		});
		
		lwc.getInfo();
		
		}, 2500)
		
		
	}
	
	const takeOffer =()=> {
		r = 'tf'
		spinnerComp.showSpinner();
		
		setTimeout(() => {
		
		otc_form = url + offerID;
		
		fetch(otc_form)
				.then(response => response.json())
				.then(obj => {
					
					if (JSON.stringify(obj.value) == 'null') {
					
						r = 'idErr';
						
					spinnerComp.showSpinner();
					modal.show();	
					
					} else {
					
					state = JSON.stringify(obj.value.state);
					maker = JSON.stringify(obj.value.maker);
					offer_amt = Object.values(obj.value.offer_amount);
					offer_token = JSON.stringify(obj.value.offer_token);
					take_amt = Object.values(obj.value.take_amount);
					take_token = JSON.stringify(obj.value.take_token);
					
					spinnerComp.showSpinner();
					modal.show();
					
					}
				});
		}, 2500)
	}
	
	const cancelOffer =()=> {
		r = 'cf'
		spinnerComp.showSpinner();
		
		setTimeout(() => {
		
		otc_form = url + offerID;
		
		fetch(otc_form)
				.then(response => response.json())
				.then(obj => {
					
					if (JSON.stringify(obj.value) == 'null') {
					
						r = 'idErr';
						
					spinnerComp.showSpinner();
					modal.show();	
					
					} else {
					
					state = JSON.stringify(obj.value.state);
					maker = JSON.stringify(obj.value.maker);
					offer_amt = Object.values(obj.value.offer_amount);
					offer_token = JSON.stringify(obj.value.offer_token);
					take_amt = Object.values(obj.value.take_amount);
					take_token = JSON.stringify(obj.value.take_token);
					
					spinnerComp.showSpinner();
					modal.show();
					
					}
				});
		}, 2500)
	}
	
	const confirmTake = () => {
	
		spinnerComp.showSpinner();
		
		setTimeout(() => {
		
		lwc.events.on('newInfo', (walletInfo)=> {
		
			if (walletInfo.setup) {
				
				const offerTxInfo = {
				networkType: 'testnet', 
				methodName: 'take_offer', 
					kwargs: {
						offer_id: offerID,	
					}, 
					stampLimit: 100
				};	

			    lwc.sendTransaction(offerTxInfo);
			    lwc.events.on('txStatus', (txResults) => {
				
					if (txResults.data.resultInfo.type == "error") {
						r = 'err'
						title = txResults.data.resultInfo.title;
						modalContent = txResults.data.resultInfo.errorInfo + " " + txResults.data.resultInfo.stampsUsed + " stamps used.";
						
						spinnerComp.showSpinner();
						modal.show();
						
					} else {
						r = 'succ'
						title = 'SUCCESS';
						
	
						spinnerComp.showSpinner();
						modal.show();
					
					}
						
				});	
			
			}
		
		});
		
		lwc.getInfo();
		
		}, 2500) 
	}
	
	const confirmCancel = () => {
	
		spinnerComp.showSpinner();
		
		setTimeout(() => {
		
			lwc.events.on('newInfo', (walletInfo)=> {
			
				if (walletInfo.setup) {
					
					const offerTxInfo = {
					networkType: 'testnet', 
					methodName: 'cancel_offer', 
						kwargs: {
							offer_id: offerID,	
						}, 
						stampLimit: 100
					};	

					lwc.sendTransaction(offerTxInfo);
					lwc.events.on('txStatus', (txResults) => {
					
						if (txResults.data.resultInfo.type == "error") {
							r = 'err'
							title = txResults.data.resultInfo.title;
							modalContent = txResults.data.resultInfo.errorInfo + " " + txResults.data.resultInfo.stampsUsed + " stamps used.";
							
							spinnerComp.showSpinner();
							modal.show();
							
						} else {
							r = 'succ'
							title = 'OFFER CANCELLED!';
							
		
							spinnerComp.showSpinner();
							modal.show();
						
						}
							
					});	
				
				}
			
			});
			
			lwc.getInfo();
		
		}, 2500)
		
		
	  
	
	}
	
</script>

<style>
	#MakeOfferBtn { 
		position: absolute;
		top: 224px;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	
	#TakeOfferBtn {
		position: absolute;
		bottom: 8px;
		left: 40px;
	}
	
	#CancelOfferBtn {
		position: absolute;
		bottom: 8px;
		left: 153px;
		
	}
	
	#MakeOfferBtn:hover {
		color: #493e8d;
		background-color: #b6c172;
	}
	
	#TakeOfferBtn:hover {
		color: #493e8d;
		background-color: #b6c172;
	}
	
	#CancelOfferBtn:hover {
		color: #493e8d;
		background-color: #b6c172;
	}
	
	#line {
		height: 0px;
		border: 1px solid #b6c172;
	}
	
	#modal-button {
		background-color: #493e8d;
		border-radius: 10px;
		width: 95px;
		height: 34px;
		color: #b6c172;
		line-height: 1;
		text-decoration: none;
		font-weight: bold;
	}
	
	#modal-button:hover {
		background-color: #b6c172;
		border: 3px solid #493e8d;
		border-radius: 10px;
		color: #493e8d;
		
	}
	
	.tooltip {
		position: relative;
		display: inline-block;
		transform: translate(-50%, -50%);
		left: 50%;
		margin-top: 50px;
	}
	
</style>

<button id="MakeOfferBtn" on:click={submitOffer}>Make offer</button>

<button id="TakeOfferBtn" on:click={takeOffer}>Take offer</button>

<button id="CancelOfferBtn" on:click={cancelOffer}>Cancel</button>



<Spinner bind:this={spinnerComp}/>


<Modal bind:this={modal}>
	{#if r == 'mErr'}
		<h2>{title}</h2>
		<p>{modalContent}</p>
		<button id='modal-button' on:click={() => modal.hide()} >close</button>
	{:else if r == 'mSucc'}
		<h2>{title}</h2>
		
		<!--copy id-->

		<div class="tooltip">
			<input bind:value={otcId} bind:this={copyId}>
			<button id='modal-button' on:click={copy} bind:this={button}>{v}</button>
			<button id='modal-button' on:click={() => modal.hide()}>close</button>
		</div>

	{:else if r == 'tf'}
		<p><b>STATE</b> : {state}</p>
		<div id='line'></div>
		<p><b>MAKER</b> : {maker}</p>
		<div id='line'></div>
		<p><b>OFFER AMOUNT</b> : {offer_amt}</p>
		<div id='line'></div>
		<p><b>OFFER TOKEN</b> : {offer_token}</p>
		<div id='line'></div>
		<p><b>TOKEN AMOUNT</b> : {take_amt}</p>
		<div id='line'></div>
		<p><b>TAKE TOKEN</b> : {take_token}</p>
	
		<button id='modal-button' on:click={confirmTake}>confirm</button>
		<button id='modal-button' on:click={() => modal.hide()}>close</button>
		
	{:else if r == 'cf'}
		<p><b>STATE</b> : {state}</p>
		<div id='line'></div>
		<p><b>MAKER</b> : {maker}</p>
		<div id='line'></div>
		<p><b>OFFER AMOUNT</b> : {offer_amt}</p>
		<div id='line'></div>
		<p><b>OFFER TOKEN</b> : {offer_token}</p>
		<div id='line'></div>
		<p><b>TOKEN AMOUNT</b> : {take_amt}</p>
		<div id='line'></div>
		<p><b>TAKE TOKEN</b> : {take_token}</p>
	
		<button id='modal-button' on:click={confirmCancel}>confirm</button>
		<button id='modal-button' on:click={() => modal.hide()}>close</button>
		
	{:else if r == 'idErr'}
		<b>OFFER ID DOESN'T EXIST!</b>	
		<span><button id='modal-button' style='float: right;' on:click={() => modal.hide()}>close</button></span>
	{:else if r == 'err'}
		<h2>{title}</h2>
		<p>{modalContent}</p>
		<button on:click={() => modal.hide()}>close</button>
	{:else if r == 'succ'}
		<b>{title}!</b>
		<span><button id='modal-button' style='float: right;' on:click={() => modal.hide()}>close</button></span>
	{/if}
</Modal>

