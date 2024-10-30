<template>
	<div>
		<div class="d-flex">
			<div>
				<button class="button medium secondary mr-sm" @click="$emit('cancel-edit')"><fa icon="angle-left"></fa></button>
			</div>
			<input class="input medium mr-sm" v-model="item.name" @keyup.enter="$emit('update-name', item)" placeholder="App Name" title="Hit Enter to save"/>
			<div>
				<input class="input medium shortcode-input" :value="shortcode" readonly style="width: 20em"/>
				<fa icon="info-circle" v-tooltip="'Copy & paste this shortcode to a post editor or text widget'"></fa>
			</div>
		</div>
		<keep-alive>
			<component v-for="v in Views" :is="v.component" :key="v.component" :instance="instance" module="emodule" v-if="SchemaChanger.View === v.value"></component>
		</keep-alive>
	</div>
</template>

<script>
	import BaseMixin from '../mixins/BaseMixin';
	import ApiMixin from '../mixins/ApiMixin';
	import Explorer from './Explorer.vue';
	import {Views} from '../instance/dom/';
	import ViewComponents from '../instance/display/root-views';

	export default{
		mixins: [BaseMixin, ApiMixin],
		props: {
			item: {
				type: Object,
				required: true
			},
			index: {
				type: Number,
				required: true
			},
			shortcode: {
				type: String,
				required: true
			}
		},
		
		inject: {
			SchemaChanger: {
				type: Object,
				required: true
			},
			coApps: {
				type: Function,
				required: true
			}
		},
		
		components: {
			Explorer,
			...ViewComponents
		},
		
		created(){		
			this.SchemaChanger.setApp(
				this.coApps(this.item),
				this
			);
		},
		
		computed: {
			instance(){
				return this.coApps(this.item);
			},
			
			state(){
				return this.$store.state.emodule;
			},
			
			Views(){
				return Views;
			}
		},
				
		beforeDestroy(){
			this.SchemaChanger.cleanup();
		}
	};	
</script>
