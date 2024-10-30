import {ItemMixin as BaseItemMixin, ItemRendererMixin, LongItemMixin} from '../../../../display/items/mixins';
import {Links} from '../utils';

import ProItemMixin from './mixins.pro.js';

const ItemMixin = {
	mixins: [BaseItemMixin, ProItemMixin],
	
	computed: {
		verifiedTickColor(){
			return 'rgb(14, 141, 219)';
		},
		
		hasLinkBox(){
			return true;
		}
	},
					
	methods: {
		profileLink: Links.profile,
		itemLink: Links.item
	}
};

export {ItemMixin, ItemRendererMixin, LongItemMixin};
