import AbstractReusable from './AbstractReusable';
import {compile} from './CSS';
import {uuid, range} from '../../bp';

export default class Columns extends AbstractReusable{
	defaultProps(){
		const columns = [
			{default: 12, tablet: 6},
			{default: 12, tablet: 6}
		];
				
		return {
			columns
		};
	}
	
	get columnClass(){
		return this.Scheman.shortClassNames ? 'col' : 'column';
	}
	
	get columnsClass(){
		return this.Scheman.shortClassNames ? 'cols' : 'columns';
	}
	
	getClassStyles(){
		const {columnClass, columnsClass} = this;
		const {spacing:{relative}} = this.Scheman.Variables;
		const colgap = '.5em', negap = '-'+colgap, colgap2 = '1em';
						
		const Styles = {
			[columnsClass]: {
				meta:{
					state: '',
					include: [
						[':last-child', {'margin-bottom': negap}],
						[':not(:last-child)', {'margin-bottom': `calc(1em - ${colgap})`}],
						[`..gap-none`, {'margin': 0}],
						[`..gap-none ..${columnClass}`, {'padding': 0}],
						
						...[].concat(...['xs', 'sm', 'normal', 'md', 'l'].reduce((acc, cur) => {
							const gap = relative[cur].join(''),
								gap2 = [relative[cur][1]*2, relative[cur][2]].join('');
							
							return [...acc, [
								[`..gap-${cur}:last-child`, {'margin': `-${gap}`}],
								[`..gap-${cur}:not(:last-child)`, {'margin-bottom': `calc(${gap2} - ${colgap})`, 'margin-top': `calc(${gap2} - ${colgap})`}],
								[`..gap-${cur} ..${columnClass}`, {'padding': gap}]
							]];
						}, [])),
						
						[':empty',{'margin': 0}]
					]
				},
				props: {
					display: 'flex',
					'flex-wrap': 'wrap',
					'margin-left': negap,
					'margin-right': negap,
					'margin-top': negap
				}
			},
			[columnClass]: {
				meta: {
					state:'',
					include: range(1, 13).map(i => [`..${columnClass}-${i}`, {flex: 'none', width: `${i/12 * 100}%`}])
				},
				props: {
					//display: 'block',
					'flex-basis': 0,
					'flex-grow': 1,
					'flex-shrink': 1,
					padding: colgap
				}
			},
			...this.getClassHelperStyles()
		};
		return Styles;
	}
	
	getClassHelperStyles(){
		const {columnClass} = this
		return this.Ports.reduce((acc, m) => {
			acc[m] = {
				meta: {
					state: '',
					include: range(1, 13).map(i => [` ..${columnClass}..${columnClass}-${i}-${m}`, {flex: 'none', width: `${i/12 * 100}%`}])
				},
				props: {}
			};
			return acc;
		}, {});
	}
	
	generateCSS(){
		const Styles = this.getClassStyles();
		return this.makeCSS(Styles, Styles);
	}
		
	getSchemas(props){
		const {columns} = props || this.defaultProps();
		const {columnClass, columnsClass} = this;
		
		const colids = [];
		const cols = columns.reduce((acc, col) => {
			const colid = uuid();
			colids.push(colid);
			acc[ colid ] = {
				name: columnClass,
				tag: 'div',
				classes: Object.entries(col).map(([s, n]) => `${columnClass}-${n}${ s === 'default' ? '' : `-${s}` }`),
				children: []
			};
			return acc;
		}, {});
		
		const Elements = {
			'1':{
				name: columnsClass,
				tag: 'div',
				children: colids
			},
			...cols
		},
		
		Events = {};
		
		return {Elements, Events};
	}
	
	replaced(id, args){
		const elems = this.Scheman.Elements;
		for(const [i, colid] of Object.entries(elems[id].children)){
			if(args[i]) elems[colid].children.push(args[i]);
		}
	}
};
