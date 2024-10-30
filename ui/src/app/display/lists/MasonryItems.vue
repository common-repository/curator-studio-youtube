<script>
	import BaseMixin from '../../mixins/BaseMixin';
	import {DimMixin} from '../../../libs/dom/port';
	import {PerRowCalculatorMixin} from './mixins';
	import {RendererMixin} from '../../elements';
	
	export default {
		mixins: [BaseMixin, DimMixin, PerRowCalculatorMixin, RendererMixin],
				
		computed: {
			buckets(){
				const b = this.perRow;
				const buckets = [...new Array(b)].map(e => []);
				const items = this.Items.slice();
				let it = 0;
				
				while(items.length-b > -b){
					const chunk = items.splice(0, b);
					for(const [i, e] of chunk.entries()){
						buckets[i].push([e, it]);
						it++;
					}
				}
				
				return buckets;
			}
		},
		
		methods: {
			Item(e, peid, [it, bi], i){
				return this.createElementWithProps(this.itemElement, {it, ...this.itProps(bi)}, peid);
			}
		}
	};
</script>
