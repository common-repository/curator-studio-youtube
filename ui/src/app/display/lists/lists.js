import BaseMixin from '../../mixins/BaseMixin';
import {ListPropsMixin, ListPaginationMixin, ListItemsMixin as RawListItemsMixin, PaginationMixin} from '../../../libs/list/mixins';
import {RendererMixin} from '../../elements';

const LightListMixin = {
	mixins: [BaseMixin, ListPropsMixin, ListPaginationMixin, RendererMixin],
	
	computed: {
		itemSelectedToItem(){
			return this.itemProps.reduce((acc, cur) => Object.assign(acc, {[cur.selected_value]: this.Items[cur.i]}), {});
		}
	},
		
	methods: {
		LightListItems(e, p){
			if( !this.isEditor && this.Items.length === 1 ) return null;
			return this.createElementWithProps(e, this.nativeItemsProps(), p);
		},
		
		Meta(el, p){
			if( !this.meta ) return null;
			const e = this.Elements[ this.getTypedComponent('Meta') ];
			return this.createElementWithProps(e, {meta: this.meta}, p);
		}
	}
};
	
const LightListItems = {
	mixins: [BaseMixin, RawListItemsMixin],
	
	template: `
		<div>
			<div class="tabs h5 tw-semibold lightlist">
				<div class="d-inline-flex jc-center">
					<div v-for="(it, i) in Items" class="tab d-flex ai-center" :class="{'active': itemProps[i].is_selected}">
						<div @click="onItemSelect($event, itemProps[i])">{{ it.name }}</div>
					</div>
				</div>
			</div>
		</div>
	`
};

export {LightListMixin, LightListItems};
