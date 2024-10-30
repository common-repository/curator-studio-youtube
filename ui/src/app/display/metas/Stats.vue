<template functional>
	<div class="small-text lh-1 mt-normal">
		<span v-for="stat in props.stats" class="d-inline-block mr-normal lc-mr-none">
			<strong class="color-text">{{ stat[0] }}</strong> {{ stat[1] }}
		</span>
	</div>
</template>
