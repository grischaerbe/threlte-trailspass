import { Pass } from 'postprocessing';
import {
	ShaderMaterial,
	Vector2,
	WebGLRenderTarget,
	type TextureDataType,
	type WebGLRenderer
} from 'three';

export class TrailsPass extends Pass {
	private renderTargetA: WebGLRenderTarget | undefined;
	private renderTargetB: WebGLRenderTarget | undefined;
	private activeTarget: boolean = false;
	private material: ShaderMaterial;

	private _trailStrength: number = 0.9;
	get trailStrength(): number {
		return this._trailStrength;
	}
	set trailStrength(value: number) {
		this._trailStrength = value;
		this.material.uniforms.trailStrength.value = value;
	}

	constructor(trailStrength: number = 0.9) {
		super('TrailsPass');

		this._trailStrength = trailStrength;

		this.material = new ShaderMaterial({
			uniforms: {
				currentFrame: { value: null },
				previousFrame: { value: null },
				trailStrength: { value: this._trailStrength } // Adjust trail persistence
			},
			vertexShader: `varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
			fragmentShader: `uniform sampler2D currentFrame;
        uniform sampler2D previousFrame;
        uniform float trailStrength;
        varying vec2 vUv;
        
        void main() {
          vec4 current = texture2D(currentFrame, vUv);
          vec4 previous = texture2D(previousFrame, vUv) * trailStrength;
          gl_FragColor = max(current, previous); // Choose blend method based on desired trail effect
        }`
		});

		this.fullscreenMaterial = this.material;
	}

	initialize(renderer: WebGLRenderer, _alpha: boolean, frameBufferType: number): void {
		if (this.renderTargetA) this.renderTargetA.dispose();
		if (this.renderTargetB) this.renderTargetB.dispose();

		const size = new Vector2();
		renderer.getSize(size);

		this.renderTargetA = new WebGLRenderTarget(size.width, size.height, {
			type: frameBufferType as TextureDataType,
			colorSpace: 'srgb-linear'
		});
		this.renderTargetB = new WebGLRenderTarget(size.width, size.height, {
			type: frameBufferType as TextureDataType,
			colorSpace: 'srgb-linear'
		});
	}

	render(
		renderer: WebGLRenderer,
		inputBuffer: WebGLRenderTarget | null,
		outputBuffer: WebGLRenderTarget | null
	): void {
		if (!inputBuffer) {
			throw new Error('TrailsPass: inputBuffer is required');
		}

		if (!this.renderTargetA || !this.renderTargetB) {
			throw new Error('TrailsPass: renderTargets are not initialized');
		}

		const targetA = this.activeTarget ? this.renderTargetA : this.renderTargetB;
		const targetB = this.activeTarget ? this.renderTargetB : this.renderTargetA;

		this.material.uniforms.currentFrame.value = inputBuffer.texture;
		this.material.uniforms.previousFrame.value = targetB.texture;

		// Render to the active target (ping-pong)
		renderer.setRenderTarget(targetA);
		renderer.render(this.scene, this.camera);

		// Toggle the active target for the next frame
		this.activeTarget = !this.activeTarget;

		// Output to the outputBuffer or to screen if outputBuffer is null
		if (this.renderToScreen) {
			renderer.setRenderTarget(null);
			renderer.render(this.scene, this.camera);
		} else {
			this.material.uniforms.currentFrame.value = targetA.texture;
			renderer.setRenderTarget(outputBuffer);
			renderer.render(this.scene, this.camera);
		}
	}

	setSize(width: number, height: number) {
		this.renderTargetA?.setSize(width, height);
		this.renderTargetB?.setSize(width, height);
	}

	dispose(): void {
		this.renderTargetA?.dispose();
		this.renderTargetB?.dispose();
		this.material.dispose();
	}
}
