<template>
	<div class="relative" v-if="SchemaChanger.App">
		<Loading v-if="loading"></Loading>
		<div class="box">
			<div class="attached d-flex mb-sm tw-semibold">
				<button class="button fg-1" @click="activateTab(0)" :class="{'primary': this.isActiveTab(0)}">Elements</button>
				<button class="button fg-1" @click="activateTab(1)" :class="{'primary': this.isActiveTab(1)}">Theme</button>
			</div>
						
			<form @submit="submit" class="has-inline-inputs pt-sm">
				<template v-if="isActiveTab(0)">
					<div v-if="SchemaChanger.Evue.state" v-show="!editable" class="box pa-none">
						<div v-for="v in views" style="margin-bottom:1px">
							<div class="bg-secondary color-shadea4 pa-xs pl-sm cursor-pointer" @click="SchemaChanger.View = v.value">
								<fa :icon="SchemaChanger.View === v.value ? 'angle-up' : 'angle-down'"></fa> {{ v.name }}
							</div>
							<div v-if="SchemaChanger.View === v.value" class="overflow-auto pl-sm pr-sm">
								<ElementTree :view="v.value"></ElementTree>
							</div>
						</div>
					</div>
					
					<div v-if="editable">
						<div>
							<button class="button small mb-normal" @click="closeElementEditor">
								<fa icon="angle-left" style="margin-right:.5em"></fa> Elements
							</button>
						</div>
						<div class="seditor">
							<label v-if="Element.type" class="h5 mb-sm">
								<span class="label">Component</span>
								<span class="select">
									<select @change="onElementChange($event)">
										<option v-for="e in selectableElements" :value="e.key" :selected="e.key === selected">{{ e.name }}</option>
									</select>
								</span>
							</label>
							<Config v-if="SchemaChanger.ElementHasSchema" v-bind="configProps()"></Config>
							<ClassEditor v-if="SchemaChanger.ElementHasESchema" v-bind="eschemaProps()"></ClassEditor>
						</div>
					</div>
				</template>
				
				<div v-if="isActiveTab(1)" class="seditor">
					<Theme :selected="selected" eid="esm-theme" peid="null"></Theme>
				</div>
				
				<div>
					<div class="mt-md attached buttons">
						<button class="button primary small" @click="submit"><fa icon="check" :class="cP('mr-sm')"></fa>Save</button>
						<button class="button small" @click="cancel"><fa icon="undo" :class="cP('mr-sm')"></fa>Cancel</button>
					</div>
				</div>
			</form>
		</div>
	</div>
</template>

<script>
	import ApiMixin from '../../mixins/ApiMixin';
	import BaseMixin from '../../mixins/BaseMixin';
	import Loading from '../../components/Loading.vue';

	import {TabMixin, Config, Theme, ClassEditor} from './mixins';
	import ElementTree from './ElementTree.vue';
	
	import {Views} from '../../instance/dom/';
	
	export default {
		mixins: [BaseMixin, TabMixin, ApiMixin],
		inject: ['SchemaChanger'],
		
		data(){
			return {
				activeTab: 0,
				views: Views
			};
		},
				
		computed: {
			selected(){
				return this.$store.state.Element;
			},
			
			Element(){
				return this.SchemaChanger.Element;
			},
									
			selectableElements(){
				return this.SchemaChanger.ElementSelectables;
			},
						
			editable(){
				return this.selected && (
					this.selectableElements || 
					this.SchemaChanger.ElementHasSchema ||
					this.SchemaChanger.ElementHasESchema
				);
			}
		},
			
		components: {
			Loading,
			Config,
			Theme,
			ClassEditor,
			ElementTree
		},
		
		watch: {
			selected(){
				this.activateTab(0);
			}
		},
			
		methods: {
			onElementChange(e){
				this.SchemaChanger.selectElement({eid: e.target.value});
				this.SchemaChanger.changeElement(e.target.value);
			},
						
			configProps(){
				return {
					eid: this.SchemaChanger.Elements[this.Element.key].schema,
					peid: null,
					selected: this.selected
				};
			},
			
			eschemaProps(){
				return {
					eid: `${this.Element.key}-eschema`,
					peid: null,
					selected: this.selected
				};
			},
			
			closeElementEditor(e=null){
				e && e.preventDefault();
				this.SchemaChanger.unSelectElement();
			},
			
			submit(e){
				e.preventDefault();
				this.POST('/apps/update-sub-apps/', {app_id: this.SchemaChanger.App.app.id, data: this.SchemaChanger.save()})
					.then((data) => {
						this.SchemaChanger.setPristine();
						this.SchemaChanger.createBackup();
					})
					.catch(er => console.error(er));
			},
			
			cancel(e){
				e.preventDefault();
				this.SchemaChanger.cancel();
			}
		}
	};
</script>
