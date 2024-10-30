<template>
	<div>
		<Loading v-if="loading"></Loading>
		<div>
			<div class="relative">
				<carousel 
					:per-page="1" 
					:navigation-enabled="false" 
					:pagination-enabled="false" 
					:adjustable-height="true"
					:navigate-to="current"
					pagination-color="#fff"
					ref="carousel"
					>
					<slide v-for="(it, i) in Items" :key="it.id">
						<Item :it="it" :selected_value="it.external_id" eid="simple-viewer__item" :peid="null"></Item>
					</slide>
				</carousel>
				<Navigation eid="carousel__navigation" 
					@select="select"
					:carousel="$refs.carousel"
					class="carousel__navigation--static carousel__navigation--static--inside">
				</Navigation>
			</div>
			<div class="pa-normal bg-shadeb5">
				<div class="cols gap-xs jc-center">
					<div class="col flex-none" v-for="(it, i) in Items">
					<figure
						:class="{'ba-2': itemProps[i].is_selected}" 
						class="cursor-pointer color-shadea5 clipped" 
						style="width:80px;height:80px"
						@click="onChoose(i)">
						<img :src="it.media[ it.media.length-1 ].url"/>
					</figure>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import {dc} from '../../../libs/bp';
	import {createListData} from '../../../libs/list/utils';
	import {ListMixin, ListPaginationMixin} from '../../../libs/list/mixins';
		
	import BaseMixin from '../../mixins/BaseMixin';
	import Loading from '../../components/Loading.vue';
	import ApiMixin from '../../mixins/ApiMixin';
		
	import Navigation from './Navigation.vue';
	
	export default {
		mixins: [BaseMixin, ListMixin, ListPaginationMixin, ApiMixin],
		inject: ['getCurrentAppId', 'getCurrentPane'],
		props: ['entity'],
		
		components: {
			Loading,
			Carousel: () => {
				return new Promise((resolve, reject) => {
					import('vue-carousel')
						.then(re => resolve(re.Carousel));
				});
			},
			Slide: () => {
				return new Promise((resolve, reject) => {
					import('vue-carousel')
						.then(re => resolve(re.Slide));
				});
			},
			Navigation
		},
				
		data(){
			return {
				current: 0,
				d: this.defaultD(),
				items: []
			};
		},
				
		watch: {
			entity(){
				this.d = this.defaultD();
				this.current = 0;
			}
		},
				
		methods: {
			defaultD(){
				return createListData({pagination: {per_page: 3, query_on_load: true}, select_key: 'external_id'});
			},
			
			loadMeta(){},
			
			loadPage({d}){
				const stream = {meta: {}, sources: [{source: 'facebook', edge: 'album-photos', entity: this.entity, dynamic: 1}]};
				
				this.POST('/stream/', {args:d, stream, app_id: this.getCurrentAppId(), lid: this.getCurrentPane().list_id})
					.then((data) => {
						this.changeItems( data.items );
						this.updatePagination( data.meta.pagination );
						this.resizeCarousel();
					})
					.catch(er => console.log(er));
			},
			
			resizeCarousel(){
				this.$nextTick(() => {
					setTimeout(() => {
						this.$refs.carousel.onResize();
					}, 500);
				});
			},
			
			onChoose(i){
				this.handleItemSelect(this.itemProps[i]);
				this.current = i;
			},
			
			select(dir){
				this.$refs.carousel.handleNavigation( dir );
			}
		}
	};
</script>
