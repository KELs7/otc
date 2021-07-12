<style>
	.border-case {
		background-color: #b6c172;
		border: 0.1px solid #b6c172;
		position: relative;
		border-radius: 25px;
		margin: auto;
		height:380px;
		width: 280px;
		top: 6em;
	}
	
	.shade-area1 {
		position: absolute;
		background-color: black;
		border-radius: 25px;
		height: 230px;
		width: 220px;
		left: 50%;
		transform: translate(-50%, -50%);
		top: 135px;
		opacity: 0.5;
		margin: 0;
	}
	
	.shade-area2 {
		position: absolute;
		background-color: black;
		height: 120px;
		width: 220px;
		left: 50%;
		transform: translate(-50%, -50%);
		bottom: -60px;
		opacity: 0.5;
		margin: 0;
	}
	
</style>

<div class="border-case">	
	<div class="shade-area1">
	</div>
	
	<div class="shade-area2">
	</div>
	
	<slot></slot>	
</div>