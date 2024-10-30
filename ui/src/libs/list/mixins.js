import {getDeepProp, filter, dc} from '../bp';
import {sort, selectItem, deSelectItem, updatePagination, changeSearchFields, notImplemented} from './utils';

const ListItemMixin = {
	inject: ['handleItemSelect'],
	props: ['i', 'selectable', 'selected_value', 'is_selected', 'is_disabled'],
		
	methods: {
		onItemSelect(e){
			e.preventDefault();
			this.handleItemSelect(this);
		}
	}
};


const ListItemsMixin = {
	inject: ['makeItemProps', 'nativeItemProps', 'onItemSelect', 'handleItemSelect'],
	props: {
		Items: {
			type: Array,
			required: true
		},
		
		d: {
			type: Object,
			required: true
		},
		
		busy: {
			type: Boolean,
			default(){ return false; }
		}
	},
	
	computed: {
		itemProps(){
			return this.makeItemProps(this.Items);
		}
	},
	
	methods: {		
		ctx(ctx, data, i){
			return this.itemProps[i];
		}
	}
};


const ListSearchMixin = {
	computed: {
		itemsAfterSearch(){
			if( !this.d.search ) return this.itemsAfterSort;
			const {term, sync, field} = this.d.search;
			
			if( sync && term ){
				return this.itemsAfterSort.filter(it => getDeepProp(it, field).toLowerCase().includes(term.toLowerCase()));
			}
			
			return this.itemsAfterSort;
		}
	},
		
	watch: {
		'd.filter.filters'(n, o){
			if( this.d.filter.sync ) this.mayBeResetPagination();
			else this.callRefreshItems();
		},
		
		'd.sort.by'(n, o){
			if( this.d.sort.sync ) this.mayBeResetPagination();
			else this.callRefreshItems();
		},
				
		'd.search.term'(n, o){
			if( this.d.search.sync ) this.mayBeResetPagination();
			else this.callRefreshItems();
		}
	},
	
	methods: {
		callRefreshItems(){
			this.refreshItems({changeItems: this.changeItems, updatePagination: this.updatePagination, d: this.prepareArgs()});
		},
		
		mayBeResetPagination(){
			const {pagination} = this.d;
			if( pagination && pagination.sync ){
				this.updatePagination({page: 0});
			}
		},
		
		prepareArgs( isPagination=false, d ){
			const {search, sort, pagination, lid} = d || this.d;
			const args = {search:null, sort:null, pagination:null, lid};
			
			if( search && !search.sync ) args.search = search;
			if( sort && !sort.sync ) args.sort = sort;
			
			if( pagination && !pagination.sync ){
				if( isPagination ){
					args.pagination = pagination;
				} else {
					args.pagination = {...pagination, page:0, token: null, initial_tokens: []};
				}
			}
			
			return args;
		}
	}
};


const ListBaseMixin = {	
	mixins: [ListSearchMixin],
	
	computed: {
		itemsAfterFilter(){
			const {d} = this;
			if( !d.filter || !d.filter.sync )
				return this.getItems().slice();
			return filter(this.getItems(), d.filter.filters);
		},
		
		itemsAfterSort(){
			const {d} = this;
			if( !d.sort || !d.sort.sync )
				return this.itemsAfterFilter;
			return sort(this.itemsAfterFilter, d.sort);
		},
				
		Items(){
			return this.itemsAfterSearch;
		},
		
		itemProps(){
			return this.makeItemProps(this.Items);
		}
	},
	
	created(){
		this.$watch(() => this.getItems(), (n, o) => {
			if( n !== o ) this.clearSelection(this.d.lid);
		});
	},
		
	provide(){
		return {
			makeItemProps: this.makeItemProps,
			nativeItemProps: this.nativeItemProps,
			onItemSelect: this.onItemSelect,
			handleItemSelect: this.handleItemSelect,
			getD: this.getD
		};
	},
	
	methods: {
		getD(){
			return this.d;
		},
		
		getItems(){
			return this.items;
		},
		
		ctx(ctx, data, i){
			return this.itemProps[i];
		},
		
		makeItemProps(items){
			const {select_key, disabled, selected, selectable} = this.d;
			return items.map((d, i) => {
				const selected_value = select_key ? getDeepProp(d, select_key) : d;
				return {
					i, 
					is_selected: selected.includes(selected_value), 
					is_disabled: disabled.includes(selected_value),
					selected_value,
					//select_key,
					selectable
				};
			});
		},
				
		onItemSelect(e, ctx){
			e.preventDefault();
			this.handleItemSelect(ctx);
		},
		
		handleItemSelect(ctx){
			const {selected_value, i, is_selected, selectable, is_disabled} = ctx;
			if(is_disabled) return;
			
			const d = {selected_value, i, d: this.Items[i]};
			if( is_selected ) return this.deSelect(d);
			if( selectable ) return this.onSelect(d);
		},
		
		nativeItemProps(i){
			return this.itemProps[i];
		},
		
		nativeItemsProps(){
			return {Items: this.Items, d: this.d, busy: this.busy};
		},
		
		nativePaginationProps(){
			return {pagination: this.d.pagination, busy:this.busy, fetchPage: this.fetchPage};
		}
	}
};


