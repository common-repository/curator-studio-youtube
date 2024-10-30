<template>
	<div class="fixed bg-shadeb5 lightbox" style="z-index:10000;top:0;right:0;bottom:0;left:0">
		<div class="absolute d-flex" style="top:0;right:0;bottom:0;left:0;overflow:auto">
			<div class="absolute cursor-pointer color-shadea3" style="top:1em;right:1.5em;z-index:1000" 
				@click="closeViewer" 
				:title="getI18n('extra').close" role="button">
					<fa icon="times" size="2x"></fa>
			</div>
			<div class="d-flex jc-center fullwidth mt-xl">
				<div class="mt-normal pb-normal lightbox__content">
					<slot></slot>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import {PortMixin} from '../../../libs/dom/port';
	import BaseMixin from '../../mixins/BaseMixin';
	
	export default {
		mixins: [BaseMixin, PortMixin],
		inject: ['deSelect', 'portpoints'],
		
		props: {
			selected_value: {
				default: () => null
			}
		},
				
		created(){
			const html = document.querySelector('html');
			html.setAttribute('class', `${(html.getAttribute('class')||'')} ${this.cP('clipped')}`);
			window.addEventListener('keydown', this.handleKeyPress);
		},
		
		beforeDestroy(){
			this.closeViewer();
			window.removeEventListener('keydown', this.handleKeyPress);
		},
				
		provide(){
			const that = this;
			return {
				getPortalColumnar(){
					return that.columnar;
				}
			};
		},
		
		computed: {
			columnar(){
				return this.bbox.w < this.portpoints.l;
			}
		},
		
		methods: {
			closeViewer(){
				const html = document.querySelector('html');
				html.setAttribute('class', (html.getAttribute('class')||'').replace(this.cP('clipped'), ''));
				this.close();
			},
			
			close(){
				if( this.selected_value === null ){
					this.$destroy();
					this.$el.parentNode.removeChild( this.$el );
				} else {
					this.deSelect({selected_value: this.selected_value});
				}
			},
			
			handleKeyPress(e){
				if( e.keyCode === 27 ) this.closeViewer();
			}
		}
	};
</script>
