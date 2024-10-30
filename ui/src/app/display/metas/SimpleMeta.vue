<template>
	<div class="box pa-none clipped">
		<div v-if="coverPic" :style="'background-image: url('+ coverPic +'); height:180px'" class="bp-center"></div>
		<div class="d-flex ai-center flex-wrap pa-normal">
			<figure style="width:80px" :class="{'mr-md': !small, 'mr-sm': small}">
				<img :src="profilePic" :alt="meta.name"/>
			</figure>
			<div class="fg-1">
				<a class="d-block lh-1 h4" :href="profileLink" target="_blank"">{{meta.name}}</a>
				<Subscribe v-if="small" v-bind="subscribeProps" class="mt-sm"></Subscribe>
				<Stats v-else :stats="stats"></Stats>
			</div>
			<div>
				<Stats v-if="small" :stats="stats"></Stats>
				<Subscribe v-else v-bind="subscribeProps"></Subscribe>
			</div>
		</div>
	</div>
</template>
