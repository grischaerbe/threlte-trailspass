<script lang="ts">
	import { T } from '@threlte/core';
	import { Grid, layers, OrbitControls, TransformControls } from '@threlte/extras';
	import Rendering from './Rendering.svelte';

	layers();
</script>

<T.PerspectiveCamera makeDefault position={[10, 10, 10]}>
	<OrbitControls />
</T.PerspectiveCamera>

<TransformControls>
	<T.Mesh>
		<T.BoxGeometry />
		<T.MeshBasicMaterial color="gray" />
	</T.Mesh>
</TransformControls>

<Grid />

<Rendering />
