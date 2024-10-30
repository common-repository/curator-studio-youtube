import BaseMixin from '../../mixins/BaseMixin';
import {RenderHelpers} from '../../elements';
import {DimMixin} from '../../../libs/dom/port';
import {ItemMixin} from '../items/mixins';

const ViewerMixin = {
	mixins: [BaseMixin, DimMixin],
	inject: ['getD'],
	props: ['it', 'selected_value'],
		
	computed: {
		viewMode(){
			return this.getD().viewer.mode;
		},
		
		canOpen(){
			const {type, extra} = this.it;
			return (['video', 'gif'].includes(type) && this.canPlayIfVideo) || (type === 'album' && extra.att.inline_album);
		},
		
		showComments(){
			const {comments} = this.getD().viewer;
			if( !this.it.comments || comments === -1 || process.env.VUE_APP_PRO === 'false') return false;
			return true;
		}
	}
};

const ViewerItemMixin = {
	mixins: [BaseMixin, RenderHelpers],	
	
	inject: {
		Elements: {
			type: Object,
			required: true,
		},
		
		getPortalColumnar: {
			type: Function,
			default: () => null
		},
		
		portpoints: {
			type: Object,
			required: true
		},
		
		deSelect: {
			type: Function,
			default: () => null
		},
	},
	
	computed: {
		columnar(){
			//return this.bbox.w < Port.points.l;
			return this.getPortalColumnar ? this.getPortalColumnar() : this.bbox.w < this.portpoints.l;
		}
	},
		
	watch: {
		'$parent.bbox.w'(n, o){
			this.$nextTick(this.onDimResize);
		}
	},
			
	methods: {
		attachmentLink(){
			return this.canPlayIfVideo ? '' : ItemMixin.methods.attachmentLink.call(this, this.it);
		},
		
		onItemChoose(){},
		
		closeViewer(){
			this.deSelect({selected_value: this.selected_value});
		}
	}	
};

export {ViewerMixin, ViewerItemMixin};
