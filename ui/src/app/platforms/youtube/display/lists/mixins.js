import Items from '../items/items';
import Viewers from '../viewers/viewers';

import {ListItemsMixin as BaseListItemsMixin, PerRowCalculatorMixin, ListMixin as BaseListMixin} from '../../../../display/lists/mixins';

const ListItemsMixin = {
	mixins: [BaseListItemsMixin],
		
	components: {
		...Items
	}
};

const ListMixin = {
	mixins: [BaseListMixin],
	
	components: {
		...Viewers
	},
	
	methods: {
		Meta(e, peid, data){
			return null;
		}
	}
};

export {ListItemsMixin, PerRowCalculatorMixin, ListMixin};
