import {notImplemented} from './utils';

const ListItemEditorMixin = {
	props: {
		item: {
			type: Object,
			required: true
		},
		
		index: {
			type: Number,
			required: true
		}
	},
	
	data(){
		return {
			realtime: 0
		};
	},
	
	methods: {
		getSource(){
			return this.item;
		},
				
		submit(d){
			this.$emit('save-item', d, this.index, this.getSource(), this.isPristine);
		},
		
		reset(){
			this.$emit('cancel-edit', this.index);
		},
		
		onRemove(){
			this.$emit('remove-item', this.index);
		}
	}
};

const ListEditorMixin = {
	data(){
		return {
			editor: this.editorProps()
		};
	},
	
	methods: {
		getDummyItem: notImplemented('getDummyItem'),
		//saveItem(d, index){},
		//removeItem(index){},
		
		editorProps(){
			return {
				dummy: this.getDummyItem(),
				item: null,
				index: -1
			};
		},
		
		resetEditor(){
			this.editor = this.editorProps();
		},
		
		addItem(e){
			this.editor.item = this.editor.dummy;
		},
				
		cancelEdit(){
			this.resetEditor();
		},
		
		editItem(i){
			this.editor = {
				item: this.Items[i],
				index: i
			};
		}
	}
};

const putAtIndex = (array, index, item) => {
	const clone = array.slice();
	if( index < 0 ){
		clone.push(item);
	} else {
		clone.splice(index, 1, item);
	}
	return clone;
};

const removeAtIndex = (array, index) => {
	const clone = array.slice();
	clone.splice(index, 1);
	return clone;
};

export {ListItemEditorMixin, ListEditorMixin, putAtIndex, removeAtIndex};
