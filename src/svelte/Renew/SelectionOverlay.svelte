<script>
	import * as L from "partial.lenses";
	import * as R from "ramda";
	import { untrack, tick } from "svelte";
	import * as Geo from "../geometry";
	import Navigator from "../Canvas/camera/Navigator.svelte";

	import { frameBoxLens } from "../Canvas/camera/lenses";

	import {
		atom,
		view,
		read,
		combine,
		combineWithRest,
		failableView,
		bindValue,
		bindSize,
		string,
		bindBoundingBox,
		update,
	} from "../svatom.svelte.js";

	import {
		parserAutoDetect,
		serializerV11,
		stringify,
		hierarchyV11,
		makeSerializer,
		makeGrammar,
		tryDeref as tryDerefInternal,
		kindKey as kindKeySymbol,
		selfKey as selfKeySymbol,
		refKey as refKeySymbol,
	} from "@petristation/renewjs";
	import * as renewFiles from "../../data/renew";

	const kindKey = "__kind";
	const selfKey = "__self";
	const refKey = "__ref";

	const numf = new Intl.NumberFormat((new Intl.NumberFormat()).resolvedOptions().locale, {maximumFractionDigits: 2, minimumFractionDigits: 2})

	const {selection, refMap, currentGrammar} = $props()


</script>
<div
	class={{ "selection-overlay": true, hidden: selection.value.length == 0 }}>

		<button
			type="button"
			onclick={(e) => {
				selection.value = [];
			}}>Clear Selection</button
		>
	<div
		class="selection-list"
	>
		{#each selection.value as s}
			{@const attrsSelected = read(
				[s, "attributes", "attrs", L.partsOf(L.keys)],
				refMap,
			)}
			{@const propsSelected = read(
				[
					s,
					L.partsOf(
						L.keys,
						L.when((x) => x != "attributes" && x[0] !== "_"),
					),
				],
				refMap,
			)}
			{@const selectedKind = read([s, kindKey], refMap)}
			<fieldset>
				<legend># {s} ({selectedKind.value})</legend>

				<h4>Props</h4>
				<dl>
					{#each propsSelected.value as prop}
						{@const isNumeric =
							[
								"x",
								"y",
								"w",
								"h",
								"fCurrentFontSize",
								"fCurrentFontStyle",
								"fOriginX",
								"fOriginY",
								"rotation",
							].indexOf(prop) > -1}
						{@const isJson = ["points"].indexOf(prop) > -1}
						{@const propValue = view(
							[
								s,
								prop,
								prop === "lines"
									? L.inverse(L.split("\n"))
									: L.identity,
								isNumeric
									? [L.setter((x) => parseFloat(x) || 0)]
									: L.choose((v) =>
											typeof v === "object"
												? [
														L.rewrite(v => v && v[refKey] ? {...v, [refKeySymbol]: true, ref: v[refKey]} : v),
														L.define(null),
														L.rewrite((e) =>
															e instanceof
															Error
																? null
																: e,
														),
														L.inverse(L.json()),
														L.defaults(""),
													]
												: L.identity,
										),
							],
							refMap,
						)}
						{@const propIsRef = view(
							[
								s,
								prop,
								L.lens((v) => v?.[refKey] ? v?.[refKey] : false, (v, o) => {
									const i = parseInt(v, 10);
									if (i>=0) {
										return {[refKeySymbol]: true, ref: i, [refKey]: i}
									} else {
										return v ? v : null
									}
								}),
							],
							refMap,
						)}
						<dt>{prop}</dt>
						<dd>
							{#if prop === "lines"}
								<textarea bind:value={propValue.value}
								></textarea>
							{:else if propIsRef.value !== false}
								<select bind:value={propIsRef.value}>
									{#each refMap.value as ref, r (r)}
											<option
												value={r}
												>#{r}</option
											>
									{/each}
								</select>
								<button type="button" onclick={e => {propIsRef.value = null}}>x</button>
								<small><code>{propValue.value}</code></small>

							{:else}
								<input
									type={isNumeric ? "number" : "text"}
									bind:value={propValue.value}
								/>
							{/if}
						</dd>
					{/each}
				</dl>
				<h4>Attributes</h4>
				<dl>
					{#each attrsSelected.value as attr}
						{@const attrType = view(
							[
								s,
								"attributes",
								"attrs",
								attr,
								(v) => {
									if(Object.hasOwnProperty.call(v, "r") && Object.hasOwnProperty.call(v, "g") && Object.hasOwnProperty.call(v, "b")) {
										return "color"
									}
									if(v === false || v === true) {
										return "bool"
									}
									if(Object.hasOwnProperty.call(v, refKey)) {
										return "ref"
									}

									return null
								},
							],
							refMap,
						)}
						{@const attrValue = view(
							[
								s,
								"attributes",
								"attrs",
								attr,
								attrType.value === "color"
									? [
											L.props("r", "g", "b"),
											L.lens(
												(x) =>
													`#${R.props(
														["r", "g", "b"],
														x,
													)
														.map((v) =>
															(
																"0" +
																v.toString(
																	16,
																)
															)
																.slice(-2)
																.toUpperCase(),
														)
														.join("")}`,
												(hex) =>
													R.map(
														(c) =>
															parseInt(c, 16),
														hex.match(
															/#(?<r>[a-f0-9]{2})(?<g>[a-f0-9]{2})(?<b>[a-f0-9]{2})/,
														).groups,
													),
											),
										]
									: L.identity,
							],
							refMap,
						)}
						<dt>{attr}</dt>
						<dd>
							{#if attrType.value === "color"}
							<label>Color<br>
							<input
								type={"color"}
								bind:value={attrValue.value}
							/></label>
								{@const alphaValue = view(
									[
										s,
										"attributes",
										"attrs",
										attr,
										"a",
										L.defaults(255),
										L.divide(255),
										L.lens((n) => numf.format(n), (s) => parseFloat(s))
									],
									refMap,
								)}
								<label>Alpha<input
									type={"number"}
									min="0"
									max="1"
									step="0.01"
									bind:value={alphaValue.value}
								/></label>
							{:else if attrType.value === "bool"}
							<label><input
									type="checkbox"
									bind:checked={attrValue.value}
								/> Bool</label>
							{:else if attrType.value === "int"}
							isInt
							{:else}

							<input
								type={"text"}
								bind:value={attrValue.value}
							/>
							{/if}
						</dd>
					{/each}
				</dl>
			</fieldset>
		{/each}
	</div>
</div>

<style>
	

	.selection-overlay {
		background: #333d; 
		align-self: start;
		justify-self: stretch;
		grid-area: 1 / 1 / -1 / 2;
		max-height: 100%;
		width: 100%;
		box-sizing: border-box;
		top: 1em; left: 1em;z-index: 10000; 
		display: grid;
		grid-template-rows: auto 1fr;
		flex-direction: column;
		gap: 1em;
		justify-content: stretch;
		justify-items: stretch;
	}

	.selection-list {
		display: flex; 
		flex-direction: column; 
		gap: 1em; 
		padding: 0.5em; 
		color: #fff;
		overflow: auto;
		overflow: auto;
	}

	dl {
		display: grid;
		grid-template-columns: 1fr 4fr;
		gap: 0.5ex 1em;
	}

	dt,
	dd {
		margin: 0;
		padding: 0;
		display: flex;
		gap: 1ex;
		align-items: center;
	}

	.hidden {
		display: none;
	}

	legend {
		background: #000a;
		padding: 1ex;
	}

	fieldset {
		overflow: visible;
		border: 3px solid #000a;
	}

	input:not([type=checkbox], [type=radio]), select {
		align-self: stretch;
		justify-self: stretch;
		flex-grow: 1;
		width: 100%;
		padding: 1ex;
	}

	input[type=color] {
		width: 3em;
		padding: 0;
		border: 1px solid #000;
		border-radius: 0;
		outline: none;
	}
</style>