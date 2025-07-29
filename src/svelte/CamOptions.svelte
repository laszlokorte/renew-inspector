<script>
	import * as L from "partial.lenses";
	import * as G from "@svatom/basic/generators";
	import * as R from "ramda";
	import * as U from "./utils";
	import {
		atom,
		view,
		read,
		combine,
		update,
		failableView,
		bindValue,
		autofocusIf,
		setValue,
	} from "./svatom.svelte.js";

	const numf = new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	});
	const {camera , screen, offset, scale, rotation, worldTransform, meshColor, debugLabels, penSize, textRendering, inset, backfaceCull } = $props()
	const lensRadToDegree = [L.multiply(180), L.divide(Math.PI)];

	const allProps = (val) =>
		L.lens(R.pipe(R.values, R.all(R.equals(val))), (v, o) =>
			v ? R.map(R.always(val), o) : R.map(R.always(!val), o),
		);

	const hideCW = view("cw", backfaceCull);
	const hideCCW = view("ccw", backfaceCull);
	const hideNone = view(allProps(false), backfaceCull);
	const hideAll = view(allProps(true), backfaceCull);

	const alphaBlend = view("alphaBlend", penSize);
	const strokeWidthBg = view("bg", penSize);
	const strokeWidthFg = view("fg", penSize);
	const circleRad = view("circleRad", penSize);
	const fontSize = view("fontSize", penSize);
	const dashRatio = view("dashRatio", penSize);
	const dashFrequency = view("dashFrequency", penSize);

	const textFormatted = view("formatted", textRendering);
	const textPerspective = view("perspective", textRendering);

	const showSvg = view("svg", debugLabels);
	const showCanvas = view("canvas", debugLabels);
	const labelFace = view("face", debugLabels);
	const labelVertex = view("vertex", debugLabels);
	const labelEdge = view("edge", debugLabels);
	const showNDCCube = view("ndcCube", debugLabels);
	const screenTriangle = view("screenTriangle", debugLabels);

	const offsetX = view("x", offset);
	const offsetY = view("y", offset);
	const scaleX = view("x", scale);
	const scaleY = view("y", scale);
	const rotationAngle = view(lensRadToDegree, rotation);


	const cameraFoVDeg = view(["fov", lensRadToDegree], camera);
	const cameraFoVRad = view(["fov"], camera);
	const cameraAspectRatio = view(["aspectRatio"], camera);
	const cameraOrtho = view(
		["orthogonality", L.normalize(R.clamp(0, 1))],
		camera,
	);

	const cameraEye = view(["eye"], camera);
	const cameraOffset = view(["offset"], camera);
	const cameraEyePosX = view(["tx"], cameraEye);
	const cameraEyePosY = view(["ty"], cameraEye);
	const cameraEyePosZ = view(["tz"], cameraEye);
	const cameraOffsetX = view(["x"], cameraOffset);
	const cameraOffsetY = view(["y"], cameraOffset);
	const cameraOffsetZ = view(["z"], cameraOffset);
	const cameraEyeRotX = view(["rx", lensRadToDegree], cameraEye);
	const cameraEyeRotY = view(["ry", lensRadToDegree], cameraEye);
	const cameraEyeRotZ = view(["rz", lensRadToDegree], cameraEye);
	const cameraClipNear = view(
		[["clip", L.choose(({ far }) => ["near", L.normalize(R.min(far))])]],
		camera,
	);
	const cameraClipFar = view(
		[["clip", L.choose(({ near }) => ["far", L.normalize(R.max(near))])]],
		camera,
	);


	const worldTransformRotX = view(["rx", lensRadToDegree], worldTransform);
	const worldTransformRotY = view(["ry", lensRadToDegree], worldTransform);
	const worldTransformRotZ = view(["rz", lensRadToDegree], worldTransform);

	const worldTransformPosX = view(["tx"], worldTransform);
	const worldTransformPosY = view(["ty"], worldTransform);
	const worldTransformPosZ = view(["tz"], worldTransform);

	const worldTransformScaleX = view(["sx"], worldTransform);
	const worldTransformScaleY = view(["sy"], worldTransform);
	const worldTransformScaleZ = view(["sz"], worldTransform);

	const worldTransformMatrix = view(
		L.reread(({ rx, ry, rz, tx, ty, tz, sx, sy, sz }) => [
			[sx, 0, 0, tx, 0, sy, 0, ty, 0, 0, sz, tz, 0, 0, 0, 1],
		]),
		worldTransform,
	);

	const rangeX = view(
		[
			"size",
			L.pick({
				min: ["x", L.divide(2), L.negate],
				max: ["x", L.divide(2)],
			}),
		],
		screen,
	);
	const rangeY = view(
		[
			"size",
			L.pick({
				min: ["y", L.divide(2), L.negate],
				max: ["y", L.divide(2)],
			}),
		],
		screen,
	);
