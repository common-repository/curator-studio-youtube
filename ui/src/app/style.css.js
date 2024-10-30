import Config from './instance/config';
import ListStyles from './display/lists/style.css';

export default (
ListStyles + `

html$cp-clipped{
	overflow:hidden !important;
}

$cp-input[disabled], $cp-input[readonly], $cp-button[disabled]{
	opacity: .75;
	cursor: not-allowed;
}

$cp-vdp-datepicker $cp-input[readonly], $cp-shortcode-input[readonly]{
	opacity: 1;
	cursor: text;
}

$cp-lightlist $cp-input{
	max-width:12em;
}

$cp-lc-mr-none:last-child{
	margin-right: 0 !important;
}

$cp-lc-mb-none:last-child{
	margin-bottom: 0 !important;
}

$cp-opacity-1-hover:hover{
	opacity: 1;
}

$cp-bp-center{
	background-size: cover;
	background-position: center center;
}

$cp-simple-pane > $cp-simple-pane{}


$cp-lightbox__content{
	width: 95%;
	max-width: 95%;
}

$cp-xl $cp-lightbox__content{
	width: 80%;
	max-width: 80%;
}

$cp-simple-viewer{
	z-index: 100000;
}

$cp-link-color-inherit a, a$cp-link-color-inherit{
	color: inherit;	
}



$cp-basic-item $cp-basic-item--meta$cp-absolute{
	opacity: 0;
	transition: opacity 250ms;
}

$cp-basic-item:hover $cp-basic-item--meta$cp-absolute{
	opacity: 1;
}


$cp-basic-item--meta$cp-absolute $cp-card__footer,
$cp-basic-item--meta$cp-absolute $cp-card__footer__item{
	border: none !important;
}



$cp-fade-enter-active, $cp-fade-leave-active {
  transition: transform .5s;
}

$cp-fade-enter, $cp-fade-leave-to{
  transform: scale(0);
}

$cp-fixed-fill{
	position: absolute;
	top:0;
	right:0;
	bottom:0;
	left: 0;
}

$cp-loading{
	position: absolute;
	top: 0;
	left: 0;
	width:100%;
	z-index: 100;
	background: rgba(255, 255, 255, .75);
}

$cp-lc{
	min-height: 150px;
	min-width: 150px;
}
`).replace(/\$cp/g, `.${Config.class_prefix}`);
