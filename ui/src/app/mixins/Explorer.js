import {BaseStore} from '../store';
import {dc, uuid} from '../../libs/bp';
import {notImplemented} from '../../libs/list/utils';	
		
export default {
	provide(){
		return {
			childPane: this.childPane,
			getSate: this.getState,
			getPane: this.getPane,
			getPaneList: this.getPaneList,
			getList: this.getList,
			onSelect: this.onSelect,
			breakChain: this.breakChain,
			deSelect: this.deSelect,
			refreshItems: this.refreshItems,
			clearSelection: this.clearSelection,
			loadPage: this.loadPage,
			loadMeta: this.loadMeta,
			getState: this.getState,
			COMMIT: this.COMMIT,
			DISPATCH: this.DISPATCH
		};
	},
	
	created(){
		this.initApp();
	},
	
	watch:{
		appLists(n, o){
			this.initApp();
		}
	},
	
	computed:{
		STATE(){
			return this.getState();
		},
		
		rootLid(){
			if( !this.STATE ) return null;
			return this.STATE.panes.rootLid;
		}
	},
	
	beforeDestroy(){
		this.COMMIT(`CLEAR_MODULE`);
		this.$store.unregisterModule(this.storekey);
	},
						
	methods:{
		getState(){
			return this.$store.state[this.storekey];
		},
		
		COMMIT(mutation, arg){
			this.$store.commit(`${this.storekey}/${mutation}`, arg);
		},
		
		DISPATCH(action, arg){
			this.$store.dispatch(`${this.storekey}/${action}`, arg);
		},
		
		initApp(){
			if( !this.appLists ) return;
			const {lists, root} = this.appLists;
			
			this.$store.registerModule(this.storekey, BaseStore(
				{
					panes: {rootLid: null},
					lists: {...lists}
				}
			));
									
			this.showHierarchy( null, root, 0 );
		},
		
		//loadList: notImplemented('loadList'),
		refreshItems: notImplemented('refreshItems'),
		loadPage: notImplemented('loadPage'),
		loadMeta: notImplemented('loadMeta'),
		
		showHierarchy(pid, lid, i=0, itemId){
			this.DISPATCH(`CREATE_PANE_TREE`, {lid, pid, i, itemId});
		},
				
		onSelect({lid, selected_value, i, viewer}){
			let child_list = null;
			const list = this.getPaneList(lid);
						
			if( list.child_list ){
				//console.log('Dynamic Ex');
				const lid = uuid(),
					lists = this.STATE.lists;
				
				this.COMMIT(`SET_LIST`, {
					lid, 
					list: {
						...dc( lists[list.child_list] ), 
						is_dynamic: list.child_list, 
						components: lists[list.child_list].components
					}
				});
				
				child_list = lid;
				if( !child_list ) return console.error('No child list');
			} else {
				child_list = list.items[i].child_list;
			}
									
			this.COMMIT(`SELECT_ITEM`, {lid, item: selected_value, viewer});
			this.showHierarchy( lid, child_list, 0, selected_value );
		},
				
		clearSelection(lid){},
		
		deSelect({lid, selected_value}){
			this.COMMIT(`DESELECT_ITEM`, {lid, selected_value});
		},		
			
		getPane(pid){
			return this.STATE.panes[pid];
		},
		
		getPaneList(pid){
			const {panes, lists} = this.STATE;
			return lists[ panes[pid].list_id ];
		},
		
		getList(lid){
			return this.STATE.lists[lid];
		},
		
		onCrumbClick(lid, i){
			console.log(lid, i);
			this.DISPATCH('LAST_PANE', {lid});
		},
		
		rootPane(h){
			return this.childPane(h, this.rootLid);
		},
		
		renderBreadCrumb(h){
			return h('div', this.$store.state.path.map((l, i) => [
				h('div', {class: 'crumb'}, [
					h('span', {on:{click: () => this.onCrumbClick(l.lid, i)}}, l.lid),
					h('code', JSON.stringify(l)),
				])
			]));
		},
		
		childPane( h, lid, filters=[] ){
			const list = lid && this.getPane(lid);
			if(list) return h('pane', {props: {lid, filters}});
			return null;
		}
	}
};
