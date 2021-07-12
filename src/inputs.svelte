<script context="module">

export let makerCont = '';
export let makerAmt;
export let takerCont = '';
export let takerAmt;
export let offerID = '';	
	
</script> 

<style>

	.mc {
		position: absolute;
		outline: none;
		background-color: white;
		text-align: center;
		border: none;
		width: 70%;
		border-radius: 10px;
		top: 53px;
		left: 50%;
		transform: translate(-50%, -50%);	
	}
	
	.ma {
		position: absolute;
		outline: none;
		background-color: white;
		text-align: center;
		border: none;
		width: 70%;
		border-radius: 10px;
		top: 96px;
		left: 50%;
		transform: translate(-50%, -50%);	
	}
	
	.tc {
		position: absolute;
		outline: none;
		background-color: white;
		text-align: center;
		border: none;
		width: 70%;
		border-radius: 10px;
		top: 139px;
		left: 50%;
		transform: translate(-50%, -50%);	
	}
	
	.ta {
		position: absolute;
		outline: none;
		background-color: white;
		text-align: center;
		border: none;
		width: 70%;
		border-radius: 10px;
		top: 182px;
		left: 50%;
		transform: translate(-50%, -50%);	
	}
	
	.ofd {
		position: absolute;
		outline: none;
		background-color: white;
		text-align: center;
		border: none;
		width: 70%;
		border-radius: 10px;
		bottom: 38px;
		left: 50%;
		transform: translate(-50%, -50%);		
	}
	
	
	
</style>

<input class="mc" bind:value={makerCont} placeholder="What token do you offer?">
<input type="number" class="ma" bind:value={makerAmt} placeholder="How much?">
<input class="tc" bind:value={takerCont} placeholder="What token to receive?">
<input type="number" class="ta" bind:value={takerAmt} placeholder="How much?">
<input class="ofd" bind:value={offerID} placeholder="offer id">
