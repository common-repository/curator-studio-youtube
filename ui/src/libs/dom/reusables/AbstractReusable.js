import {uuid} from '../../bp';
import {makeCSS, fixStyleProps, Port, indexStyles} from './CSS';

export default class{
	constructor(Scheman){
		this.Scheman = Scheman;
		this.class_prefix = Scheman.class_prefix;
		this.class_prefix_dotted = '.'+Scheman.class_prefix;
		this.themespace = Scheman.themespace;
		this.Ports = Port.names;
	}
	
	defaultProps(){}
	
	getStyles(){
		return {};
	}
	
	getClassHelperStyles(){
		return {};
	}
	
	getClassStyles(){
		return {};
	}
	
	getAllStyles(){
		return this.normalizeStyleProps(this.getStyles());
		return {...this.normalizeStyleProps(this.getStyles()), ...this.normalizeStyleProps(this.getClassStyles(), true)};
	}
	
	getSearchableStyles(){
		const Helpers = this.getClassHelperStyles();		
		const Styles = this.getClassStyles();
		return indexStyles(Styles, {...Styles, ...Helpers});
	}
	
	generateCSS(){
		const Styles = this.getClassStyles();
		return this.makeCSS(Styles, Styles);
	}
	
	generateSchema(props){
		const {Elements, Events={}} = this.getSchema(props);
		
		const idmap = {
			elements: this.createIdMap(Elements),
			events: this.createIdMap(Events)
		};
				
		const elements = Object.entries(Elements).reduce((acc, [id, el]) => {
			if( !el.name ) el.name = id;
			if( el.children ) el.children = el.children.map(e => {
				if(Array.isArray(e)){
					e.slice(1).forEach((c, i) => {
						e[i+1] = idmap.elements[e[i+1]] || e[i+1]
					});
					return e;
				}
				return idmap.elements[e] || e;
			});
			if( el.events ) el.events = el.events.map(e => idmap.events[e] || e);
			el.id = idmap.elements[id];
			acc[el.id] = el;
			return acc;
		}, {});
			
		const events = Object.entries(Events).reduce((acc, [id, ev]) => {
			for(const evs of Object.values(ev)){
				for(const e of evs){
					for(const op of e.operations){
						if(op.domain === 'dom'){
							op.operands = op.operands.map(id => idmap.elements[id] || id);
						}
					}
				}
			}
			acc[idmap.events[id]] = ev;
			return acc;
		}, {});
		
		const root = idmap.elements['1'];
		if( !root ) console.error('Please specify AbstractReusable root element');
		
		return this.generatedSchema({Elements:elements, Events:events, root, idmap});
	}
	
	generatedSchema(schema){
		return schema;
	}
	
	replaced(){}
	
	createIdMap(objects){
		return Object.keys(objects).reduce((acc, cur) => (acc[cur] = uuid()) && acc, {});
	}
	
	normalizeStyleProps(Styles, is_class=false){
		return fixStyleProps(Styles, is_class);
	}
		
	makeCSS(class_styles, Styles){
		return makeCSS(
			Object.keys(class_styles),
			this.normalizeStyleProps(Styles),
			this.themespace + ' ' + this.class_prefix_dotted,
			this.Scheman.Variables,
			this.class_prefix_dotted
		);
	}
	
	toa(obj){
		return Object.entries(obj).filter(a => a[1]).map(a => a[0]);
	}
};
