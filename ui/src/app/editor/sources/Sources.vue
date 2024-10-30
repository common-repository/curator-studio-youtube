<template>
	<div class="box mb-normal">
		<Draggable v-model="draggables" @start="dragging = true" @end="dragging = false">
			<StreamSource v-for="(it, i) in Items" :item="it" :index="i" :key="[it.source, it.edge, it.entity].join('-')"
				:src="sourceOptions[usource(it)]"
				:error="sourceErrors[i]"
				@save-item="saveItem" 
				@cancel-edit="cancelEdit"
				@remove-item="removeItem"
				class="mb-normal cursor-move">
			</StreamSource>
		</Draggable>
		<StreamSource v-if="editor.item && editorSource" :item="editor.item" :index="editor.index" 
			:src="editorSource" 
			@save-item="saveItem" 
			@cancel-edit="cancelEdit"
			class="mb-normal">
		</StreamSource>
		<div v-if="allowMultiple">
			<div class="select tw-semibold h5 mt-sm mb-sm">
				<select v-model="selectedSourceType" @change="addSource" :disabled="!!editor.item">
					<option v-for="[v, i] in sourceOptionTitles" :value="i" :disabled="i===-1">{{v}}</option>
				</select>
			</div>
		</div>
	</div>
</template>

<script>
	import {ListPropsMixin} from '../../../libs/list/mixins';
	import {createListData} from '../../../libs/list/utils';
	import {ListEditorMixin, putAtIndex, removeAtIndex} from '../../../libs/list/editor';
	import {uuid, dc, hashObject} from '../../../libs/bp';

	import BaseMixin from '../../mixins/BaseMixin';
	import {createStreamList, createItemsList} from '../../tree-helpers';
	import {freeLid, clearList, deleteChain} from '../../store';
	import {cloneLists, addGroups, nonEmptyValues} from '../utils';
	import MutationsMixin from '../mixins/mutations';

	import StreamSource from './StreamSource.vue';
	import SourceOptions from '../../instance/sources/sources';
		
	import Draggable from 'vuedraggable';

	const Helpers = {
		props: ['originalItems'],
		computed: {
			draggables: {
				get(){
					return this.Items;
				},
				
				set( items ){
					this.resetRefresh(items);
				}
			},
						
			sourceErrors(){
				const errors = this.getState().lists[ this.lid ].errors;
				if( !errors ) return [];
				
				return this.Items.map(e => errors[hashObject(e)]);
			}
		},
		
		watch:{
			originalItems(n, o){
				this.COMMIT('REMOVE_STREAM_ERRORS', this.lid);
			}
		},
		
		methods: {
			autoChildList(source){
				const {fields, select_key, type} = this.getSourceOptions(source);
				const stream = createStreamList(
					[{
						...dc( fields ), 
						entity: 'Auto', 
						dynamic: 1
					}],
					select_key
				);
				stream.list.is_leaf = type === 'item';
				return stream;
			},
			
			addChildList(lists, source, list, sources){
				const lid = uuid();
				lists[lid] = this.autoChildList(source);
				
				lists[this.lid].list = {...lists[this.lid].list, ...list};
				lists[this.lid].child_list = lid;
				lists[this.lid].stream.sources = sources;
							
				return {
					upsert: {
						[lid]: lists[lid], 
						[this.lid]: lists[this.lid]
					}, 
					lid
				};
			},
			
			removeSourceWithChild(lists){
				const {child_list} = lists[this.lid];
				
				lists[this.lid].child_list = null;
				lists[this.lid].stream.sources = [];
				
				return {
					upsert: {
						[this.lid]: lists[this.lid]
					}, 
					remove: [child_list]
				};
			},
			
			updatesForPage(lists){
				for(const it of lists[this.lid].items){
					clearList(lists, it.child_list);
				}
				
				lists[this.lid] = createStreamList();
				
				return {
					lists: nonEmptyValues(lists),
					root: this.$store.state[this.storekey].panes[ this.$store.state[this.storekey].panes.rootLid ].list_id
				};
			}
		}
	};


	export default {
		mixins: [BaseMixin, ListPropsMixin, ListEditorMixin, Helpers, MutationsMixin],
		inject: {
			getPane: {
				type: Function,
				required: true
			},
			loadMeta: {
				type: Function,
				required: true
			},
			mergeListList: {
				type: Function,
				required: true
			}
		},
		
		props: {
			lid: {
				type: String,
				required: true
			},
			pid: {
				type: String,
				required: true
			},
			defaultSourceType: {
				required: true
			}
		},
		
		components: {
			StreamSource,
			Draggable
		},
		
		data(){
			return {
				selectedSourceType: 0
			};
		},
		
		watch:{
			lid(){
				this.selectedSourceType = 0;
				this.resetEditor();
			}
		},
		
		computed:{
			sourceOptionTitles(){
				const options = Object.values(Object.entries(this.sourceOptions).sort((a, b) => a[1].title > b[1].title ? 1 : -1).reduce((acc, [k, v]) => {
					const k2 = k.split('--')[0];
					if( !acc[k2] ) acc[k2] = [];
					acc[k2].push([v.title, k]);
					return acc;
				}, {}));
				const opts = [['Show...', 0]];
				for(const o of options){
					opts.push(['---', -1], ...o);
				}
				return opts;
			},
			
			allSourceOptions(){
				return SourceOptions.reduce((acc, cur) => Object.assign(acc, {[this.usource(cur.fields)]: cur}), {});
			},
			
			sourceOptions(){
				const {sourceType, allSourceOptions} = this;
				if( !sourceType ) return allSourceOptions;
				const options = {};
				for(const [k, v] of Object.entries(allSourceOptions)){
					if( v.type === sourceType ) options[k] = v;
				}
				return options;
			},
			
			editorSource(){
				return this.allSourceOptions[this.selectedSourceType];
			},
			
			sourceType(){
				return this.Items.length ? this.getSourceType( this.Items[0] ) : this.defaultSourceType;
			},
			
			allowMultiple(){
				if( !this.Items.length ) return true;
				const [{dynamic, edge}] = this.Items;
				return !dynamic && !edge.startsWith('profile') && this.cs_pro;
			}
		},
				
		methods: {
			usource(src){
				return `${src.source} - ${src.edge}`;
			},
			
			getSourceType(src){
				return this.allSourceOptions[ this.usource(src) ].type;
			},
			
			getSourceOptions(src){
				return this.allSourceOptions[ this.usource(src) ];
			},
			
			addSource(e){
				if( this.selectedSourceType ){
					this.resetEditor();
					this.addItem();
				}
			},
					
			getDummyItem(){
				if( this.selectedSourceType ){
					return this.sourceOptions[this.selectedSourceType].fields;
				}
				return null;
			},
			
			changeProfileChildren(items, d, prev){
				const upsert = {};
				const state = this.getState();
				const lists = cloneLists({lists: state.lists[this.lid].items.reduce((acc, cur) => 
					Object.assign(acc, {
						[cur.child_list]: state.lists[cur.child_list]
					}), {}
				)});
				
				for(const [lid, list] of Object.entries(lists)){
					const stream = list.stream;
					if(stream.sources && stream.sources.length === 1){
						const src = stream.sources[0];
						for(const nit of items){
							if( src.source === nit[1][0].source && src.edge === nit[1][0].edge && src.entity === prev.entity){
								stream.sources = [{...src, entity: d.entity}];
								upsert[lid] = list;
							}
						}
					}
				}
				
				return upsert;
			},
			
			enrichProfileChild(e, meta){
				const entity = (meta.edge.endsWith('--shortcode') || meta.edge.endsWith('--url-parameter')) ? '__AUTO_STREAM__' : meta.entity;
				e[1][0].entity = entity;
				return e;
			},
			
			addPage(d, prev, select_key){
				const meta = dc(d);
				const items = dc(this.allSourceOptions[this.usource(d)].children)
					.map(e => this.enrichProfileChild(e, meta));
							
				const state = this.getState();
				
				if( state.lists[this.lid].items.length ){
					const upsert = cloneLists({lists: {[this.lid]: state.lists[this.lid]}});
					const replaced = this.changeProfileChildren(items, d, prev);
					upsert[this.lid].stream.meta = d;
										
					this.updateStreams({upsert:{...upsert, ...replaced}})
						.then((data) => {
							if( data ){
								this.COMMIT(`CHANGE_STREAM_META`, {lid: this.lid, meta: d});
								for(const lid in replaced){
									this.COMMIT('CHANGE_STREAM_SOURCES', {sources: replaced[lid].stream.sources, lid});
								}
								this.loadMeta({d: {lid: this.pid}});
								
								{
									const clid = state.panes[this.pid].clid;
									if( replaced[ state.panes[clid].list_id ] ){
										this.CallLoadPage( clid );
									}
								}
							}
						})
						.catch(er => console.log(er));
				} else {
					const {lists, root, list_id, clids, itemsList, streams_list} = addGroups(
						state.panes, 
						cloneLists(state), 
						this.pid, 
						meta, 
						items,
						this.autoChildList,
						this.getSourceOptions
					);
					
					lists[list_id].list = {...lists[list_id].list, select_key, is_leaf: false};
					
					this.changeStreams(lists, root)
						.then((data) => {
							if( data ){
								this.COMMIT(`UPDATE_LIST_LIST`, {lid:this.lid, pid:this.pid, list:{select_key, is_leaf: false}});
								this.DISPATCH(`ADD_GROUPS`, {lid: this.pid, list_id, clids, itemsList, streams_list});
							}
						})
						.catch(er => console.log(er));
				}
			},
							
			saveItem(d, i, prev, pristine){
				const items = putAtIndex(this.Items, i, d),
					state = this.getState(),
					{type, content, source, select_key} = this.allSourceOptions[this.usource(d)],
					is_leaf = type === 'item';
					
				if( pristine ){
					return this[ type === 'profile' ? 'loadMeta' : 'refreshItems']({
						d: this.prepareArgs(false, this.getPane(this.pid).list), 
						force_refresh: i
					});
				}
							
				if( type === 'profile' ){
					return this.addPage(d, prev, select_key);
				} else if( content === 'collection' ){
					if( !state.lists[this.lid].child_list ){
						const {upsert, lid} = this.addChildList(
							cloneLists(state), 
							source,
							{select_key, is_leaf}, 
							items
						);
						
						this.updateStreams({upsert})
							.then((data) => {
								if(data){									
									this.COMMIT(`SET_LIST`, {lid, list: this.autoChildList(source)});
									this.COMMIT(`UPDATE_LIST`, {lid:this.lid, list:{child_list: lid}});
									this.COMMIT(`UPDATE_LIST_LIST`, {lid:this.lid, pid:this.pid, list:{select_key, is_leaf}});
									this.COMMIT(`CHANGE_STREAM_SOURCES`, {sources: items, lid: this.lid});
									this.CallLoadPage();
								}
							})
							.catch(er => {
								console.log(er);
							});
					} else {
						this.resetRefresh(items);
					}
				} else {
					const list = state.lists[this.lid].list;
					if( list.select_key !== select_key || list.is_leaf !== is_leaf ){
						this.mergeListList(this.lid, {select_key, is_leaf})
							.then((data) => {
								if( data ){
									this.COMMIT(`UPDATE_LIST_LIST`, {lid:this.lid, pid:this.pid, list:{select_key, is_leaf}});
									this.resetRefresh(items);
								}
							})
							.catch(er => {
								console.log(er);
							});
					} else {
						this.resetRefresh(items);
					}
				}
			},
							
			removeItem(i){
				const items = removeAtIndex(this.Items, i);
				const state = this.$store.state[this.storekey];
				
				if( this.Items.length === 1 ){
					const {content, type} = this.allSourceOptions[this.usource(this.Items[0])];
					if( content === 'collection' ){
						const updates = this.removeSourceWithChild( cloneLists(state) );
						this.updateStreams(updates)
							.then((data) => {
								if(data){
									const {child_list} = state.lists[this.lid];
									this.COMMIT(`DELETE_CHAIN`, {start: this.pid, clear_self: false});
									this.COMMIT(`FREE_LID`, child_list);
									this.COMMIT(`UPDATE_LIST`, {lid:this.lid, list:{child_list: null}});
									this.resetRefresh(items);
								}
							})
							.catch(er => console.log(er));
					}
					else if( type === 'profile' ){
						const {lists, root} = this.updatesForPage( cloneLists(state) );
						this.changeStreams(lists, root)
							.then((data) => {
								if(data){
									for(const it of state.lists[this.lid].items){
										this.COMMIT(`CLEAR_LIST`, it.child_list);
									}
									
									this.COMMIT(`SET_LIST`, {lid: this.lid, list: createStreamList()});
									this.COMMIT(`DELETE_CHAIN`, {start: this.pid, clear_self: false});
								}
							})
							.catch(er => console.log(er));
					} else {
						this.resetRefresh(items);
					}
				} else {
					this.resetRefresh(items);
				}
			},
			
			CallLoadPage(pid=null){
				const pane = this.getPane( pid||this.pid );
				this.COMMIT(`REMOVE_STREAM_ERRORS`, pane.list_id);
				this.resetEditor();
				this.loadPage({d: this.prepareArgs(false, pane.list)});
			},
					
			CallRefreshItems(){
				this.COMMIT(`REMOVE_STREAM_ERRORS`, this.lid);
				this.refreshItems({d: this.prepareArgs(false, this.getPane(this.pid).list)});
			},
			
			resetRefresh(sources){
				this.COMMIT(`CHANGE_STREAM_SOURCES`, {sources, lid: this.lid});
				this.resetEditor();
				this.CallRefreshItems();
			}
		}
	};
</script>
