<script lang="ts">
	import { useTask, useThrelte, watch } from '@threlte/core';
	import {
		EffectComposer,
		EffectPass,
		RenderPass,
		ToneMappingEffect,
		ToneMappingMode
	} from 'postprocessing';
	import { onMount } from 'svelte';
	import { HalfFloatType, type Camera } from 'three';
	import { TrailsPass } from './passes/TrailsPass';

	const { autoRender, renderStage, camera, renderer, scene, size } = useThrelte();

	const toneMappingEffect = new ToneMappingEffect({
		mode: ToneMappingMode.ACES_FILMIC
	});

	const trailsPass = new TrailsPass(0.99);

	onMount(() => {
		const originalAutoRender = autoRender.current;
		autoRender.set(false);
		return () => {
			autoRender.set(originalAutoRender);
		};
	});

	const composer = new EffectComposer(renderer, {
		alpha: true,
		frameBufferType: HalfFloatType
	});

	const setup = (camera: Camera) => {
		composer.removeAllPasses();
		composer.addPass(new RenderPass(scene, camera));
		composer.addPass(trailsPass);
		composer.addPass(new EffectPass(camera, toneMappingEffect));
	};

	watch(camera, (camera) => {
		if (camera) setup(camera);
	});

	watch(size, (size) => {
		composer.setSize(size.width, size.height);
	});

	useTask(
		() => {
			composer.render();
		},
		{
			stage: renderStage,
			autoInvalidate: false
		}
	);
</script>
