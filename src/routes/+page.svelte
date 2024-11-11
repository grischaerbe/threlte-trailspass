<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import { NoToneMapping, WebGLRenderer } from 'three';
</script>

<Canvas
	renderMode="always"
	toneMapping={NoToneMapping}
	createRenderer={(canvas) => {
		return new WebGLRenderer({
			canvas,
			alpha: true,
			powerPreference: 'high-performance',
			antialias: false,
			stencil: false,
			depth: false
		});
	}}
>
	<Scene />
</Canvas>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		width: 100vw;
		height: 100vh;
	}
</style>
