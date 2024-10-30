import Vue from 'vue';
import Vuex from 'vuex';

import {getDeepProp, filterD, uuid, dc, hashObject} from '../libs/bp';
import {createListData, selectItem, deSelectItem, updatePagination, changeSearchFields} from '../libs/list/utils';
import {putAtIndex, removeAtIndex} from '../libs/list/editor';

Vue.use(Vuex);

const createPaneData = ({
		lid, 
		styles={inside:0},
		clid=null,
		list_id,
		list
	}) => {
			
	return {
		lid, 
		clid,
		styles,
		list_id,
		list,
		children: list.multiple ? {} : null,
		parent: null,
		view: null
		//list: createListData({lid, ...list}) 
	}
};

		
const clearLid = (panes, lid) => {
	panes[lid] = null;
};

const deleteChain = ({panes, lists, start, clear_self=true, itemId=null}) => {
	const deleteSubChain = (pid, clear_self=true, itemId=null) => {
		if( !pid ) return;
		if(panes[pid].list.multiple){
		//if(panes[pid].children){
			if( itemId !== null ){
				deleteSubChain(panes[pid].children[itemId]);
				Vue.delete(panes[pid].children, itemId);
			} else {
				Object.values(panes[pid].children).forEach((id) => deleteSubChain(id));
				panes[pid].children = {};
			}
		} else {
		//} else if(panes[pid].clid) {
			deleteSubChain(panes[pid].clid);
			panes[pid].clid = null;
		}
		if(clear_self) {
			if( lists[ panes[pid].list_id ] && lists[ panes[pid].list_id ].is_dynamic ){
				freeLid(lists, panes[pid].list_id);
			}
			clearLid(panes, pid);
		}
	};
		
	deleteSubChain(start, clear_self, itemId);
};

const getListItemIndex = (panes, lists, parent, clist_id) => {
	const list = lists[ panes[ parent ].list_id ];
	return list.items
		.findIndex(it => it.child_list === clist_id);
};

const getListItemId = (panes, lists, parent, clist_id) => {
	const list = lists[ panes[ parent ].list_id ];
	return list.items
		.find(it => it.child_list === clist_id).id;
};

