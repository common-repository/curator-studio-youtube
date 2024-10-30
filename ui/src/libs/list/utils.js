import {getDeepProp, removeFromArray} from '../bp';

const selectItem = (list, item, viewer={}) => {
	if( item === null ) return false;
	if(!list.multiple){
		list.selected = [item];
	} else {
		if( !list.selected.includes(item) )
			list.selected.push(item);
	}
	list.viewer = {
		...list.viewer,
		autoplay: true,
		start: null,
		...viewer
	};
	return true;
};

const deSelectItem = (list, item) => {
	if(!list.allow_empty && list.selected.length === 1) return false;
	removeFromArray(list.selected, item);
	list.viewer = {
		...list.viewer,
		autoplay: true,
		start: null
	};
	return true;
};


const changeSearchFields = (list, {term}) => {
	list.search.term = term;
};


const updatePagination = (list, pagination) => {
	const {per_page, type} = list.pagination;
	
	if(pagination.total_results)
		pagination.total_pages = Math.ceil(pagination.total_results/per_page);
		
	Object.assign(list.pagination, pagination);
};


const defaultPaginationProps = () => ({
	page:0, 
	per_page:10, 
	total_pages:0, 
	total_results: 0, 
	max_results: 0, // 0 for no limit
	sync: false, 
	type: 1, // {1: classic, 2: load more, 3: prev / next, 4: load more (appended)}
	token:null, 
	has_token:false, 
	query_on_load: false, 
	initial_tokens:[],
	/*labels: {
		first: 'First',
		prev: 'Prev',
		next: 'Next',
		last: 'Last'
	}*/
});
	
	
const setupPaginationProps = ( pagination ) => {	
	const {total_results, per_page, initial_tokens} = pagination;
	
	if(total_results && per_page)
		pagination.total_pages = Math.ceil(total_results / per_page);
		
	if(initial_tokens && initial_tokens.length && [2, 3].includes(pagination.type)){
		pagination.has_token = true;
		pagination.token = initial_tokens[0];
	}
	
	return {...defaultPaginationProps(), ...pagination};
};


const createListData = ({
		lid=null, 
		selected=[], 
		disabled=[], 
		select_key=null, 
		selectable=true,
		multiple=false,
		allow_empty=false,
		search=null, 
		pagination=null,
		sort=null,
		filter=null,
		open=null,
		viewer={},
		is_leaf=true
	} = {}) => {
	
	if( pagination )
		pagination = setupPaginationProps(pagination);
	
	if( search )
		search = {...{term:'', sync:1, field:select_key}, ...search};
		
	if( sort )
		sort = {...{sync: 1, order: 1}, ...sort};
		
	return {
		lid,
		selected,
		disabled,
		select_key,
		selectable,
		multiple,
		allow_empty,
		search,
		pagination,
		sort,
		filter,
		is_leaf,
		open,
		viewer: {
			mode: 3,
			comments: 1,
			preload: -1,
			autoplay: false,
			start: null,
			...viewer
		}
	};
};

const sort = (items, {by, order}) => items.slice().sort((a, b) => getDeepProp(a, by) < getDeepProp(b, by) ? 1*order : -1*order);

const notImplemented = (fn) => {
	return () => console.error(fn, 'needs to be implemented');
};

export {selectItem, deSelectItem, changeSearchFields, updatePagination, createListData, sort, notImplemented};
