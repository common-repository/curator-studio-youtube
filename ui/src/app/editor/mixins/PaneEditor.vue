<script>
	import StreamEditor from '../components/StreamEditor.vue';
	
	const PaneEditorMixin = {
		methods: {
			StreamEditor(e, p){
				//return null;
				const {lid, pane, list} = this;
				return this.createElementWithProps(e, {lid, pane, list}, p);
			}
		}
	};

	export default {
		mixins: [PaneEditorMixin],
		
		components: {
			StreamEditor
		}
	};
</script>
