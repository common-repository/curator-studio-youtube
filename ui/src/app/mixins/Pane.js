export default {
	props: ['lid', 'filters'],
	inject: {
		childPane: 'childPane',
		getPane: 'getPane',
		getList: 'getList',
		onSelectCache: 'onSelect',
		deSelectCache: 'deSelect',
		COMMIT: 'COMMIT',
		DISPATCH: 'DISPATCH',
		SchemaChanger: {
			default: null
		}
	},
	
	provide(){
		const pane = this;
		return{
			setBusyState: () => null,
			updatePagination: this.updatePagination,		
			getCurrentList: this.getCurrentList,		
			getCurrentPane: this.getCurrentPane,		
			changeItems: this.changeItems,	
			addItems: this.addItems,	
			changeSearchFields: this.changeSearchFields,
			selectElementForEdit: this.selectElementForEdit,
			onSelect: this.onSelect,
			deSelect: this.deSelect,
			getTypedComponent(c){
				return pane.components[c];
			}
		};
	},
	
	computed: {
		list(){
			return this.getList(this.pane.list_id);
		},
		
		pane(){
			return this.getPane(this.lid);
		},
		
		components(){
			return this.list.components;
		}
	},
								
	methods:{
		onSelect(arg){
			this.onSelectCache({lid: this.lid, ...arg});
		},
		
		deSelect(arg){
			this.deSelectCache({lid: this.lid, ...arg});
		},
		
		getCurrentList(){
			return this.list;
		},
		
		getCurrentPane(){
			return this.pane;
		},
		
		updatePagination(pagination){
			this.COMMIT(`UPDATE_PAGINATION`, {lid: this.lid, pagination});
		},
		
		changeItems(items){
			this.COMMIT(`CHANGE_ITEMS`, {lid: this.lid, items});
		},
		
		addItems(items){
			this.COMMIT(`ADD_ITEMS`, {lid: this.lid, items});
		},
					
		changeSearchFields({term}){
			this.COMMIT(`CHANGE_SEARCH_TERM`, {lid: this.lid, term});
		},
								
		listProps(){
			return {
				d:this.pane.list, 
				items: this.list.items, 
				filters: this.filters||[], 
				meta: this.list.meta
			};
		},
		
		selectElementForEdit(eid){
			let lid = this.pane.list_id;
			if( this.list.is_dynamic ){
				lid = this.getList( this.getPane(this.pane.parent).list_id ).child_list;
			}
			this.SchemaChanger.selectElement({lid, eid});
		}
	}
};
