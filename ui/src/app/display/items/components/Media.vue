<template functional>
	<div :class="[data.class, data.staticClass]">
		<div v-if="props.canOpen" class="d-flex jc-center bg-shadeb5">
			<VideoPlayer v-if="props.it.type === 'video' || props.it.type === 'gif'" :it="props.it" @load="props.onMediaLoad"></VideoPlayer>
			<Slider v-else-if="props.it.type === 'album' && props.it.extra.att.inline_album" 
				:Items="props.it.extra.att.sub_atts" 
				:select="props.select" 
				:slideChange="props.slideChange"
				:getCarousel="props.getCarousel"
				:cP="props.cP">
			</Slider>
		</div>
		<a v-else :href="props.attachmentLink(props.it)" 
			target="_blank" class="relative d-flex ai-center jc-center bg-shadeb5" 
			@click="props.onItemChoose">
			<figure>
				<img :src="props.thumbSrc" @load="props.onMediaLoad" style="max-height:80vh" :alt="props.it.title || props.it.text"/>
			</figure>
			<template v-if="props.it.type === 'video' || props.it.type === 'gif'">
				<div class="absolute cursor-pointer color-primary">
					<fa icon="play-circle" size="4x" :class="props.cP('drop-shadow')"></fa>
				</div>
				<div v-if="props.it.extra.live || props.it.duration" 
					class="color-shadea2 absolute pl-xs pr-sm small-text" 
					style="right:0;bottom:.5em" :class="{'bg-error': props.it.extra.live, 'bg-shadeb5': !props.it.extra.live}">
					{{ props.it.extra.live ? props.i18n.live : props.readableDuration(props.it.duration) }}
				</div>
			</template>
			<div v-else-if="props.collectionIcon" class="absolute cursor-pointer color-shadea2" style="right:.5em;top:.25em">
				<fa :icon="props.collectionIcon" size="1x" :class="props.cP('drop-shadow')"></fa>
			</div>
		</a>
	</div>
</template>
