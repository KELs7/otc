<script>
	let loading = false;
	export const showSpinner = () => {loading = !loading};

</script>

<style>
	.backdrop {
		background-color: rgb(0, 0, 0);
		background-color: rgba(0, 0, 0, 0.6);
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}
	
	.spinner {
		display: block;
		/*background-color: white;*/
		position: absolute;
		width: 100px;
		height: 100px;
		top: 50%;
		left: 50%;
		transform: translate(-50%,-50%);
		z-index: 1;
	}

	.spinner div {
		position: absolute;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		border: 8px solid transparent;
		border-top-color: green;
		border-radius: 50%;
		animation: spinnerOne 1s linear infinite;
	}

	.spinner div:nth-child(2) {
		border: 8px solid transparent;
		border-bottom-color: green;
		border-radius: 50%;
		animation: spinnerOne 1s linear infinite;
	}

	@keyframes spinnerOne {
		0% { transform:rotate(0deg); border-width: 10px;}
		50% { transform:rotate(180deg); border-width: 1px;}
		100% { transform:rotate(360deg); border-width: 10px;}
	}
</style>

{#if loading}
	<div class='backdrop'>
		<div class="spinner">
			<div></div>
			<div></div>
		</div>
	</div>
{/if}