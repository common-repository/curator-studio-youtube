<template>
	<div class="small-text mb-md mt-md">
		<div v-if="allowTabs">
			<button class="button" @click="addGroup"><fa icon="plus" :class="cP('mr-sm')"></fa>Add Tab</button>
		</div>
		<div v-if="list.stream.sources || list.stream.meta" class="box pa-none bra-sm clipped mt-normal">
			<div class="pa-sm pl-normal pr-normal bg-secondary tw-semibold h5 color-shadea3 d-flex jc-between ai-center cursor-pointer" @click="toggleOpen">
				Stream <fa :icon="panelIcon"></fa>
			</div>
			<div class="pa-normal" :class="{'d-none': !open}">
				<div>
					<div class="small-text d-none"><code>{{ pane.list_id }}</code></div>
					<stream-sources :lid="pane.list_id" :pid="lid" 
						:d="sourceList" 
						:items="getSources()"
						:original-items="getOriginalSources()"
						:default-source-type="defaultSourceType">
					</stream-sources>
				</div>
				<div v-if="list.stream.sources" class="mt-xs">
					<StreamOptionsEditor :lid="lid"></StreamOptionsEditor>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import StreamEditorMixin from '../mixins/StreamEditor.vue';
	import StreamOptionsEditor from './StreamOptionsEditor.vue';
	import PanelMixin from '../mixins/Panel.vue';

	export default{
		mixins: [StreamEditorMixin, PanelMixin],
		
		components: {
			StreamOptionsEditor
		},
		
		data(){
			const sources = this.getSources();
			return {
				open: sources && !sources.length
			};
		},
		
		computed: {
			defaultSourceType(){
				return this.list.list.open ? 'item' : null;
			},
			
			allowTabs(){
				return !(this.list.is_dynamic || this.list.list.open || process.env.VUE_APP_PRO === 'false');
			}
		}
	};
</script>
