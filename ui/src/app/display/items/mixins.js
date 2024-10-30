import BaseMixin from '../../mixins/BaseMixin';
import {ListItemMixin} from '../../../libs/list/mixins';
import {DimMixin} from '../../../libs/dom/port';
import {getDeepProp} from '../../../libs/bp';
import {truncateText, numFormat, utcToLocal} from '../utils';

import Author from './components/Author.vue';
import Text from './components/Text.vue';
import Media from './components/Media.vue';
import LinkBox from './components/LinkBox.vue';
import Slider from './components/Slider.vue';

import Navigation from '../viewers/Navigation.vue';
import {VideoPlayer} from '../../instance/display/viewers/mixins.js';

const ItemRendererMixin = {
	mixins: [DimMixin],
	
	computed: {
		excerpt(){
			return truncateText(
				this.it.text,
				this.excerpt_expanded,
				this.excerpt_length, 
				this.i18n
			);
		},
		
		highlightedStat(){
			if( this.it.views ) return `${ numFormat(this.it.views, this.numAbbrs) } ${this.i18n.views}`;
			if( this.it.extra.items ) return `${ this.it.extra.items } ${this.itemsLabel}`;
			return null;
		},
		
		isLeafItem(){
			return this.getD().is_leaf;
		},
		
		hasStats(){
			return this.isLeafItem;
		},
		
		hasLinkBox(){
			return this.it.title && this.it.extra.att;
		},
		
		mediaWidth(){
			return this.bbox.w;
		},
		
		collectionContent(){
			return ({
				album: 'photos',
				playlist: 'videos',
			})[ this.it.type ];
		},
		
		collectionIcon(){
			const {type} = this.it;
			if( type === 'album' ) return 'images';
			if( type === 'playlist' ) return 'list';
			return null;
		},
		
		itemsLabel(){
			return this.i18n[ this.collectionContent ];
		},
		
		thumbSrc(){
			const srcs = this.it.media;
			if( !srcs || !this.mediaWidth ) return null;
			if( !srcs.length ) return 'https://via.placeholder.com/1150';
			
			if( srcs.length === 1 ){
				return srcs[0].url;
			} else {
				const n = this.mediaWidth * (window.devicePixelRatio || 1);
				const idx = srcs.findIndex(e => e.width < n);
				if( idx === -1 ){
					return srcs[srcs.length-1].url;
				} else if( idx === 0 ){
					return srcs[0].url;
				} else {
					return srcs[idx-1].url;
				}
			}
		},
		
		i18n(){
			return this.getI18n('item');
		},
		
		numAbbrs(){
			return this.getI18n('numbers');
		},
		
		timeFormat(){
			return this.getI18n('time').format;
		},
		
		shortTimeFormat(){
			return this.getI18n('time').short_format;
		}
	},
	
	data(){
		return {
			excerpt_expanded: false,
			excerpt_length: 120,
			current_slide: 0
		};
	},
	
	watch: {
		selected_value(){
			if( this.$refs.carousel ){
				this.$refs.carousel.goToPage(0);
			}
		}
	},
			
	methods: {
		allProps(){
			return {
				cP: this.cP,
				it: this.it, 
				excerpt: this.excerpt,
				toggleExcerpt: this.toggleExcerpt,
				itemsLabel: this.itemsLabel,
				collectionIcon: this.collectionIcon,
				verifiedTickColor: this.verifiedTickColor,
				
				itemLink: this.itemLink,
				profileLink: this.profileLink,
				atTime: this.atTime,
				atTimeShort: this.atTimeShort,
				readableDuration: this.readableDuration,
				onItemChoose: this.onItemChoose,
				
				canOpen: this.canOpen,
				thumbSrc: this.thumbSrc,
				attachmentLink: this.attachmentLink,
				attachmentTitleLink: this.attachmentTitleLink,
				onMediaLoad: this.onMediaLoad,
				
				select: this.select,
				slideChange: this.slideChange,
				getCarousel: this.getCarousel,
				
				numFormat: this.numFormat,
				i18n: this.i18n
			};
		},
				
		atTime(date){
			return utcToLocal(date).format( this.timeFormat );
		},
		
		atTimeShort(date){
			return utcToLocal(date).format( this.shortTimeFormat );
		},
		
		numFormat( num ){
			return numFormat(num, this.numAbbrs);
		},
				
		toggleExcerpt(e){
			e.preventDefault();
			this.excerpt_expanded = !this.excerpt_expanded;
		},
		
		getCarousel(){
			return this.$refs.carousel;
		},
		
		slideChange(e, i){
			// album item
			if( !i ){
				this.onMediaLoad();
				this.$refs.carousel.onResize();
			}
		},
						
		Author(e, peid, data){
			if( !this.it.author ) return null;
			return this.createElementWithProps(e, this.allProps(), peid);
		},
		
		TextContent(e, peid, data){
			if( !this.it.text ) return null;
			return this.createElementWithProps(e, this.allProps(), peid);
		},
		
		Media(e, peid, data){
			if( !this.it.media ) return null;
			return this.createElementWithProps(e, this.allProps(), peid);
		},
		
		LinkBox(e, peid, data){
			if( !this.hasLinkBox ) return null;
			return this.createElementWithProps(e, this.allProps(), peid);
		},
		
		SharedItem(e, peid, data){
			if( !this.it.extra.shared_item ) return null
			return this.createElementWithProps(e, {
				...this.allProps(),
				it: this.it.extra.shared_item
			}, peid);
		},
		
		Stats(e, peid, data){
			if( !this.hasStats  ) return null;
			return this.createElementWithProps(e, this.allProps(), peid);
		},
		
		Comments(e, peid, data){
			if( !this.showComments ) return null;
			return this.createElementWithProps(e, {entity: this.selected_value}, peid);
		},
				
		select(dir){
			this.$refs.carousel.handleNavigation( dir );
		},
		
		onMediaLoad(e){
			this.$emit('item-load');
		}
	},
			
	components: {
		Author,
		TextContent: Text,
		Media,
		Carousel: () => {
			return new Promise((resolve, reject) => {
				import('vue-carousel')
					.then(re => resolve(re.Carousel));
			});
		},
		Slide: () => {
			return new Promise((resolve, reject) => {
				import('vue-carousel')
					.then(re => resolve(re.Slide));
			});
		},
		Slider,
		VideoPlayer,
		Navigation,
		LinkBox
	}
};