const BaseStore = (state) => {
	return {
		namespaced: true,
		state,
		
		mutations: {
			ADD_PANE({panes}, list){
				Vue.set(panes, list.lid, list);
			},
			
			ADD_CHILD_PANE_OF({panes}, {lid, clid, item}){
				panes[clid].parent = lid;
				if( !panes[lid].list.multiple ){
					panes[lid].clid = clid;
				} else { 
					Vue.set(panes[lid].children, item, clid);
				}
			},
			
			SELECT_ITEM({panes, lists}, {lid, item, viewer}){
				selectItem(panes[lid].list, item, viewer);
				if( !panes[lid].list.multiple )
					deleteChain({panes, lists, start:lid, clear_self:false});
			},
			
			SET_ROOT_LID({panes}, lid){
				panes.rootLid = lid;
			},
			
			DESELECT_ITEM({panes, lists}, {lid, selected_value}){
				const deselected = deSelectItem(panes[lid].list, selected_value);
				if( deselected ) deleteChain({panes, lists, start:lid, clear_self:false, itemId:selected_value});
			},
			
			CLEAR_SELECTION({panes, lists}, lid){
				panes[lid].list.selected = [];
				deleteChain({panes, lists, start:lid, clear_self:false, itemId: null});
			},
			
			CHANGE_LIST_META({lists}, {lid, meta}){
				Vue.set(lists[lid], 'meta', {...(lists[lid].meta||{}), ...meta});
			},
			
			CHANGE_LIST_ITEMS({lists}, {lid, items, page=0}){
				if( page && lists[lid].list.pagination.type === 4 ){
					lists[lid].items.push(...items);
				} else {
					lists[lid].items = items;
				}
			},
						
			UPDATE_PAGINATION({panes}, {lid, pagination}){
				updatePagination(panes[lid].list, pagination);
			},
			
			CHANGE_SEARCH_TERM({panes}, {lid, term}){
				changeSearchFields(panes[lid].list, {term});			
			},
			
			CHANGE_STREAM_SOURCES({lists}, {sources, lid}){
				lists[lid].stream.sources = sources;
			},
			
			CHANGE_STREAM_META({lists}, {lid, meta}){
				lists[lid].stream.meta = meta;
			},
						
			ADD_STREAM_ERRORS({lists}, {errors, lid}){
				Vue.set(lists[lid], 'errors', errors);
			},
			
			REMOVE_STREAM_ERRORS({lists}, lid){
				Vue.delete(lists[lid], 'errors');
			},
			
			CLEAR_MODULE({panes, lists}){
				const {rootLid} = panes;
				if( !rootLid ) return;
				clearList(lists, panes[rootLid].list_id);
				deleteChain({panes, lists, start:rootLid});
				panes.rootLid = null;
			},
			
			FREE_LID({lists}, lid){
				freeLid(lists, lid);
			},
			
			CLEAR_LIST({lists}, lid){
				clearList(lists, lid);
			},
			
			SET_LIST({lists}, {lid, list}){
				Vue.set(lists, lid, list);
			},
			
			UPDATE_LIST({lists}, {lid, list}){
				lists[lid] = {...lists[lid], ...list};
			},
			
			UPDATE_LIST_LIST({panes, lists}, {lid, pid, list}){
				lists[lid].list = {...lists[lid].list, ...list, lid:null};
				if(pid) panes[pid].list = {...panes[pid].list, ...dc(list), lid: pid};
			},
			
			CHANGE_ITEM_CHILDLIST({panes, lists}, {pid, list_id, clist_id}){
				const idx = getListItemIndex(panes, lists, pid, clist_id);
				const list = lists[ panes[ pid ].list_id ];
				list.items.splice(idx, 1, {...list.items[idx], child_list: list_id});
			},
			
			DELETE_CHAIN({panes, lists}, {start, clear_self, itemId}){
				deleteChain({panes, lists, start, clear_self, itemId});
			},
			
			CHANGE_LIST_COMPONENT({lists}, {component, lid, eid}){
				lists[lid].components[component] = eid;
			},
			
			CHANGE_LIST_COMPONENTS({lists}, {components, lid}){
				lists[lid].components = components;
			},
			
			SET_PANE_VIEW({panes}, {lid, view}){
				panes[lid].view = view;
			},
			
			SET_PANE_CHILDREN({panes}, {lid, children}){
				panes[lid].children = children;
			}
		},
		
		actions:{
			ADD_GROUPS({dispatch, commit, state:{panes, lists}}, {lid:clid, clids, list_id, itemsList, streams_list}){
				const {list_id: clist_id, parent} = panes[clid];
										
				for(const c of clids){
					commit('SET_LIST', {lid: c, list: streams_list[c]});
				}
				
				commit('SET_LIST', {lid: list_id, list: itemsList});
										
				let itemId;
				if( parent ){
					commit('CHANGE_ITEM_CHILDLIST', {pid:parent, list_id, clist_id});
					itemId = getListItemId(panes, lists, parent, list_id);
					commit('DELETE_CHAIN', {start:parent, clear_self:false, itemId});
				} else {
					commit('DELETE_CHAIN', {start:clid, clear_self:true});
				}
				
				dispatch('CREATE_PANE_TREE', {pid: parent, lid: list_id, i:0, itemId});
			},
			
			ADD_GROUP({dispatch, commit, state:{panes, lists}}, {clid, list_id, itemsList}){
				const {list_id: clist_id, parent} = panes[clid];
				
				commit('SET_LIST', {lid: list_id, list: itemsList});
				
				let itemId;
				if( parent ){
					commit('CHANGE_ITEM_CHILDLIST', {pid:parent, list_id, clist_id});
					itemId = getListItemId(panes, lists, parent, list_id);
					commit('DELETE_CHAIN', {start:parent, clear_self:false, itemId});
				} else {
					commit('DELETE_CHAIN', {start:clid, clear_self:true});
				}
				
				dispatch('CREATE_PANE_TREE', {pid: parent, lid: list_id, i:0, itemId});
			},
			
			REMOVE_GROUP({dispatch, commit, state:{panes, lists}}, {lid, i}){
				const {list_id, parent} = panes[lid];
				const list = lists[list_id];
				const {id: oitemId, child_list:clist_id} = list.items[i];
				
				commit('CHANGE_LIST_ITEMS', {lid: list_id, items: removeAtIndex(list.items, i)});
				
				if( list.items.length ){
					commit('CLEAR_LIST', clist_id);
					
					const {id, child_list} = list.items[i ? i-1 : i];
					
					if( list.list.multiple ){
						commit('DELETE_CHAIN', {start:lid, clear_self:false, itemId: oitemId});
					}
									
					if( !list.list.multiple || !panes[lid].children[id] ){
						commit('SELECT_ITEM', {lid, item: id});
						dispatch('CREATE_PANE_TREE', {pid: lid, lid: child_list, i:0, itemId:id});
					}
				} else {
					commit('FREE_LID', list_id);
					
					let itemId;
					if( parent ){
						commit('CHANGE_ITEM_CHILDLIST', {pid:parent, list_id:clist_id, clist_id:list_id});
						itemId = getListItemId(panes, lists, parent, clist_id);
						commit('DELETE_CHAIN', {start:parent, clear_self:false, itemId:oitemId});
					} else {
						commit('DELETE_CHAIN', {start: lid, clear_self:true});
					}
					
					dispatch('CREATE_PANE_TREE', {pid: parent, lid: clist_id, i:0, itemId});
				}
			},
			
			CREATE_PANE_TREE({dispatch, commit, state: {panes, lists}}, {pid:ppid, lid, i, itemId}){
				while(lid){
					const list = lists[lid];
					const pid = uuid();
					commit('ADD_PANE', createPaneData({lid:pid, list_id:lid, list: {...dc(lists[lid].list), lid:pid}}));
					
					if( ppid ){
						commit('ADD_CHILD_PANE_OF', {lid:ppid, clid:pid, item:itemId});
					} else {
						commit('SET_ROOT_LID', pid);
					}
					
					ppid = pid;
					lid = false;
					
					let selected = null;
					if( !list.stream.sources && list.items[i] ){
						selected = getDeepProp(list.items[i], list.list.select_key);
						lid = list.items[i].child_list;
						itemId = selected;
					}
					/*else if( list.stream.sources && list.list.selected.length ){
						if( list.list.is_leaf ){
							console.log(i);
							lid = false;
						} else {
							console.log('Dynamic list');
							lid = LM.id('list');
							commit('SET_LIST', {lid, list: {...dc( lists[list.child_list] ), is_dynamic: true}});
						}
					}*/
										
					commit('SELECT_ITEM', {lid: pid, item: selected});
					i = 0;
				}
			}
		}
	};
};

export default new Vuex.Store({
	strict: true,
	state:{
		Element: null,
		Settings: null,
		Translations: null,
		Licenses: null
	},
	
	mutations:{
		SELECT_ELEMENT(state, element){
			state.Element = element;
		},
		
		SET_SETTINGS(state, data){
			state.Settings = data;
		},
		
		SET_TRANSLATIONS(state, data){
			state.Translations = data;
		},
		
		SET_LICENSES(state, data){
			state.Licenses = data;
		}
	}
});

const freeLid = (lists, lid) => {
	if( lists[lid].child_list ){
		freeLid(lists, lists[lid].child_list);
	}
	lists[lid] = null;
};

const clearList = (lists, child_list) => {
	if( !lists[child_list].stream.sources  ){
		lists[child_list].items.forEach(it => clearList(lists, it.child_list));
	}
	freeLid(lists, child_list);
};

export {freeLid, clearList, deleteChain, BaseStore};
