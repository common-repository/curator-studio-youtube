import Config from '../../instance/config';
import {Variables, designVariables} from '../../../libs/dom/base';

const {spacing:{relative}, tones, radii} = designVariables(Variables); 
const colgap = '.5em', 
	negap = '-'+colgap, 
	colgap2 = '1em';
	
const gaps = ['xs', 'sm', 'normal', 'md', 'l'].map(cur => {
	const gap = relative[cur].join(''),
		gap2 = [relative[cur][1]*2, relative[cur][2]].join('');
	const pf = `.${Config.class_prefix}`;	
	
	return `${pf}-gap-${cur} ${pf}-sub-col:not(:last-child){ margin-bottom: ${gap2}; }`;
}).join('');

export default `
.VueCarousel-slide-adjustableHeight {
	display: block !important;
}

.VueCarousel-inner {
	align-items: flex-start !important;
}

$cp-sub-col:not(:last-child){
	margin-bottom: ${colgap2}
}

${gaps}

$cp-gap-none $cp-sub-col{
	margin-bottom: 0;
}

$cp-sub-col > $cp-sub-col{
	border: none;
	margin-bottom: 0 !important;
}

$cp-carousel__navigation--static{
	margin: 0 !important;
	padding: 0 !important;
}

$cp-carousel__navigation--static button{
	position: absolute;
	z-index: 1000;
	transform: translateY(-50%);
	top: 50%;
}

$cp-carousel__navigation--static button:first-child{
	left: 0em;
}

$cp-carousel__navigation--static button:last-child{
	right: 0em;
}

$cp-carousel__navigation--static--inside button:first-child, 
$cp-carousel__navigation--static--in button:last-child{
	transform: translate(50%, -50%);
}

$cp-carousel__navigation--static--inside button:last-child,
$cp-carousel__navigation--static--in button:first-child{
	transform: translate(-50%, -50%);
}

$cp-simple-viewer__navigation$cp-carousel__navigation--static button{
	z-index: 1100 !important;
}

$cp-simple-viewer__lightbox $cp-simple-viewer__navigation$cp-carousel__navigation--static button{
	position: static;
	transform: translate(0) !important;
	margin: 1em 0;
}

$cp-simple-viewer__lightbox $cp-l $cp-simple-viewer__navigation$cp-carousel__navigation--static button{
	position: fixed;
}

$cp-simple-viewer__lightbox $cp-l $cp-simple-viewer__navigation$cp-carousel__navigation--static button:first-child{
	transform: translate(50%, -50%) !important;
}

$cp-simple-viewer__lightbox $cp-l $cp-simple-viewer__navigation$cp-carousel__navigation--static button:last-child{
	transform: translate(-50%, -50%) !important;
}

$cp-simple-viewer $cp-carousel__navigation--static button,
$cp-viewer--close{
	transition: opacity 250ms;
	opacity: 0;
}

$cp-simple-viewer:hover $cp-carousel__navigation--static button,
$cp-simple-viewer:hover $cp-viewer--close{
	opacity: 1;
}

.VueCarousel-slide $cp-viewer--close{
	transform: translate(0, 0) !important;
}

$cp-lightbox $cp-viewer--close{
	display: none;
}

$cp-lightbox $cp-simple-viewer__collection $cp-card,
$cp-lightbox $cp-simple-viewer__item $cp-card{
	border: none;
}


` + [...Object.entries(relative), ['none', ['', 0, 'em']]].map(([a, b]) => `
	$cp-gap-${a} .VueCarousel-inner {
		margin: -${ b.join('') };
	}
`).join('')
