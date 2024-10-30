<script>
	import Pagination from './Pagination.vue';
	import {RendererMixin} from '../../../elements';
		
	export default {
		mixins: [ListMixin, RendererMixin],
		
		components: {
			Pagination
		}
	};
</script>
