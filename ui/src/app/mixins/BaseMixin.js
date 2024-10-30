import {ClassPrefixerMixin} from '../../libs/dom/port';
import { library } from '@fortawesome/fontawesome-svg-core';

import { faFacebookF, faYoutube, faTwitter, faGoogle, faYelp } from '@fortawesome/free-brands-svg-icons';

import { 
	faUserSecret, faThumbsUp, faComment, faShare, faHeart, faRetweet, faUsers, faUser, faLink,
	faExternalLinkAlt, faAngleLeft, faAngleRight, faAngleUp, faAngleDown, faCopy, faCog, faImage, faImages, faList, faLock, faReply, faSearch, faSave, faSlidersH,
	faThumbsDown, faTimes, faTrash, faUndo, faPlay, faPlayCircle, faPlus, faCheck, faEye, faEyeSlash, faArrowsAlt, faPen, faInfoCircle, faSpinner,
	faStar, faStarHalfAlt, faToggleOn, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

import {
	faStar as faStarRegular
} from '@fortawesome/free-regular-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
	faUserSecret, faThumbsUp, faComment, faShare, faHeart, faRetweet, faUsers, faUser, faLink,
	faExternalLinkAlt, faAngleLeft, faAngleRight, faAngleUp, faAngleDown, faCopy, faCog, faImage, faImages, faList, faLock, faReply, faSearch, faSave, faSlidersH,
	faThumbsDown, faTimes, faTrash, faUndo, faPlay, faPlayCircle, faPlus, faCheck, faEye, faEyeSlash, faArrowsAlt, faPen,
	faFacebookF, faYoutube, faTwitter, faInfoCircle, faSpinner,
	faStar, faStarHalfAlt, faStarRegular, faGoogle, faYelp, faToggleOn, faCheckCircle
);

export default {
	inject: {
		cP: {
			type: Function,
			default: () => null
		},
		storekey: {
			default: null
		},
		getI18n: {
			type: Function,
			default: () => null
		}
	},
		
	...ClassPrefixerMixin,
	
	data(){
		return {
			cs_pro: process.env.VUE_APP_PRO === 'true'
		};
	},
		
	components: {
		fa: FontAwesomeIcon
	}
};
