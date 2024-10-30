import Metas from '../metas/metas';

import {LightListMixin as BaseLightListMixin, LightListItems} from '../../../../display/lists/lists';
import {RendererMixin} from '../../../../elements';

const LightListMixin = {
	mixins: [BaseLightListMixin],
};

const SimpleLightList = {
	mixins: [LightListMixin],
	
	components: {
		...Metas,
		LightListItems
	}
};

import {ListMixin, ListItemsMixin} from './mixins';

import MasonryItems from '../../../../display/lists/MasonryItems.vue';
import Pagination from '../../../../display/lists/Pagination.vue';

import ProLists from '../../../../pro/display/lists/lists';

export default {
	Lists: {
		...(ProLists.Lists || {}),
		Masonry: {
			mixins: [ListMixin, RendererMixin],
			
			components: {
				Pagination,
				ListItems: {
					mixins: [ListItemsMixin, MasonryItems]
				}
			}
		},
		
		SimpleList: {
			mixins: [ListMixin, RendererMixin],
	
			components: {
				Pagination,
				ListItems: {
					mixins: [ListItemsMixin, RendererMixin]
				}
			}
		}
	}, 
	LightLists: {
		SimpleLightList,
		...(ProLists.LightLists || {})
	}, 
	Mixins: {
		LightListMixin
	}
};
