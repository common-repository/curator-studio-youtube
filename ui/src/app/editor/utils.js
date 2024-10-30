import {putAtIndex, removeAtIndex} from '../../libs/list/editor';
import {createStreamList, createItemsList} from '../tree-helpers';
import {uuid, dc} from '../../libs/bp';
import {freeLid, clearList} from '../store';

const cloneLists = (state) => {
	const lists = {};
	for(const [k, v] of Object.entries(state.lists)){
		if( v && !v.is_dynamic ){
			lists[k] = {...v};
			delete lists[k].errors;
			if( v.stream.sources ) lists[k].items = [];
			lists[k].meta = null;
		}
	}
	return dc(lists);
};

const addGroup = (panes, lists, clid) => {
	const {list_id: clist_id, parent} = panes[clid];
	const list_id = uuid();
	
	lists[list_id] = createItemsList([
		{
			id: uuid(),
			name: 'New Group',
			child_list: clist_id
		}
	]);
	
	let root = panes[ panes.rootLid ].list_id;
	if( parent ){
		const list = lists[ panes[ parent ].list_id ];
		const item = list.items
			.find(it => it.child_list === clist_id);
		item.child_list = list_id;
	} else {
		root = list_id;
	}
	
	return {lists, list_id, itemsList: lists[list_id], root};
};

const removeGroup = (panes, lists, {lid, i}) => {
	const {list_id, parent} = panes[lid];
	const list = lists[list_id];
	const {child_list} = list.items[i];
	
	list.items = removeAtIndex(list.items, i);
	
	let root = panes[ panes.rootLid ].list_id;
	if( list.items.length ){
		clearList(lists, child_list);
	} else {
		freeLid(lists, list_id);
		
		if( parent ){
			const item = lists[ panes[ parent ].list_id ].items
				.find(it => it.child_list === list_id);
			item.child_list = child_list;
		} else {
			root = child_list;
		}
	}
	
	return {lists: nonEmptyValues(lists), root};
};

const addGroups = (panes, lists, clid, meta, items, autoChildList, getSourceOptions) => {
	const {list_id: clist_id, parent} = panes[clid];
				
	const lids = [clist_id, ...items.map(i => uuid())];
	const list_id = lids.pop();
	const streams_list = {};
	
	for(const [i, item] of items.entries()){
		const soptions = getSourceOptions(item[1][0]);
		streams_list[lids[i]] = createStreamList(
			item[1], 
			soptions.select_key,
			{is_leaf: soptions.content !== 'collection'}
		);
		
		lists[lids[i]] = streams_list[lids[i]];
		if( item[2] ){
			const uid = uuid();
			streams_list[uid] = autoChildList(item[2][0]);
			lists[uid] = streams_list[uid];
			lids.push(uid);
			streams_list[lids[i]].child_list = uid;
		}
	}
	
	lists[list_id] = {
		...createItemsList(items.map((it, i) => ({
			id: uuid(),
			name: it[0],
			child_list: lids[i]
		}))),
		stream: {
			meta,
			sources: null
		}
	};
							
	let root = panes[ panes.rootLid ].list_id;
	if( parent ){
		const list = lists[ panes[ parent ].list_id ];
		const item = list.items
			.find(it => it.child_list === clist_id);
		item.child_list = list_id;
	} else {
		root = list_id;
	}
	
	return {lists, list_id, itemsList: lists[list_id], root, clids: lids, streams_list};
};

const nonEmptyValues = obj => Object.entries(obj).reduce((acc, cur) => cur[1] ? Object.assign(acc, {[cur[0]]: cur[1]}) : acc, {});

export {cloneLists, addGroup, removeGroup, addGroups, nonEmptyValues};
