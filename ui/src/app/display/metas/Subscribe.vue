<template functional>
	<a :href="props.url" target="_blank" class="button d-inline-flex ai-center bs-none pa-none" style="height:auto" :class="data.staticClass">
		<div class="pt-xs pb-xs pl-sm pr-sm" :style="props.css">
			<fa :icon="['fab', props.brand]" style="margin-right:.175em"></fa> {{ props.name }}
		</div>
		<div class="ml-sm pr-sm" v-if="props.stat">{{ props.stat }}</div>
	</a>
</template>
