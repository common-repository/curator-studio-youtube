<template>
	<div class="box relative">
		<Loading v-if="loading"></Loading>
		<form @submit="onSubmit" v-if="data" class="has-inline-inputs translations underlined-inputs">
			<div v-for="(v, k) in data" class="mb-normal lc-mb-none">
				<div v-if="Object.values(v).length">
					<div class="h5 mb-xs tw-semibold">{{ i18nLabel(k) }}</div>
					<TextInput 
						v-for="(term, path) in v" 
						v-bind="getProps(term, k, path)"
						class="mb-sm">
					</TextInput>
				</div>
			</div>
			<div class="mt-md attached buttons">
				<button class="button primary small" @click="onSubmit"><fa icon="check" :class="cP('mr-sm')"></fa>Save</button>
				<button class="button small" @click="onReset"><fa icon="undo" :class="cP('mr-sm')"></fa>Cancel</button>
			</div>
		</form>
	</div>
</template>

<script>
	import ApiMixin from '../mixins/ApiMixin';
	import BaseMixin from '../mixins/BaseMixin';
	import Loading from '../components/Loading.vue';
	
	import {FormMixin} from '../../libs/input';
	import {getDeepProp, capitalize} from '../../libs/bp';
	import {TextInput} from '../components/inputs';
	
	import i18n, {i18nMeta} from '../instance/display/i18n';
	
	export default {
		mixins: [BaseMixin, ApiMixin, FormMixin],
		
		data(){
			return {
				realtime: 0
			};
		},
						
		computed: {
			data(){
				const {Settings, Translations} = this.$store.state;
				return Settings ? Translations || i18n : null;
			}
		},
		
		components: {
			Loading,
			TextInput
		},
		
		methods: {
			getSource(){
				return this.data;
			},
			
			i18nLabel(k){
				return i18nMeta[k].__label;
			},	
			
			getProps(term, k, path){
				const g = i18nMeta[k];
				return {
					path: `${k}.${path}`,
					type: 'text',
					label: capitalize( g[path] ? g[path].label : getDeepProp(i18n, `${k}.${path}`) ),
					tip: g[path] && g[path].tip,
					validations: [
						{n:'onlyspace', not: true, msg:'Cannot be empty'}
					]
				};
			},
			
			reset( original ){
				this.$store.commit('SET_TRANSLATIONS', original);
			},
			
			submit(d){
				this.POST('/save-key-value/', {data: d, key: 'translations'})
					.then((data) => {
						if( data ){
							this.$store.commit('SET_TRANSLATIONS', d);
						}
					})
					.catch(er => console.log(er));
			}
		}
	};
</script>
