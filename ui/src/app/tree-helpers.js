import {createListData} from '../libs/list/utils';
import {uuid, range, dc} from '../libs/bp';
import {commentStream} from './instance/sources/sources';
import Config from './instance/config';

const defaultComponents = (components={}) => {
	return {
		Pane: 'simple-pane',
		List: 'masonry',
		Item: 'simple-item',
		Viewer: 'simple-viewer',
		LightList: 'simple-light-list',
		Meta: 'simple-meta',
		...components
	};
};

const createStreamList = (sources=[], select_key='id', {pagination={}, viewer={}, ...list}={}, components) => {
	return {
		list: createListData({
			select_key,
			allow_empty: true,
			pagination: {
				type: 4,
				query_on_load: true,
				per_page: Config.pagination.items,
				...pagination
			},
			sort: {
				by: 'created_time', 
				order: 1, 
				sync: false
			},
			viewer,
			...list
		}),
		meta: null,
		components: defaultComponents(components),
		items: [],
		child_list: null,
		comments: {
			list: createListData({
				select_key: 'external_id',
				allow_empty: true,
				pagination: {
					type: 4,
					query_on_load: true,
					per_page: Config.pagination.comments
				},
				sort: {
					by: 'created_time', 
					order: 1, 
					sync: false
				}
			}),
			config: {
				cache: 180*3,
				exclude: []
			},
			stream: {
				meta: null,
				sources: dc(commentStream)
			}
		},
		config: {
			cache: 180*3,
			exclude: []
		},
		stream: {
			meta: null,
			sources
		}
	};
};

const createItemsList = (items, meta=null) => {
	return {
		list: createListData({
			select_key: 'id',
			pagination: {
				query_on_load: true
			}
		}),
		meta,
		components: defaultComponents(),
		items,
		child_list: null,
		stream: {
			meta: null,
			sources: null
		}
	};
};

const createListItem = (name, child_list) => {
	return {
		id: uuid(),
		name,
		child_list
	};
};

const createTree = (totalLevels=2) => {
	const lists = {};
	
	const createList = (levels, prefix=1) => {
		levels -= 1;
		const lid = LM.id('list');
		
		if( !levels ) {
			lists[lid] = createStreamList([{prefix}]);
		} else {
			lists[lid] = createItemsList( range(1, 4).map(n => createListItem(`Tab ${prefix}-${n}`, createList(levels, `${prefix}-${n}`))) );
		}
		
		return lid;
	};
	
	return {root: createList(totalLevels), lists};
};

export {createStreamList, createItemsList, createListItem, createTree};