const ItemMixin = {
	mixins: [BaseMixin, ListItemMixin, ItemRendererMixin],
	inject: ['getD'],
	props: {
		it: {
			type: Object,
			required: true
		},
		highlightable: {
			type: Boolean,
			default: () => true
		}
	},
		
	computed:{
		showComments(){
			const {comments, mode} = this.getD().viewer;
			if( comments === -1 || !this.it.comments ) return false;
			return mode === 0 && (comments === 0 || this.is_selected);
		},
		
		canOpen(){
			const {type, extra} = this.it;
			return this.viewMode === 0 && 
				   this.is_selected && 
				   (
					type === 'video' || type === 'gif' ||
					(type === 'album' && getDeepProp(extra, 'att.inline_album'))
				   );
		},
		
		canPlayIfVideo(){
			return true;
		},
		
		viewMode(){
			return this.getD().viewer.mode;
		},
		
		highlighted(){
			return this.highlightable && this.is_selected;
		},
		
		verifiedTickColor(){
			return 'inherit';
		}
	},
	
	methods: {
		onItemChoose(e){
			if( this.viewMode !== 2 && this.canPlayIfVideo ){
				this.onItemSelect(e);
			}
		},
				
		// Gets overrided for viewer		
		attachmentLink(it){
			return it.extra.att ? (it.extra.att.url || this.itemLink(it.extra.att, it)) : this.itemLink(it);
		},
		
		attachmentTitleLink(it){
			return it.extra.att ? (it.extra.att.url || this.itemLink(it.extra.att, it)) : this.itemLink(it);
		},
				
		readableDuration(seconds){
			const d = new Date(seconds * 1000).toISOString().substr(11, 8);
			if( d.startsWith('00:') ) return d.replace('00:', '');
			return d;
		}
	}
};

const LongItemMixin = {
	inject: ['portmedia'],
	
	data(){
		return {
			mbox: {
				w: 0,
				h: 0
			}
		};
	},
	
	watch: {
		'portmedia.a'(){
			this.onMediaLoad();
		}
	},
	
	computed: {
		mboxw(){
			const {w} = this.bbox;
			const {media_width} = this.Elements[this.eid].config;
			if( !w ) return `${media_width}%`;
			return this.columnar ? `100%` : `${media_width}%`;
		},
		
		mboxh(){
			return this.mbox.h ? `${this.mbox.h}px` : 'none';
		},
		
		columnar(){
			const {media_width, shift} = this.Elements[this.eid].config;
			return media_width === 100 || (shift && !this.portmedia.sizes.includes('l'));
		},
		
		mediaWidth(){
			if( this.columnar ) return this.bbox.w;
			return this.bbox.w * this.Elements[this.eid].config.media_width/100;
		}
	},
	
	methods: {
		onMediaLoad(e){
			const {mediael} = this.$refs;
			this.mbox.h = (!mediael || this.columnar) ? 0 : mediael.clientHeight;
			this.$emit('item-load');
		}
	}
};

export {ItemMixin, ItemRendererMixin, LongItemMixin};
