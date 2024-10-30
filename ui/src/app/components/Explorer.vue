<template>
	<div class="themespace" :class="'themespace-'+themeId">
		<div class="instance" :id="'instance-'+instanceId">
			<div class="relative">
				<Loading v-if="loading"></Loading>
				<component v-if="rootLid" :is="paneComponent" v-bind="Pane()"></component>
			</div>
		</div>
	</div>
</template>

<script>
	import {range, uuid, dc, getDeepProp, inverseObject} from '../../libs/bp';
	import ExplorerMixin from '../mixins/Explorer';
	import Store from '../store';
	import Panes from '../instance/display/panes/panes';

	import Dom from '../mixins/Dom';

	import LightBox from '../display/viewers/LightBox';
	
	export default{
		mixins: [Dom, ExplorerMixin],
		
		provide(){
			return {
				storekey: this.storekey
			};
		},
					
		components: {
			...Panes,
			LightBox
		},
			
		data(){
			return {
				appLists: null,
				storekey: this.module
			};
		},
		
		computed: {
			paneComponent(){
				return this.Elements[this.getPaneList(this.rootLid).components.Pane].component;
			}
		},

		mounted(){
			this.loadApp();
		},
		
		methods:{			
			loadApp(){
				this.appLists = this.instance.app.value.lists;
			},
			
			Pane(){
				const {Pane} = this.getPaneList(this.rootLid).components;
				return {
					lid: this.rootLid, 
					filters: [], 
					eid: Pane,
					peid: null,
					class: this.Elements[Pane].class
				};
			},
					
			loadMeta({d: {lid}, force_refresh}){
				const pane = this.getPane(lid),
					stream = this.getPaneList(lid).stream.meta;
				if( !stream ) return;
							
				this.POST('/stream/meta/', {app_id: this.instance.app.id, lid: pane.list_id, stream: this.getPaneList(lid).stream.meta, refresh: force_refresh})
					.then((data) => {
						if( data.errors ) this.COMMIT(`ADD_STREAM_ERRORS`, {lid: pane.list_id, errors: data.errors});
						else this.COMMIT(`CHANGE_LIST_META`, {lid: pane.list_id, meta: data.meta});
					})
					.catch(er => console.log(er));
			},
			
			loadPage(e){
				this.loadStream(e);
			},
			
			refreshItems(e){
			},
			
			prepareStream(lid){
				const pane = this.getPane(lid),
					stream = this.getPaneList(lid).stream;
				
				if( !stream.sources || !stream.sources.length ) 
					return {pane, stream};
				
				let payload = this.getPaneList(lid).stream;
				if( stream.sources[0].dynamic === 1 ){
					const {list, children} = this.getPane(pane.parent);
					const selected = list.multiple ? inverseObject( children )[lid] : list.selected[0];
					payload = {meta: payload.meta, sources: payload.sources.map(s => ({...s, entity: selected}))};
				}
				
				return {pane, stream: payload};
			},
			
			loadStream({d:{lid, ...args}}){
				const {pane, stream} = this.prepareStream(lid);
				if( !stream.sources || !stream.sources.length ) return;
							
				this.POST('/stream/', {app_id: this.instance.app.id, args, stream, lid: pane.list_id})
					.then((data) => {
						this.commitStreamData(pane, lid, data, args);
					})
					.catch(er => console.log(er));
			},
			
			commitStreamData(pane, lid, data, args){
				if( data.errors ) this.COMMIT(`ADD_STREAM_ERRORS`, {lid: pane.list_id, errors: data.errors});
				this.COMMIT(`CHANGE_LIST_META`, {lid: pane.list_id, meta: data.meta});
				this.COMMIT(`CHANGE_LIST_ITEMS`, {lid: pane.list_id, items: data.items, page: data.meta.pagination.page});
				this.COMMIT(`UPDATE_PAGINATION`, {lid, pagination: data.meta.pagination});
				this.checkPreload(pane, lid, data, args);
			},
			
			checkPreload(pane, lid, data, args){
				const {viewer, select_key, multiple, selected, open} = pane.list;
				if( open ) return;
				
				if( viewer.preload !== -1 ){
					this.$nextTick(() => {
						if( multiple && viewer.preload === -2 ){
							data.items.forEach((e, i) => {
								const selected_value = getDeepProp(e, select_key);
								if( !selected.includes(selected_value) ) this.onSelect({lid, i, selected_value, viewer});
							});
						} else if(args.pagination.page === 0 && data.items[viewer.preload] !== undefined) {
							this.onSelect({lid, i:viewer.preload, selected_value: getDeepProp(data.items[viewer.preload], select_key), viewer});
						}
					});
				}
			}
		},
		
		store: Store
	};

</script>
