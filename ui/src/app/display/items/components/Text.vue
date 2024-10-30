<template functional>
	<div class="card__content" :class="[data.class, data.staticClass]">
		<span v-html="props.excerpt.text" class="ws-pre-wrap"></span>
		<a href="#" v-if="props.excerpt.hint !== null" class="ml-sm" @click="props.toggleExcerpt">{{ props.excerpt.hint }}</a>
	</div>
</template>
