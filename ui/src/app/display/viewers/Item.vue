<template>
	<div class="relative">
		<div class="absolute cursor-pointer bg-shadeb3 color-shadea3 viewer--close h4" 
			style="top:0;right:0;z-index:1000;transform:translate(50%, -50%)" 
			@click="closeViewer">
			<fa icon="times" fixed-width></fa>
		</div>
		<div class="card list-item">
			<div class="cols gap-none">
				<div v-if="it.media" class="col flex-none" :style="{width: mboxw}">
					<div ref="mediael">
						<Media v-bind="allProps()"></Media>
						<LinkBox v-if="it.title && it.extra.att" v-bind="allProps()" class="pa-normal"></LinkBox>
					</div>
				</div>
				<div class="col" :style="{'max-height': mboxh}" :class="{'scroll-y': !columnar}">
					<Author v-bind="allProps()" class="ma-normal" style="font-size:1.1em"></Author>
					<Stats v-if="cs_pro" v-bind="allProps()" style="font-size:1.1em"></Stats>
					<TextContent v-bind="allProps()" class="pa-normal"></TextContent>
					<span></span>
					<Comments v-if="showComments" :entity="selected_value" class="pa-normal bt-1 bc-shadea2"></Comments>
				</div>
			</div>
		</div>
	</div>
</template>
