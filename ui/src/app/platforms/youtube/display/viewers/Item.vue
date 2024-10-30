<template>
	<div class="relative">
		<div class="absolute cursor-pointer bg-shadeb3 color-shadea3 viewer--close h4" 
			style="top:0;right:0;z-index:1000;transform:translate(50%, -50%)" 
			@click="closeViewer">
			<fa icon="times" fixed-width></fa>
		</div>
		<div class="card list-item">
			<div class="cols gap-none">
				<div class="col flex-none" :style="{width: mboxw}">
					<div ref="mediael">
						<Media v-bind="allProps()"></Media>
					</div>
				</div>
				<div class="col" :style="{'max-height': mboxh}" :class="{'scroll-y': !columnar}">
					<div class="pa-normal">
						<div class="mb-sm">
							<div v-if="it.extra.tags">
								<a v-for="tag in it.extra.tags.slice(0, 4)" :href="searchLink(`#${tag}`)" target="_blank" class="mr-sm">#{{ tag }}</a>
							</div>
							<h5 class="title h5 lh-115" v-html="it.title"></h5>
						</div>
						<div class="pb-sm d-flex jc-between ai-end flex-wrap">
							<div>
								<span class="mr-sm" v-if="cs_pro">{{ localNumber(it.views) }} {{i18n.views}} <span class="mr-sm"></span>• </span>
								<time :datetime="it.created_time">{{ atTime(it.created_time) }}</time>
							</div>
							<div v-if="cs_pro" class="d-flex color-hue">
								<div class="mr-normal">
									<fa icon="thumbs-up"></fa><span class="ml-xs" v-if="it.likes">{{ numFormat(it.likes) }}</span>
								</div>
								<div>
									<fa icon="thumbs-down"></fa><span class="ml-xs" v-if="it.dislikes">{{ numFormat(it.dislikes) }}</span>
								</div>
							</div>
						</div>
						<div class="bt-1 bc-shadea2 pt-sm pb-sm">
							<h6 class="tw-bold h6">{{ it.author.name }}</h6>
							<Subscribe v-bind="subscribeProps()" class="mt-xs"></Subscribe>
							<div class="mt-sm">
								<span v-html="excerpt.text" class="ws-pre-wrap"></span>
								<a href="#" v-if="excerpt.hint !== null" class="ml-sm" @click="toggleExcerpt">{{ excerpt.hint }}</a>
							</div>
						</div>
						<Comments v-if="showComments" :entity="selected_value" class="pt-normal bt-1 bc-shadea2"></Comments>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
