import Config from '../instance/config';
import {Variables, designVariables} from '../../libs/dom/base';
const {tones, radii} = designVariables(Variables); 

export default `
.tooltip{
	background: ${ tones.shadeb3 };
	padding: .5em;
	color: ${ tones.shadea4 };
	border-radius: ${ radii.normal }em;
	font-family: Arial, sans-serif;
	letter-spacing: 1px;
	z-index: 100000;
}

.tooltip a{
	color: inherit;
	text-decoration: underline;
}

.vue-notification-group{
	top: 2em !important;
}

.vue-notification{
	font-size: 1em;
	margin-top: .2em;
}

$cp-cols--margin-none{
	margin: 0 !important;
}

$cp-cols--margin-none > $cp-col{
	padding-top: 1.35em !important;
	padding-bottom: 1.35em !important;
	padding-left: 0 !important;
	padding-right: 4em !important;
}

$cp-cols--margin-none > $cp-col:first-child{
}


$cp-loading{
	position: absolute;
	top: 0;
	left: 0;
	width:100%;
	z-index: 100;
	background: rgba(255, 255, 255, .75);
}

$cp-has-inline-inputs label{
	display: flex;
	align-items: center;
}

$cp-has-inline-inputs $cp-label{
	display: inline !important;
	margin-right: .5em;
	margin-bottom: 0 !important;
}

$cp-has-inline-inputs$cp-translations $cp-label{
	margin-right: 1.5em;
	font-weight: normal;
}

$cp-seditor{
	font-size: .75em;
	text-transform: uppercase;
	font-weight: 300;
}

$cp-seditor $cp-label{
	font-weight: 400;
	width: 30%;
}

$cp-translations $cp-label{
	font-weight: 400;
	width: 10%;
}


$cp-seditor $cp-select select,
$cp-stream-editor $cp-select select,
$cp-underlined-inputs $cp-select select,
$cp-stream-editor $cp-input,
$cp-underlined-inputs $cp-input,
$cp-seditor $cp-input {
	height:auto !important;
	border-width: 0px !important;
	border-bottom-width: 1px !important;
	padding-left: 0 !important;
}

$cp-seditor $cp-input {
	line-height:1;
}

$cp-seditor $cp-input[type='number'] {
    -moz-appearance:textfield;
}

$cp-seditor $cp-input::-webkit-outer-spin-button,
$cp-seditor $cp-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

$cp-sed-group:not(:last-child){
	margin-bottom:1.5em;
}

$cp-sed-field{
	margin-bottom:.35em;
}

$cp-cs-element-editor div[data-name='simple-viewer__lightbox']{
	display: none;
}
`.replace(/\$cp/g, `.${Config.class_prefix}`);
