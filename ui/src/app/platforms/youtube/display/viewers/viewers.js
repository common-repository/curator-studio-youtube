import BaseSimpleViewer from '../../../../display/viewers/SimpleViewer.vue';
import BaseItem from './Item.vue';
import BaseThumbGrid from '../../../../display/viewers/ThumbGrid.vue';
import Subscribe from '../../../../display/metas/Subscribe.vue';

import {ItemMixin, LongItemMixin} from '../items/mixins';
import {Comments, ViewerMixin, ViewerItemMixin} from './mixins';

import {Links} from '../utils';

const Item = {
	mixins: [BaseItem, ItemMixin, LongItemMixin, ViewerMixin, ViewerItemMixin],
	
	components: {
		Subscribe
	},
	
	data(){
		return {
			excerpt_length: 280
		};
	},
	
	methods: {
		localNumber( num ){
			return num.toLocaleString();
		},
		
		searchLink: Links.search,
		
		subscribeProps(){
			return {
				css: {
					background: '#FF0000',
					color: '#fff'
				},
				url: Links.subscribe(this.it.author),
				stat: null,
				brand: 'youtube',
				name: 'Subscribe'
			};
		}
	}
};

const ThumbGrid = {
	mixins: [BaseThumbGrid],
	
	components: {
		Item
	}
};

const SimpleViewer = {
	mixins: [BaseSimpleViewer, ViewerMixin],
	
	components: {
		ThumbGrid,
		Item
	}
};

export default {SimpleViewer};
