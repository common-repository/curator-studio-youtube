import {uuid} from '../bp';
import helperStyles from './helpers';
import {fixStyleProps} from './reusables/CSS';
import Columns from './reusables/Columns';
import Button from './reusables/Button';
import Form from './reusables/Form';
import Tabs from './reusables/Tabs';
import Card from './reusables/Card';
//import resetcss from './reset.css';

import Domu from './domu';
import Config from '../../app/instance/config';

//Domu.createStyleSheet(resetcss);

export default class Scheman{
	constructor(Variables={}, id=0, theme){
		this.id = id;
		this.class_prefix = `${Config.class_prefix}-`;
		
		theme = theme === undefined ? id : theme;
		this.Variables = Variables;
		this.Reusables = new Map();
				
		this.shortClassNames = true;		
		this.themespace = `.${this.class_prefix}themespace-${ theme }`;
		this.instansel = `#${this.class_prefix}instance-${id}`;
		this.addReusables(Columns, Button, Form, Tabs, Card);
	}
	
	addReusable(Klass){
		this.Reusables.set(Klass, new Klass(this));
	}
	
	addReusables(...use){
		for(const u of use) this.addReusable(u);
	}
	
	createStyleClasses( extra='' ){
		//console.time('Style');
		const rules = this.accumulateRules(extra);
		
		this.cachedRules = this.splitRules(rules);
		this.Sheet = Domu.createStyleSheet(rules);
		
		//console.timeEnd('Style');
	}
	
	removeStyleSheet(){
		this.Sheet.parentNode.removeChild(
			this.Sheet
		);
	}
	
	accumulateRules(extra=''){
		return [
				...new Set(this.Reusables.values())
			].reduce((css, el) => css+el.generateCSS(), '')
			+ helperStyles.generateCSS(
				this.Variables,
				this.themespace,
				'.'+this.class_prefix,
				this.shortClassNames,
				this.id
			)
			+ extra;
	}
	
	splitRules(rules){
		const splitter = uuid();
		rules = rules.replace('@media', `${splitter}@media`).split(splitter);
		return [].concat(...rules.map(e => e.replace(/}\./g, `}${splitter}.`).split(splitter)));
	}
	
	updateRules(variables){
		//console.time('Style');
		this.Variables = variables;
		const cached = this.cachedRules;
		const rules = this.splitRules(this.accumulateRules());
		const sheet = this.Sheet.sheet;
		
		for(const [i, r] of rules.entries()){
			if( cached[i] !== r){
				sheet.deleteRule(i);
				sheet.insertRule(r, i);
			}
		}
		this.cachedRules = rules;
		//console.timeEnd('Style');
	}
};
