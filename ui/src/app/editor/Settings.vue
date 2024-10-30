<template>
	<div class="box relative">
		<Loading v-if="loading"></Loading>
		<form @submit="onSubmit" v-if="settings">
			<GroupInput eid="root" :peid="null"></GroupInput>
			
			<div class="mt-normal attached buttons">
				<button class="button primary small" @click="onSubmit"><fa icon="check" :class="cP('mr-sm')"></fa>Save</button>
				<button class="button small" @click="onReset"><fa icon="undo" :class="cP('mr-sm')"></fa>Cancel</button>
			</div>
		</form>
		<div class="pt-normal mt-md bt-1 bc-shadea2">
			<h3 class="h4 mb-sm tw-semibold">Debug</h3>
			<div class="buttons">
				<a href="#" @click="clearCache" class="button">Clear All Cache</a>
				<a href="#" @click="deleteAllData" class="button error">Delete All Data</a>
			</div>
		</div>
	</div>
</template>

<script>
	import ApiMixin from '../mixins/ApiMixin';
	import BaseMixin from '../mixins/BaseMixin';
	import Loading from '../components/Loading.vue';
	
	import {FormMixin, AbstractInput} from '../../libs/input';
	import {TextInput, SwitchInput, SelectInput, RichSelectInput} from '../components/inputs';
	import {RendererMixin} from '../elements';

	import {SettingsMixin, GroupInputMixin} from '../instance/editor/Settings';

	export default {
		mixins: [BaseMixin, ApiMixin, FormMixin, SettingsMixin],
		
		data(){
			return {
				realtime: 0
			};
		},
		
		provide(){
			return {
				Elements: this.schema
			};
		},
				
		computed: {
			schema(){
				return this.extraSchema({
					root: {
						tag: 'div',
						children: [
							'root-1',
							'root-2'
						]
					},
					'root-1': {
						tag: 'TextInput',
						component: 'Input',
						config: {
							path: 'cache_duration',
							type: 'number',
							label: 'Cache duration',
							tip: 'How often should we check for new data? (In minutes)',
							validations: [
								{n:'min', v:5, msg:'Cannot be less than 5'}
							]
						}
					},
					'root-2': {
						tag: 'SwitchInput',
						component: 'Input',
						classes: ['mt-normal', 'tw-semibold'],
						config: {
							path: 'clean_on_uninstall',
							label: '',
							options: [
								{value: true, label: 'Delete data on uninstall'}, 
								{value: false, label: 'Delete data on uninstall'}
							]
						}
					}
				});
			},
			
			settings(){
				return this.$store.state.Settings;
			}
		},
		
		components: {
			Loading,
			GroupInput: {
				mixins: [BaseMixin, AbstractInput, RendererMixin, GroupInputMixin],
				
				components: {
					TextInput,
					RichSelectInput,
					SelectInput,
					SwitchInput
				},
				
				methods: {
					Input(e, p){
						return this.createElement({...e, props: e.config}, p);
					}
				}
			}
		},
		
		methods: {
			getSource(){
				return this.settings;
			},
			
			reset( original ){
				this.$store.commit('SET_SETTINGS', original);
			},
			
			submit(d){
				this.POST('/save-key-value/', {data: d, key: 'settings'})
					.then((data) => {
						if( data ){
							this.$store.commit('SET_SETTINGS', d);
						}
					})
					.catch(er => console.log(er));
			},
			
			clearCache(e){
				e.preventDefault();
				this.POST('/debug/', {action: 'clear-cache'})
					.then((data) => {
						window.location.reload();
					})
					.catch(er => console.log(er));
			},
			
			deleteAllData(e){
				e.preventDefault();
				if( confirm('Are you sure you want to delete all data?') ){
					this.POST('/debug/', {action: 'delete-data'})
						.then((data) => {
							window.location.reload();
						})
						.catch(er => console.log(er));
				}
			}
		}
	};
</script>
