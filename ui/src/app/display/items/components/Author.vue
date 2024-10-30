<template functional>
	<div class="small-text" :class="[data.class, data.staticClass]" :style="data.staticStyle">
		<a v-if="props.it.extra.is_shared" class="d-block small-text color-hue mb-sm" :href="props.profileLink(props.it.extra.is_shared)" target="_blank">
			<fa icon="retweet" style="margin-right:.5em"></fa>{{ props.it.extra.is_shared.name }} {{ props.i18n.shared }}
		</a>
		<div class="d-flex ai-center">
			<div v-if="props.it.author.picture" class="media__head pr-sm">
				<a :href="props.profileLink(props.it.author)" target="_blank" :title="props.it.author.name">
					<figure class="size-sm round clipped">
						<img :src="props.it.author.picture" :alt="`Profile picture for ${props.it.author.name}`"/>
					</figure>
				</a>
			</div>
			<div class="media__body pr-sm">
				<div class="lh-125">
					<a class="h5 mb-none d-inline tw-semibold" :href="props.profileLink(props.it.author)" target="_blank" :title="props.it.author.name">{{ props.it.author.name }}</a>
					<span v-if="props.it.author.verified" class="ml-xs mr-sm">
						<fa icon="check-circle" :style="{color: props.verifiedTickColor}"></fa>
					</span>
					<span v-if="props.it.extra.story">{{ props.it.extra.story.replace(props.it.author.name, '') }}</span>
				</div>
				<div class="subtitle small-text">
					<a :href="props.itemLink(props.it)" target="_blank" class="color-hue">
						<time :datetime="props.it.created_time">{{ props.atTime(props.it.created_time) }}</time>
					</a>
				</div>
			</div>
		</div>
	</div>
</template>
