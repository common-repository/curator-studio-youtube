<template functional>
	<div class="mb-normal mt-md d-flex ai-center" :class="data.staticClass">
		<button class="button medium mr-sm opacity-075 opacity-1-hover" @click="props.close">
			<fa icon="angle-left"></fa>
		</button>
		<span class="h3 tw-semibold ws-nowrap clipped to-ellipsis">{{ props.it.title }}</span>
	</div>
</template>
