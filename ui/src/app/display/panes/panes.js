import BaseMixin from '../../mixins/BaseMixin';
import PaneMixin from '../../mixins/Pane';
import {RendererMixin} from '../../elements';

import PaneIntro from './PaneIntro.vue';

const {selectElementForEdit, ...injects} = RendererMixin.inject;
const {inject, ...mixin} = RendererMixin;

const SimplePane = {
	mixins: [BaseMixin, PaneMixin, {...mixin, ...{inject: injects}}],
	props: {
		selectedItem: {
			default: () => null
		},
		selected_value: {
			type: String,
			default: () => null
		}
	},
	
	mounted(){
		if( this.selectedItem ){
			this.$nextTick(() => {
				this.$el.scrollIntoView({behavior: "smooth", block: "start"})
			});
		}
	},
	
	components: {
		PaneIntro
	},
	
	computed: {
		isLightList(){
			return !this.list.stream.sources;
		}
	},
				
	methods: {
		List(el, p){
			const c = this.components[this.isLightList ? 'LightList' : 'List'];
			const e = this.Elements[c];
			return this.createElementWithProps({...e, ref: 'list'}, this.listProps(), p);
		},
		
		Pane(el, p){
			if( !this.pane.clid || this.components.List === 'sequence' || this.components.LightList === 'light-list-sequence') return null;
			const e = this.Elements[this.components.Pane];
			
			const [selected] = this.pane.list.selected;
			const item = this.$refs.list ? this.$refs.list.itemSelectedToItem[ selected ] : null;
			
			return this.createElementWithProps(
				e, 
				{
					lid: this.pane.clid, 
					filters:[], 
					selected_value: selected,
					selectedItem: !this.isLightList && item
				},
				p
			);
		},
				
		StreamEditor(e, p){
			return null;
		},
		
		PaneIntro(e, p){
			if( !this.selectedItem ) return null;
			return this.createElementWithProps(e, {it: this.selectedItem, close: this.close}, p);
		},
		
		close(){
			this.deSelectCache({lid: this.pane.parent, selected_value: this.selected_value});
		}
	}
};

export {SimplePane};
