<script>
	import BaseMixin from '../../mixins/BaseMixin';
	import {ListEditorMixin, putAtIndex, removeAtIndex} from '../../../libs/list/editor';
	import {cloneLists, addGroup, removeGroup} from '../utils';
	import {uuid} from '../../../libs/bp';
	import {createStreamList} from '../../tree-helpers';
	
	import GroupItem from '../components/GroupItem.vue';
	import SimpleLightListItems from '../components/SimpleLightListItems.vue';
	
	export default {
		mixins: [BaseMixin, ListEditorMixin],
		inject: {
			updateStreams: {
				type: Function,
				required: true
			},
			changeStreams: {
				type: Function,
				required: true
			},
			getState: {
				type: Function,
				required: true
			},
			COMMIT: {
				type: Function,
				required: true
			},
			DISPATCH: {
				type: Function,
				required: true
			}
		},
		
		components: {
			GroupItem,
			ListItems: SimpleLightListItems
		},
				
		methods: {
			getDummyItem(){
				return {
					id: uuid(),
					name: 'New Group',
					child_list: null
				};
			},
			
			addItem(){
				const state = this.getState(),
					list_id = uuid(),
					lists = cloneLists(state),
					lid = state.panes[this.d.lid].list_id;
				
				lists[list_id] = createStreamList();
				lists[lid].items = putAtIndex(
					this.Items, 
					-1, 
					{...this.getDummyItem(), child_list: list_id}
				);
				
				const upsert = {
					[lid]: lists[lid], 
					[list_id]: lists[list_id]
				};
				
				this.updateStreams({upsert})
					.then((data) => {
						if(data){
							this.COMMIT(`SET_LIST`, {lid: list_id, list: lists[list_id]});
							this.COMMIT(`CHANGE_LIST_ITEMS`, {lid, items: lists[lid].items});
							this.$nextTick(() => this.handleItemSelect({
								...this.itemProps[this.Items.length-1], 
								lid: this.d.lid
							}));
						}
					})
					.catch(er => {
						console.log(er);
					});
			},
			
			removeItem(i){
				const state = this.getState(),
					nlists = cloneLists(state),
					{lists, root} = removeGroup(state.panes, nlists, {lid: this.d.lid, i});
				
				this.changeStreams(lists, root)
					.then((data) => {
						if(data){
							this.DISPATCH(`REMOVE_GROUP`, {lid: this.d.lid, i});
						}
					})
					.catch(er => console.log(er));
			},
			
			saveItem(d, i){
				const state = this.getState(),
					lid = state.panes[this.d.lid].list_id,
					lists = cloneLists({lists: {[lid]: state.lists[lid]}});
				
				lists[lid].items = putAtIndex(this.Items, i, d);
				
				this.updateStreams({upsert: {[lid]: lists[lid]}})
					.then((data) => {
						if(data){
							this.COMMIT(`CHANGE_LIST_ITEMS`, {lid, items: lists[lid].items});
							this.$nextTick(() => this.handleItemSelect({
								...this.itemProps[i === -1 ? this.Items.length-1 : i], 
								lid: this.d.lid
							}));
						}
					})
					.catch(er => console.log());
			},
			
			saveItems(items){
				const state = this.getState(),
					lid = state.panes[this.d.lid].list_id,
					lists = cloneLists({lists: {[lid]: state.lists[lid]}});
				
				lists[lid].items = items;
				
				this.updateStreams({upsert: {[lid]: lists[lid]}})
					.then((data) => {
						if(data){
							this.COMMIT(`CHANGE_LIST_ITEMS`, {lid, items: lists[lid].items});
							/*this.$nextTick(() => this.handleItemSelect({
								...this.itemProps[0], 
								lid: this.d.lid
							}));*/
						}
					})
					.catch(er => console.log());
			}
		}
	};
</script>
