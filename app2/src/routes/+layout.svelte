<script lang="ts">
	import '../app.css';
	import '../index.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>LucidLines Terminal</title>
</svelte:head>

{@render children()}
