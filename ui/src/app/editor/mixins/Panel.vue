<script>
	export default {
		data(){
			return {
				open: true
			};
		},
		
		computed: {
			panelIcon(){
				return this.open ? 'angle-up' : 'angle-down';
			}
		},
		
		methods: {
			toggleOpen(){
				this.open = !this.open;
			}
		}
	};
</script>
