import {getDeepProp, setDeepProp, Fence, removeFromArray, dc} from './bp';
import {ListMixin} from './list/mixins';

const AbstractInput = {
	inject: ['getFieldValue', 'setFieldValue', 'registerField', 'unRegisterField'],
	props: {
		depends: {
			type: Array,
			default: () => [],
			required: false
		}
	},
	
	data(){
		return {
			display: true
		};
	},
	
	destroyed(){
		this.destroyDepWatchers();
	},
	
	created(){
		this.setupDepWatchers();
	},
		
	methods:{				
		runDependency(d, path, value){
			if(d.type === 'function') this[d.action](path, value);
			else if(d.type === 'fence' ) {
				if( Fence.process(d.rule, value) )
					this.display = d.action === 'show';
				else
					this.display = d.action === 'hide';
			}
		},
		
		registerDependencies(){
			for(const d of this.depends){
				this.depwatchers.push(this.$watch(() => this.getFieldValue(d.path), (n, o) => {
					this.runDependency(d, d.path, n);
				}, {immediate: true}));
			}
		},
		
		setupDepWatchers(){
			if(!this.depwatchers) this.depwatchers = [];
			this.depwatchers.forEach(fn => fn());
			this.registerDependencies();
		},
		
		destroyDepWatchers(){
			this.depwatchers.forEach(unwatch => unwatch());
		}
	}
};


const InputMixin = {
	mixins: [AbstractInput],
	props: {
		path: {
			type: String,
			required: true
		}
	},
	
	data(){
		return {
			pristine: true
		};
	},
									
	methods:{
		setPristine(status=false){
			this.pristine = status;
		},
		
		changeValue(value){
			this.setPristine(false);
			this.setFieldValue(this.path, value);
		},
		
		validate(){
			return true;
		}
	},
	
	computed:{
		value(){
			return this.getFieldValue(this.path);
		},
				
		isValid(){
			return true;
		}
	},
		
	created(){
		this.registerField(this);
		this.$watch('path', (n, o) => {
			this.setupDepWatchers();
			this.unRegisterField(this, o);
		});
	},
	
	destroyed(){
		this.unRegisterField(this, this.path);
	}
};

const InputValidationMixin = {
	props: {
		validations: {
			type: Array,
			default: () => []
		}
	},
	
	data(){
		return {
			errors: []
		};
	},
	
	computed: {
		isValid(){
			return !this.errors.length;
		}
	},
	
	methods: {
		addValidationError(errors){
			this.errors = errors;
		},
		
		removeValidationError(){
			this.errors = [];
		},
		
		setPristine(status=false){
			this.pristine = status;
			if( status ){
				this.removeValidationError();
			}
		}
	}
};


const TextInputMixin = {
	mixins: [InputMixin, InputValidationMixin],
	props: {
		type: {
			type: String,
			required: true
		},
		masks: {
			type: Array,
			default: () => null
		}
	},
	
	methods:{
		onChange({target:{value}}){
			this.changeValue( 
				this.passThroughMasks(
					this.textToValue(value)
				)
			);
		},
		
		passThroughMasks(value){
			return value;
		},
		
		textToValue(text){
			switch(this.type){
				case 'text':
					return String(text);
				break;
				case 'number':
					return Number(text);
				break;
				default:
					return text;
			}
		},
						
		validate(){
			const [valid, errors] = this.runValidationRules(this.value);
			if(valid) this.removeValidationError();
			else this.addValidationError(errors);
		},
		
		runValidationRules(val){
			let errors = [];
			
			for(const [i, rule] of this.validations.entries()){
				if( rule.n === 'function' ){
					if( !callComputer({local:this}, rule.v, this) ){
						errors = this.validations.slice(i);
						break;
					}
				} else {
					if( !Fence.process(rule, val) ){
						errors = this.validations.slice(i);
						break;
					}
				}
			}
						
			return [!errors.length, errors];
		}
	}
};


