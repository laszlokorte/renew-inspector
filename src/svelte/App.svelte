<script>
	import * as L from "partial.lenses";
	import * as R from "ramda";
	import {
		atom,
		view,
		read,
		combine,
		combineWithRest,
		failableView,
		bindValue,
		bindScroll,
		bindScrollMax,
		bindSize,
		string,
	} from "./svatom.svelte.js";
	import Scroller from "./Scroller.svelte";
	import SplashScreen from "./SplashScreen.svelte";
	import ThreeDee from "./ThreeDee.svelte";
	import RenewImport from "./Renew/Import.svelte";
	import { clamp, lerp } from "./utils.js";
	import favicon from "/favicon.svg";

	const numberFormat = new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	// Atoms
	
</script>

<SplashScreen icon={favicon} color="#fef0f0" />

<section>

	<h1>Renew Inspector</h1>

	<RenewImport />


	<ThreeDee />
	<div style:height="60vh"></div>
</section>

<style>
	@import url("app.css");

</style>
