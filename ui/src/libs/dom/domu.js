export default {
	scripts: {},
	defaults: new WeakMap(),
	
	loadScript(attrs){
		if( !this.scripts[attrs.__id__] ){
			this.scripts[attrs.__id__] = true;
			this.createElement('script', {type: 'text/javascript', ...attrs}, 'head');
		}
	},
		
	createStyleSheet(css=''){
		const elem = document.createElement('style');
		elem.setAttribute('type', 'text/css');
		elem.appendChild(document.createTextNode(css));
		document.head.appendChild(elem);
		return elem;
	},

	createElement(tag, attrs={}, to){
		const elem = document.createElement(tag);
		for(const [k, v] of Object.entries(attrs)){
			elem.setAttribute(k, v);
		}
		
		if( typeof to === 'string') to = this.$(to);
		if( to ) to.appendChild(elem);
		return elem;
	},
	
	removeElement(el){
		if( typeof el === 'string') el = this.$(el);
		return el.parentNode.removeChild(el);
	},
	
	getDefaultColors(wrapper){
		if( this.defaults.has(wrapper) )
			return this.defaults.get(wrapper);
				
		const a = document.createElement('a');
		const p = document.createElement('p');
		
		a.setAttribute('href', '#');
		wrapper.appendChild(a);
		wrapper.appendChild(p);
		
		const colors = {
			link: getComputedStyle(a).color, 
			text: getComputedStyle(p).color
		};
		
		this.defaults.set(wrapper, colors);
		return colors;
	},
	
	setElementAttrs(el, attrs){
		for(const [k, v] of Object.entries(attrs)){
			el.setAttribute(k, v);
		}
	},
	
	$(selector, root=document){
		return root.querySelector(selector);
	},
	
	$$(selector, root=document){
		return [...root.querySelectorAll(selector)];
	}
};
