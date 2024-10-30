import BaseMixin from '../../mixins/BaseMixin';
import {ListItemsMixin as RawListItemsMixin, ListPropsMixin, ListPaginationMixin} from '../../../libs/list/mixins';
import {RenderHelpers} from '../../elements';

const ListItemsMixin = {
	mixins: [RawListItemsMixin],
	inject: ['Elements', 'getTypedComponent', 'COMMIT', 'cP'],
			
	computed: {
		itemElement(){
			return this.Elements[this.getTypedComponent('Item')];
		}
	},
	
	methods: {		
		itProps(i){
			const {class:classes, attrs, domAttrs} = this.itemElement;
			return {...this.itemProps[i], class:classes, attrs, domAttrs};
		},
		
		Item(e, peid, it, i){
			return this.createElementWithProps(this.itemElement, {it, ...this.itProps(i)}, peid);
		}
	}
};

const PerRowCalculatorMixin = {
	computed: {
		Config(){
			return this.Elements[this.eid].config;
		},
		
		perRow(){
			const min_width = Math.max(this.Config.min_width[1], 50);
			const max_width = Math.max(this.Config.max_width[1], 50);
						
			let cols = Math.ceil(this.bbox.w / Math.max(max_width, min_width)) || 1;
								
			if( this.bbox.w/cols < min_width ){
				cols = Math.floor(this.bbox.w / min_width) || 1;
			}
			
			return Math.max(1, Math.min(cols, this.Items.length));
		}
	}
};

//console.log( ListPropsMixin.inject );
const {inject, ...rest} = ListPropsMixin;

const ListMixin = {
	//mixins: [BaseMixin, ListPaginationMixin, RenderHelpers],
	mixins: [BaseMixin, {inject: inject.filter(e => e !== 'clearSelection'), ...rest}, ListPaginationMixin, RenderHelpers],
	
	inject: {
		Elements: {
			required: true,
		}
	},
	
	provide(){
		return {
			selectNext: this.selectNext,
			selectPrevious: this.selectPrevious,
			clearSelection: this.clearSelection
		};
	},
			
	computed: {
		itemSelectorsToProps(){
			return this.itemProps.reduce((acc, cur) => Object.assign(acc, {[cur.selected_value]: cur}), {});
		},
		
		itemSelectedToItem(){
			return this.itemProps.reduce((acc, cur) => Object.assign(acc, {[cur.selected_value]: this.Items[cur.i]}), {});
		},
		
		view(){
			if( !this.d.is_leaf ) return null;
			if( !this.d.selected.length ) return null;
			return this.itemSelectedToItem[ this.d.selected[0] ];
		}
	},
		
	methods: {
		clearSelection(lid){
			if( lid ){
				this.$store.commit(`${this.storekey}/CLEAR_SELECTION`, lid);
			}
		},
		
		selectNext(){
			const props = this.itemSelectorsToProps[ this.d.selected[0] ];
			if( props.i === this.Items.length - 1 ){
				this.handleItemSelect( this.itemProps[0] );
			} else {
				this.handleItemSelect( this.itemProps[ props.i + 1 ] );
			}
		},
		
		selectPrevious(){
			const props = this.itemSelectorsToProps[ this.d.selected[0] ];
			if( props.i === 0 ){
				this.handleItemSelect( this.itemProps[ this.Items.length - 1 ] );
			} else {
				this.handleItemSelect( this.itemProps[ props.i - 1 ] );
			}
		},
		
		Meta(el, p){
			if( !this.meta ) return null;
			const e = this.Elements[ this.getTypedComponent('Meta') ];
			return this.createElementWithProps(e, {meta: this.meta}, p);
		},
		
		ListItems(e, peid){
			return this.createElementWithProps({...e, ref: 'items'}, this.nativeItemsProps(), peid, null);
		},
		
		Pagination(e, peid){
			if( !this.shouldShowPagination ) return null;
			return this.createElementWithProps(e, this.nativePaginationProps(), peid);
		},
		
		Viewer(el, p){
			if( !this.view || !this.d.viewer.mode ) return null;
			const e = this.Elements[ this.getTypedComponent('Viewer') ];
			return this.createElementWithProps(e, {it: this.view, selected_value: this.d.selected[0]}, p);
		}
	}
};

export {ListItemsMixin, PerRowCalculatorMixin, ListMixin};