const SwitchMixin = {
	mixins: [InputMixin],
	props: {
		options: {
			type: Array,
			required: true
		}
	},
	
	computed:{
		checkedLabel(){
			return this.options[ this.is_selected ? 0 : 1 ].label;
		},
		
		is_selected(){
			return this.value === this.options[0].value;
		}
	},
			
	methods:{
		onChange(e){
			this.changeValue( this.options[ this.is_selected ? 1 : 0 ].value );
		}
	}
};


const SelectMixin = {
	mixins: [InputMixin, InputValidationMixin, ListMixin],
	
	props: {
		config: {
			type: Object,
			required: true
		},
		
		options: {
			type: Array,
			required: true
		}
	},
			
	created(){
		this.$watch('value', (n, o) => {
			this.d.selected = Array.isArray(n) ? n : ((n === null || n === undefined) ? [] : [n]);
		}, {immediate: true});
	},
	
	computed: {
		multiple(){
			return this.d.multiple;
		}
	},
	
	methods: {
		getItems(){
			return this.options;
		},
		
		changeValue(value){
			if( !this.multiple ){
				value = value.length ? value[0] : null;
			}
			this.setPristine(false);
			this.setFieldValue(this.path, value);
			this.removeValidationError();
		},
		
		onSelect({selected_value}){
			if(!this.multiple){
				this.changeValue([selected_value]);
			} else {
				this.changeValue(this.value instanceof Array ? [...this.value, selected_value] : [...(this.value === null ? [] : [this.value]), selected_value]);
			}
		},
		
		deSelect({selected_value}){
			if(!this.d.allow_empty && (!this.multiple || this.d.selected.length === 1)) return;
			
			if(this.multiple){
				this.changeValue(removeFromArray(this.value instanceof Array ? this.value : [this.value], selected_value, false));
			} else {
				this.changeValue([]);
			}
		},
		
		clearSelection(){
			this.changeValue([]);
		},
		
		validate(){
			if(!this.d.allow_empty && !this.d.selected.length){
				this.addValidationError(this.validations);
			}
		}
	}
};


const mapMethods = (functions=[], self) => {
	return functions.reduce((o, fn) => Object.assign(o, {[fn]: self[fn]}), {});
};


const FormMixin = {
	data(){
		return {
			copy: null,
			realtime: 1,
			fieldVues: []
		};
	},
	
	provide(){
		return mapMethods([
			'getFieldValue',
			'setFieldValue',
			'registerField',
			'unRegisterField'
		], this);
	},
	
	created(){
		this.$watch(() => this.getSource(), (n, o) => {
			this.copy = dc(n);
			this.setPristine(true);
		}, {immediate: true});
	},
	
	computed:{
		source(){
			return this.realtime ? this.getSource() : this.copy;
		},
		
		isValid(){
			return this.validateFields();
		},
		
		isPristine(){
			return !this.fieldVues.some(f => !f.pristine);
		}
	},
	
	methods: {		
		getPathValue(obj, path){
			return getDeepProp(obj, path);
		},
		
		setPathValue(obj, path, value){
			setDeepProp(obj, path, value);
		},
		
		getFieldValue(path){
			return this.getPathValue(this.source, path);
		},
		
		setFieldValue(path, value){
			return this.setPathValue(this.source, path, value);
		},
				
		registerField(uid){
			this.fieldVues.push(uid);
		},
		
		unRegisterField(uid, path){
			removeFromArray(this.fieldVues, uid);
		},
		
		validateFields(){
			return !this.fieldVues.some(f => {
				if( f.pristine ) f.validate();
				return !f.isValid;
			});
		},
		
		setPristine(status=false){
			for(const field of this.fieldVues){
				field.setPristine(status);
			}
		},
				
		onSubmit(e){
			e.preventDefault();
			Promise.resolve().then(() => {
				if( this.isValid ) this.submit(this.source);
			});
		},
		
		onReset(e){
			e && e.preventDefault();
			if( !this.realtime ){
				this.copy = dc(this.getSource());
			}
			
			this.setPristine(true);
			this.reset( this.realtime ? this.copy : undefined);
		},
		
		reset(original){
			console.log('RESET', original);
		},
		
		submit(re){
			console.log('SUBMIT', re);
		}
	}
};


export {InputMixin, AbstractInput, TextInputMixin, SwitchMixin, SelectMixin, FormMixin};