const ListPropsMixin = {
	mixins: [ListBaseMixin],
	inject: ['onSelect', 'deSelect', 'updatePagination', 'loadPage', 'loadMeta', 'changeItems', 'addItems', 'refreshItems', 'clearSelection'],
	
	props: {
		d: {
			type: Object,
			required: true
		},
		
		items: {
			type: Array,
			required: true
		},
		
		meta: {
			type: Object
		},
		
		busy: {
			type: Boolean,
			default(){ return false; }
		}
	}
};


const ListMutatorsMixin = {
	provide(){
		return {
			onSelect: this.onSelect,
			deSelect: this.deSelect,
			updatePagination: this.updatePagination,
			changeItems: this.changeItems,
			addItems: this.addItems,
			changeSearchFields: this.changeSearchFields,
			loadPage: this.loadPage,
			loadMeta: this.loadMeta,
			refreshItems: this.refreshItems,
			clearSelection: this.clearSelection
		};
	},
	
	methods: {
		onSelect({selected_value}){
			selectItem(this.d, selected_value);
		},
		
		deSelect({selected_value}){
			deSelectItem(this.d, selected_value);
		},
		
		updatePagination(pagination){
			updatePagination(this.d, pagination);
		},
		
		changeMeta(meta){
			this.meta = meta;
		},
		
		changeItems(items){
			const {type, page} = this.d.pagination;
			if(page && type === 4){
				this.items.push(...items);
			} else {
				this.items = items;
			}
		},
		
		addItems(items){
			this.items.push(...items);
		},
		
		changeSearchFields(fields){
			changeSearchFields(this.d, fields);
		},
		
		clearSelection(...args){
			this.d.selected = [];
		},
		
		loadMeta: notImplemented('loadMeta'),
		loadPage: notImplemented('loadPage'),
		refreshItems: notImplemented('refreshItems')
	}
};


const ListPaginationMixin = {
	created(){
		this.$watch('itemsAfterSearch', this.paginate, {immediate: true});
		
		this.$watch('d', () => {
			if(this.d.pagination.query_on_load){
				this.updatePagination({query_on_load: false});
				this.fetchMeta();
				this.fetchPage();
			}
		}, {immediate: true});
	},
	
	computed: {
		Items(){
			return this.currentPageItems();
		},
		
		shouldShowPagination(){
			return this.Items.length && this.d.pagination.total_pages > 1;
		}
	},
	
	methods: {
		paginate(){
			const {sync, page} = this.d.pagination;
			if(sync) this.updatePagination({page, total_results: this.itemsAfterSearch.length});
		},
		
		currentPageItems(){
			const {per_page, page, sync, type} = this.d.pagination;
			if(!sync) return this.itemsAfterSearch;
			return this.itemsAfterSearch.slice((type !== 4) * page*per_page, (page+1)*per_page);
		},
		
		fetchPage(){
			this.loadPage({changeItems:this.changeItems, addItems: this.addItems, setPageToken:this.setPageToken, d: this.prepareArgs(true)});
		},
		
		fetchMeta(){
			this.loadMeta({d: this.d, changeMeta: this.changeMeta});
		},
		
		setPageToken(page, token){
			this.$set(this.d.pagination.initial_tokens, page, token);
		}
	}
};


const PaginationMixin = {
	mixins: [ListBaseMixin],
	props: {
		pagination: {
			type: Object,
			required: true
		},
		
		busy: {
			type: Boolean,
			default(){ return false; }
		},
		
		fetchPage: {
			type: Function,
			required: true
		}
	},
	
	inject: ['updatePagination'],
	
	provide(){
		return {
			onSelect: this.onSelect,
			clearSelection: this.clearSelection
		};
	},
						
	methods:{
		clearSelection(){},
		
		onSelect({i, selected_value, d}){
			this.goToPage( selected_value, d.token );
		},
											
		goToPage( page, token=null ){
			this.updatePagination({page, token});
			
			if(!this.pagination.sync){
				this.fetchPage();
			}
		},
	},
		
	computed: {
		listData(){
			let items = [], disabled = [];
			const {page, total_pages, type, initial_tokens} = this.pagination;
			const labels = this.getI18n( 'pagination' );
			
			if(type === 1){
				items = [
					{name: labels.first, value:0}, {name: labels.prev, value:page-1},
					...new Array(total_pages).fill().map((e, i) => ({name: i+1, value: i})),
					{name: labels.next, value:page+1}, {name: labels.last, value: total_pages-1}
				];
				if(page === 0) disabled = [-1];
				if(page === total_pages-1) disabled.push(total_pages);
				disabled.push(page);
			}
			else if(type === 2 || type == 4){
				if(page < total_pages-1) items = [{name: labels.next, value: page+1, token: initial_tokens[page+1]}];
			}
			else {
				items = [
					{name: labels.prev, value: page-1, token: initial_tokens[page-1]},
					{name: labels.next, value: page+1, token: initial_tokens[page+1]}
				];
				if(page === 0) disabled = [-1];
				if(page === total_pages-1) disabled.push(total_pages);
			}
			
			return {
				d: {
					select_key: 'value',
					selected: [page],
					disabled,
					selectable: true,
				},
				items
			};
		},
		
		items(){
			return this.listData.items;
		},
		
		d(){
			return this.listData.d;
		}
	}
};


const ListMixin = {
	mixins: [ListBaseMixin, ListMutatorsMixin]
};


export {ListMixin, ListPropsMixin, ListMutatorsMixin, ListPaginationMixin, ListItemMixin, ListItemsMixin, PaginationMixin};