</script>
<details>
	<summary>Options</summary>

	<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(20em, 1fr)); gap: 1em; padding: 1em 0">
	<div>
		<fieldset>
			<legend>Plane Triangle</legend>
			<label class="number-picker"
				><span class="number-picker-label">Offset X:</span>
				<input
					type="range"
					class="number-picker-slider"
					{...rangeX.value}
					bind:value={offsetX.value}
				/><output class="number-picker-value ro"
					>({numf.format(offsetX.value)})</output
				>
			</label>
			<label class="number-picker"
				><span class="number-picker-label">Offset Y:</span>
				<input
					type="range"
					class="number-picker-slider"
					{...rangeY.value}
					bind:value={offsetY.value}
				/><output class="number-picker-value ro"
					>({numf.format(offsetY.value)})</output
				>
			</label>
			<label class="number-picker"
				><span class="number-picker-label">Rotation:</span>
				<input
					type="range"
					class="number-picker-slider"
					min="-360"
					max="360"
					bind:value={rotationAngle.value}
				/><output class="number-picker-value ro"
					>({numf.format(rotationAngle.value)})</output
				>
			</label>

			<label class="number-picker"
				><span class="number-picker-label">Scale X:</span>
				<input
					type="range"
					class="number-picker-slider"
					min="-4"
					max="4"
					step="0.01"
					bind:value={scaleX.value}
				/><output class="number-picker-value ro"
					>({numf.format(scaleX.value)})</output
				>
			</label>

			<label class="number-picker"
				><span class="number-picker-label">Scale Y:</span>
				<input
					type="range"
					class="number-picker-slider"
					min="-4"
					max="4"
					step="0.01"
					bind:value={scaleY.value}
				/><output class="number-picker-value ro"
					>({numf.format(scaleY.value)})</output
				>
			</label>
		</fieldset>

		<fieldset>
			<legend>Object</legend>

			<div
				style="display: grid; grid-template-columns: repeat(auto-fit, minmax(10em, 1fr)); gap: 1em; "
			>
				<div>
					<label class="number-picker"
						><span class="number-picker-label">Position X:</span>
						<input
							type="range"
							class="number-picker-slider"
							min="-150"
							max="150"
							step="0.001"
							bind:value={worldTransformPosX.value}
						/><output class="number-picker-value ro"
							>({numf.format(worldTransformPosX.value)})</output
						>
					</label>
					<label class="number-picker"
						><span class="number-picker-label">Position Y:</span>
						<input
							type="range"
							class="number-picker-slider"
							min="-150"
							max="150"
							step="0.001"
							bind:value={worldTransformPosY.value}
						/><output class="number-picker-value ro"
							>({numf.format(worldTransformPosY.value)})</output
						>
					</label>
					<label class="number-picker"
						><span class="number-picker-label">Position Z:</span>
						<input
							type="range"
							class="number-picker-slider"
							min="-150"
							max="150"
							step="0.001"
							bind:value={worldTransformPosZ.value}
						/><output class="number-picker-value ro"
							>({numf.format(worldTransformPosZ.value)})</output
						>
					</label>
				</div>
				<div>
					<label class="number-picker"
						><span class="number-picker-label">Rotation X:</span>
						<input
							type="range"
							class="number-picker-slider"
							min="-180"
							max="180"
							step="1"
							bind:value={worldTransformRotX.value}
						/><output class="number-picker-value ro"
							>({numf.format(worldTransformRotX.value)})</output
						>
					</label>
					<label class="number-picker"
						><span class="number-picker-label">Rotation Y:</span>
						<input
							type="range"
							class="number-picker-slider"
							min="-180"
							max="180"
							step="1"
							bind:value={worldTransformRotY.value}
						/><output class="number-picker-value ro"
							>({numf.format(worldTransformRotY.value)})</output
						>
					</label>
					<label class="number-picker"
						><span class="number-picker-label">Rotation Z:</span>
						<input
							type="range"
							class="number-picker-slider"
							min="-180"
							max="180"
							step="1"
							bind:value={worldTransformRotZ.value}
						/><output class="number-picker-value ro"
							>({numf.format(worldTransformRotZ.value)})</output
						>
					</label>
				</div>
				<div>
					<label class="number-picker"
						><span class="number-picker-label">Scale X:</span>
						<input
							type="range"
							class="number-picker-slider"
							min="-5"
							max="5"
							step="0.1"
							bind:value={worldTransformScaleX.value}
						/><output class="number-picker-value ro"
							>({numf.format(worldTransformScaleX.value)})</output
						>
					</label>
					<label class="number-picker"
						><span class="number-picker-label">Scale Y:</span>
						<input
							type="range"
							class="number-picker-slider"
							min="-5"
							max="5"
							step="0.1"
							bind:value={worldTransformScaleY.value}
						/><output class="number-picker-value ro"
							>({numf.format(worldTransformScaleY.value)})</output
						>
					</label>
					<label class="number-picker"
						><span class="number-picker-label">Scale Z:</span>
						<input
							type="range"
							class="number-picker-slider"
							min="-5"
							max="5"
							step="0.1"
							bind:value={worldTransformScaleZ.value}
						/><output class="number-picker-value ro"
							>({numf.format(worldTransformScaleZ.value)})</output
						>
					</label>
				</div>
				<div>
					<label>
						Color:
						<input type="color" bind:value={meshColor.value} />
					</label>
				</div>
			</div>
		</fieldset>
		<fieldset>
			<legend>Debug Labels</legend>

			<div class="checkbox-list">
				
			<label class="checkbox-list-item"
				><input type="checkbox" bind:checked={showSvg.value} /> <span class="checkbox-list-item-label">SVG</span></label
			>
			<label class="checkbox-list-item"
				><input type="checkbox" bind:checked={showCanvas.value} /> <span class="checkbox-list-item-label">Canvas</span></label
			>
			<label class="checkbox-list-item"
				><input type="checkbox" bind:checked={labelFace.value} /> <span class="checkbox-list-item-label">Face</span></label
			>
			<label class="checkbox-list-item"
				><input type="checkbox" bind:checked={labelVertex.value} /> <span class="checkbox-list-item-label">Vertex</span></label
			>
			<label class="checkbox-list-item"
				><input type="checkbox" bind:checked={labelEdge.value} /> <span class="checkbox-list-item-label">Edge</span></label
			>
			<label class="checkbox-list-item"
				><input type="checkbox" bind:checked={showNDCCube.value} /> <span class="checkbox-list-item-label">NDC Cube</span></label
			>
			<label class="checkbox-list-item"
				><input type="checkbox" bind:checked={screenTriangle.value} /> <span class="checkbox-list-item-label">Clipped Triangle</span></label
			>
			<label class="checkbox-list-item"
				><input type="checkbox" bind:checked={alphaBlend.value} /> <span class="checkbox-list-item-label">Alpha Blend</span></label
			>
			</div>
		</fieldset>


		<fieldset>
			<legend>Text Rendering</legend>

			<div class="checkbox-list">
				
			<label class="checkbox-list-item"

		

				><input type="checkbox" bind:checked={textFormatted.value} /> <span class="checkbox-list-item-label">Formatted Text</span></label
			>
			<label class="checkbox-list-item"
				><input type="checkbox" bind:checked={textPerspective.value} /> <span class="checkbox-list-item-label">Perspective Text</span></label
			>
			</div>
		</fieldset>

		
		<fieldset>
			<legend>Drawing Style</legend>
			<label class="number-picker"
				><span class="number-picker-label">Stroke Fg:</span>
				<input
					type="range"
					class="number-picker-slider"
					min="0"
					max="10"
					step="0.1"
					bind:value={strokeWidthFg.value}
				/><output class="number-picker-value ro"
					>({numf.format(strokeWidthFg.value)})</output
				>
			</label>

			<label class="number-picker"
				><span class="number-picker-label">Stroke Bg:</span>
				<input
					type="range"
					class="number-picker-slider"
					min="0"
					max="10"
					step="0.1"
					bind:value={strokeWidthBg.value}
				/><output class="number-picker-value ro"
					>({numf.format(strokeWidthBg.value)})</output
				>
			</label>
			<label class="number-picker"
				><span class="number-picker-label">Vertex Size:</span>
				<input
					type="range"
					class="number-picker-slider"
					min="0"
					max="20"
					step="0.1"
					bind:value={circleRad.value}
				/><output class="number-picker-value ro"
					>({numf.format(circleRad.value)})</output
				>
			</label>
			<label class="number-picker"
				><span class="number-picker-label">Font Size:</span>
				<input
					type="range"
					class="number-picker-slider"
					min="0"
					max="20"
					step="0.1"
					bind:value={fontSize.value}
				/><output class="number-picker-value ro"
					>({numf.format(fontSize.value)})</output
				>
			</label>
			<label class="number-picker"
				><span class="number-picker-label">Dash Frequency:</span>
				<input
					type="range"
					class="number-picker-slider"
					min="0"
					max="10"
					step="0.1"
					bind:value={dashFrequency.value}
				/><output class="number-picker-value ro"
					>({numf.format(dashFrequency.value)})</output
				>
			</label>
			<label class="number-picker"
				><span class="number-picker-label">Dash Ratio:</span>
				<input
					type="range"
					class="number-picker-slider"
					min="0"
					max="1"
					step="0.01"
					bind:value={dashRatio.value}
				/><output class="number-picker-value ro"
					>({numf.format(dashRatio.value)})</output
				>
			</label>
		</fieldset>
	</div>

	<div>
		<fieldset>
			<legend>View</legend>

			<label class="number-picker"
				><span class="number-picker-label">Inset:</span>
				<input
					type="range"
					class="number-picker-slider"
					min="-10"
					max="50"
					step="1"
					bind:value={inset.value}
				/><output class="number-picker-value ro"
					>({numf.format(inset.value)})</output
				>
			</label>
		</fieldset>
		<fieldset>
			<legend>Camera</legend>

			<label class="number-picker"
				><span class="number-picker-label">Field of View:</span>
				<input
					type="range"
					class="number-picker-slider"
					min="1"
					max="120"
					step="1"
					bind:value={cameraFoVDeg.value}
				/><output class="number-picker-value ro"
					>({numf.format(cameraFoVDeg.value)})</output
				>
			</label>

			<label class="number-picker"
				><span class="number-picker-label">Aspect Ratio:</span>
				<input
					type="range"
					class="number-picker-slider"
					min="0.1"
					max="10"
					step="0.1"
					bind:value={cameraAspectRatio.value}
				/><output class="number-picker-value ro"
					>({numf.format(cameraAspectRatio.value)})</output
				>
			</label>

			<label class="number-picker"
				><span class="number-picker-label">Orthogonality:</span>
				<input
					type="range"
					class="number-picker-slider"
					min="0"
					max="1"
					step="0.01"
					bind:value={cameraOrtho.value}
				/><output class="number-picker-value ro"
					>({numf.format(cameraOrtho.value)})</output
				>
			</label>

			<fieldset>
				<legend>Eye</legend>

				<div
					style="display: grid; grid-template-columns: repeat(auto-fit, minmax(10em, 1fr)); gap: 1em; "
				>
					<div>
						<label class="number-picker"
							><span class="number-picker-label">Position X:</span
							>
							<input
								type="range"
								class="number-picker-slider"
								min="-100"
								max="100"
								step="0.001"
								bind:value={cameraEyePosX.value}
							/><output class="number-picker-value ro"
								>({numf.format(cameraEyePosX.value)})</output
							>
						</label>
						<label class="number-picker"
							><span class="number-picker-label">Position Y:</span
							>
							<input
								type="range"
								class="number-picker-slider"
								min="-100"
								max="100"
								step="0.001"
								bind:value={cameraEyePosY.value}
							/><output class="number-picker-value ro"
								>({numf.format(cameraEyePosY.value)})</output
							>
						</label>
						<label class="number-picker"
							><span class="number-picker-label">Position Z:</span
							>
							<input
								type="range"
								class="number-picker-slider"
								min="-100"
								max="100"
								step="0.001"
								bind:value={cameraEyePosZ.value}
							/><output class="number-picker-value ro"
								>({numf.format(cameraEyePosZ.value)})</output
							>
						</label>
					</div>
					<div>
						<label class="number-picker"
							><span class="number-picker-label">Rotation X:</span
							>
							<input
								type="range"
								class="number-picker-slider"
								min="-180"
								max="180"
								step="1"
								bind:value={cameraEyeRotX.value}
							/><output class="number-picker-value ro"
								>({numf.format(cameraEyeRotX.value)})</output
							>
						</label>
						<label class="number-picker"
							><span class="number-picker-label">Rotation Y:</span
							>
							<input
								type="range"
								class="number-picker-slider"
								min="-180"
								max="180"
								step="1"
								bind:value={cameraEyeRotY.value}
							/><output class="number-picker-value ro"
								>({numf.format(cameraEyeRotY.value)})</output
							>
						</label>
						<label class="number-picker"
							><span class="number-picker-label">Rotation Z:</span
							>
							<input
								type="range"
								class="number-picker-slider"
								min="-180"
								max="180"
								step="1"
								bind:value={cameraEyeRotZ.value}
							/><output class="number-picker-value ro"
								>({numf.format(cameraEyeRotZ.value)})</output
							>
						</label>
					</div>
					<div>
						<label class="number-picker"
							><span class="number-picker-label">Offset X:</span>
							<input
								type="range"
								class="number-picker-slider"
								min="-100"
								max="100"
								step="0.001"
								bind:value={cameraOffsetX.value}
							/><output class="number-picker-value ro"
								>({numf.format(cameraOffsetX.value)})</output
							>
						</label>
						<label class="number-picker"
							><span class="number-picker-label">Offset Y:</span>
							<input
								type="range"
								class="number-picker-slider"
								min="-100"
								max="100"
								step="0.001"
								bind:value={cameraOffsetY.value}
							/><output class="number-picker-value ro"
								>({numf.format(cameraOffsetY.value)})</output
							>
						</label>
						<label class="number-picker"
							><span class="number-picker-label">Offset Z:</span>
							<input
								type="range"
								class="number-picker-slider"
								min="-100"
								max="100"
								step="0.001"
								bind:value={cameraOffsetZ.value}
							/><output class="number-picker-value ro"
								>({numf.format(cameraOffsetZ.value)})</output
							>
						</label>
					</div>
				</div>
			</fieldset>

			<fieldset>
				<legend>Clip</legend>
				<label class="number-picker"
					><span class="number-picker-label">Near:</span>
					<input
						type="range"
						class="number-picker-slider"
						min="1"
						max="400"
						step="1"
						bind:value={cameraClipNear.value}
					/><output class="number-picker-value ro"
						>({numf.format(cameraClipNear.value)})</output
					>
				</label>
				<label class="number-picker"
					><span class="number-picker-label">Far:</span>
					<input
						type="range"
						class="number-picker-slider"
						min="1"
						max="400"
						step="1"
						bind:value={cameraClipFar.value}
					/><output class="number-picker-value ro"
						>({numf.format(cameraClipFar.value)})</output
					>
				</label>
			</fieldset>
			<fieldset>
				<legend>Backface</legend>

				<div class="checkbox-list">
					<label class="checkbox-list-item"
					><input type="checkbox" bind:checked={hideCW.value} /> <span class="checkbox-list-item-label ">Hide Clockwise Faces</span></label
				>
				<label class="checkbox-list-item"
					><input type="checkbox" bind:checked={hideCCW.value} /> <span class="checkbox-list-item-label ">Hide
										Counter-Clockwise Faces</span></label
				>
				<button onclick={setValue(hideNone)} value="true">
					Show All</button
				>
				<button onclick={setValue(hideAll)} value="true">
					Hide All</button
				>
				</div>
			</fieldset>
		</fieldset>
		</div>
		</div>


		</details>