<template functional>
	<div class="card--highlight" :class="[data.class, data.staticClass]">
		<a :href="props.attachmentTitleLink(props.it)" target="_blank" @click="props.onItemChoose">
			<p v-html="props.it.title"></p>
			<span v-if="props.it.items" class="small-text color-shadeb1 d-block">{{ props.it.items }} {{ props.itemsLabel }}</span>
			<p class="color-hue" v-if="props.it.extra.att" v-html="props.it.extra.att.text"></p>
		</a>
	</div>
</template>
