<script>
	import BaseMixin from '../../mixins/BaseMixin';
	import {RendererMixin} from '../../elements';
	
	import LightBox from './LightBox.vue';	
		
	export default {
		mixins: [BaseMixin, RendererMixin],
		inject: ['portpoints'],
		
		computed: {
			isCollection(){
				const {type, extra} = this.it;
				return type === 'album' && !extra.att.inline_album;
			}
		},
		
		watch: {
			it: {
				handler(n, o){
					this.$nextTick(() => {
						if( this.getD().viewer.autoplay ){
							this.$el.scrollIntoView({behavior: "smooth", block: "start"});
						}
					});
				},
				immediate: true
			}
		},
		
		components: {
			LightBox,
			Navigation: {
				mixins: [BaseMixin],
				props: ['eid', 'viewMode'],
				inject: ['selectNext', 'selectPrevious', 'Elements'],
				
				template: `
					<div class="d-flex">
						<button class="button mr-sm lc-mr-none square" 
							:class="configClasses" 
							@click="selectPrevious"
							:title="getI18n('pagination').prev"><fa icon="angle-left"></fa></button>
						<button class="button mr-sm lc-mr-none square" 
							:class="configClasses" 
							@click="selectNext"
							:title="getI18n('pagination').next"><fa icon="angle-right"></fa></button>
					</div>
				`,
				
				computed: {
					configClasses(){
						return Object.values(this.Elements[ this.eid ].config.classes.button);
					}
				},
				
				mounted(){
					if(this.viewMode === 1){
						window.addEventListener('keydown', this.handleKeyPress);
					}
				},
				
				beforeDestroy(){
					if(this.viewMode === 1){
						window.removeEventListener('keydown', this.handleKeyPress);
					}
				},
				
				methods: {
					handleKeyPress(e){
						if( e.keyCode === 37 ) this.selectPrevious();
						else if( e.keyCode === 39 ) this.selectNext();
					}
				}
			}
		},
		
		methods: {
			LightBox(e, peid){
				return this.createElementWithProps(e, {selected_value: this.selected_value}, peid);
			},
			
			ThumbGrid(e, peid){
				return this.createElementWithProps(e, {entity: this.it.extra.att.external_id}, peid);
			},
			
			Comments(e, peid){
				return this.createElementWithProps(e, {entity: this.selected_value}, peid);
			},
			
			Item(e, peid){
				return this.createElementWithProps(e, {it: this.it, selected_value: this.selected_value}, peid);
			},
			
			Navigation(e, peid){
				const extra = this.bbox.w < this.portpoints.l ? {classes: []} : null; 
				return this.createElementWithProps({...e, ...extra}, {viewMode: this.viewMode}, peid);
			}
		}
	};
</script>
