import Vue from 'vue';
import debounce from 'lodash.debounce';
import {Port} from './reusables/CSS';
import Config from '../../app/instance/config';

const PREFIX = `${Config.class_prefix}-`;

const elemBbox = (el) => {
	const style = window.getComputedStyle(el);
	return {
		w: el.clientWidth - ( parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) ),
		h: el.clientHeight - ( parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) )
	};
};

const calcPortMedia = ({w, h}) => {
	const sizes = Object.entries(Port.points)
		.sort((a, b) => a[1] > b [1] ? 1 : -1)
		.filter(p => w >= p[1])
		.map(p => p[0]);
		
	return {
		sizes, 
		w,
		h,
		a: w*h,
		size: sizes[sizes.length-1]
	};
};

const Coordinator = new (Vue.extend({	
	created(){
		window.addEventListener('resize', debounce(() => {
			this.$emit('resize');
		}, 150));
	}
}));

window.cstudio_coordinator = Coordinator;

const DimMixin = {
	data(){
		return {
			bbox:{
				w: 0,
				h: 0
			}
		};
	},
	
	created(){
		this.$EM = Coordinator;
	},
		
	mounted(){
		this.onDimResize();
		this.$EM.$on('resize', this.onDimResize);
	},
	
	methods: {
		onDimResize(){
			this.bbox = elemBbox(this.$el);
		}
	}
};


const PortMixin = {
	mixins: [DimMixin],
	
	data(){
		return {
			portmedia: calcPortMedia({w:0, h:0})
		};
	},
								
	provide(){
		return {
			portmedia: this.portmedia,
			portpoints: Port.points,
			cP: cls => typeof cls === 'string' ? `${PREFIX}${cls}` : cls.map(e => `${PREFIX}${e}`)
		};
	},
	
	watch:{
		bbox: {
			handler(n, o){
				Object.assign(this.portmedia, calcPortMedia(n));
				this.$nextTick(() => {
					this.changeSizeClasses();
				});
			},
			deep: true
		}
	},
					
	methods:{
		changeSizeClasses(){
			const port = this.$el.children[0];
			//const port = this.$el;
			const names = Port.names.map(c => PREFIX+c);
			const cl = [
				...[...port.classList].filter(c => !names.includes(c)), 
				...this.portmedia.sizes.map(s => PREFIX+s)
			];
			port.setAttribute('class', cl.join(' '));
		}
	}
};

const addClassPrefix = (v) => {
	if(v.data && v.elm.classList && v.tag !== 'svg'){
		const cl = [...v.elm.classList];
		v.elm.setAttribute('class', cl.map(c => c.startsWith(PREFIX) ? c : `${PREFIX}${c}`).join(' '))
	};
	v.children && v.children.forEach(addClassPrefix);
};

const ClassPrefixerMixin = {
	mounted(){
		addClassPrefix(this._vnode);
	},
	
	updated(){
		addClassPrefix(this._vnode);
	}
};

export {DimMixin, PortMixin, ClassPrefixerMixin};
