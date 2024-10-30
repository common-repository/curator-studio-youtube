<template>
	<div class="d-flex">
		<button
			class="button square mr-sm lc-mr-none" 
			:class="configClasses"
			:disabled="!buttons.backward"
			@click="$emit('select', 'backward')"
			:title="getI18n('pagination').prev">
				<fa icon="angle-left"></fa>
		</button>
		<button
			class="button square mr-sm lc-mr-none" 
			:class="configClasses"
			:disabled="!buttons.forward"
			@click="$emit('select',  'forward')"
			:title="getI18n('pagination').next">
				<fa icon="angle-right"></fa>
		</button>
	</div>
</template>

<script>
	import BaseMixin from '../../mixins/BaseMixin';
	
	export default{
		mixins: [BaseMixin],
		inject: {
			Elements: {
				type: Object,
				required: true
			}
		},
		
		props: ['eid', 'carousel'],
		
		computed: {
			configClasses(){
				if( !this.Elements[ this.eid ] ) return ['primary'];
				return Object.values(this.Elements[ this.eid ].config.classes.button);
			},
			
			buttons(){
				return {
					backward: this.carousel && this.carousel.canAdvanceBackward,
					forward: this.carousel && this.carousel.canAdvanceForward
				};
			}
		}
	}
</script>
