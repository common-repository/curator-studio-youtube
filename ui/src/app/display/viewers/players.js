import Vue from 'vue';

import BaseMixin from '../../mixins/BaseMixin';
import {DimMixin} from '../../../libs/dom/port';
import Domu from '../../../libs/dom/domu';
import {uuid} from '../../../libs/bp';

const PlayerMixin = Vue.extend({
	props: ['el'],
	
	data(){
		return {
			sdk: null,
			queued: null,
			elid: uuid(),
			d: null
		};
	},
	
	computed: {
		PLAYER_STATE(){
			return {
				UNSTARTED: -1,
				ENDED: 0,
				PLAYING: 1,
				PAUSED: 2,
				BUFFERING: 3,
				CUED: 5
			}
		}
	},
	
	created(){
		this.player = null;
		this.$on('sdk.ready', () => {
			this.sdk = true;
			this.checkQueue();
		});
		this.loadSDK();
	},
	
	methods: {
		createHolder(){
			Domu.createElement('div', {id: this.elid}, `#${this.el}`);
		},
				
		loadSDK(){
			this.$emit('sdk.ready');
		},
		
		setNativePlayer(p){
			this.player = p;
			this.$emit('ready');
		},
		
		checkQueue(){
			if( this.queued ){
				this.createPlayer(this.queued);
				this.setQueued(null);
			}
		},
		
		setQueued(q){
			this.queued = q;
		},
				
		loadVideo(vid, d){
			this.d = d;
			if( this.sdk ){
				if( this.player ){
					this.loadVideoById(vid);
				} else {
					this.createPlayer(vid);
				}
			} else {
				this.setQueued(vid);
			}
		},
		
		height(){
			return 'auto';
		}
	}
});

const YouTubePlayer = Vue.extend({
	name: 'YouTube',
	mixins: [PlayerMixin],
			
	methods: {
		loadSDK(){
			if( !window.YT ){
				window.onYouTubeIframeAPIReady = () => this.$emit('sdk.ready');
				Domu.loadScript({
					__id__: 'youtube-iframe-api',
					src: 'https://www.youtube.com/iframe_api'
				});
			} else {
				this.$nextTick(() => this.$emit('sdk.ready'));
			}
		},
		
		createPlayer(vid){
			this.createHolder();
			new YT.Player(this.elid, {
				width: '100%',
				height: '100%',
				videoId: vid.external_id,
				host: 'https://www.youtube-nocookie.com',
				playerVars: {
					autoplay: this.d.viewer.autoplay,
					start: this.d.viewer.start
				},
				events: {
					onReady: ({target}) => {
						this.setNativePlayer(target);
					},
					onStateChange: ({data, target}) => {
						this.$emit('state.change', data, target);
					}
				}
			});
		},
		
		getHolder(){
			return this.player.getIframe();
		},
		
		height(bbox){
			return `${(bbox.w * 9/16)}px`;
		},
		
		loadVideoById({external_id}){
			this.player.loadVideoById({videoId: external_id});
		},
		
		pauseVideo(){
			this.player.pauseVideo();
		}
	},
	
	beforeDestroy(){
		this.player.destroy();
	}
});

const NativePlayer = Vue.extend({
	name: 'Native',
	mixins: [PlayerMixin],
	
	template: `
		<video v-bind="attrs" 
			@loadeddata="loaded" 
			@pause="emitStateChange(PLAYER_STATE.PAUSED)"
			@play="emitStateChange(PLAYER_STATE.PLAYING)"
			@canplay="emitStateChange(PLAYER_STATE.CUED)"
			@ended="emitStateChange(PLAYER_STATE.ENDED)"
			@progress="emitStateChange(PLAYER_STATE.BUFFERING)">
		</video>
	`,
	
	computed: {
		attrs(){
			if( !this.vid )
				return null;
			return {
				type: 'video/mp4',
				src: this.vid.url,
				poster: this.vid.poster,
				autoplay: this.d.viewer.autoplay,
				controls: true
			};
		}
	},
	
	data(){
		return {
			vid: null
		};
	},
				
	methods: {
		loadSDK(){
			this.$nextTick(() => this.$emit('sdk.ready'));
		},
		
		loaded(){
			this.setNativePlayer(this.$el);
			this.emitStateChange(this.PLAYER_STATE.UNSTARTED)
		},
		
		createPlayer(vid){
			this.createHolder();
			this.$mount(`#${this.elid}`);
			this.vid = vid;
		},
		
		loadVideoById(args){
			this.vid = args;
		},
		
		emitStateChange(state){
			this.$emit('state.change', state, this.player);
		},
		
		getHolder(){
			return this.$el;
		},
		
		pauseVideo(){
			this.player.pause();
		}
	}
});


const VideoPlayer = {
	inject: ['cP', 'getD'],
	props: ['it'],
	mixins: [DimMixin],
	
	template: `
		<div class="fullwidth">
			<div :id="elid" :class="cP(['player-shell', 'd-flex', 'jc-center'])" :style="{height: height}"></div>
		</div>
	`,
	
	data(){
		return {
			elid: uuid()
		};
	},
	
	watch: {
		vid(n, o){
			if(this.Player.constructor.extendOptions.name === this.getPlayerType().extendOptions.name){
				this.Player.loadVideo(n, this.getD());
			} else {
				this.destroyPlayer();
				this.createPlayer();
			}
		},
		
		'$parent.bbox.w'(n, o){
			this.onDimResize();
		}
	},
	
	computed: {
		vid(){
			return this.it;
		},
		
		height(){
			return this.vid && this.Player.height(this.bbox);
		}
	},
	
	created(){
		this.createPlayer();
	},
		
	beforeDestroy(){
		this.destroyPlayer();
	},
	
	methods: {
		destroyPlayer(){
			this.Player.$destroy();
		},
		
		createPlayer(){
			this.Player = new (this.getPlayerType())( this.playerOptions() );
			this.Player.loadVideo(this.vid, this.getD());
			
			this.$EM.$on('pause.player', player => {
				if( this.Player.player !== player ){
					this.Player.pauseVideo();
				}
			});
			
			this.Player.$on('ready', () => {
				this.$emit('load');
			});
			
			this.Player.$on('state.change', (state, p) => {
				if( this.Player.PLAYER_STATE.PLAYING === state ){
					this.$EM.$emit('pause.player', this.Player.player);
				}
			});
		},
		
		playerOptions(){
			return {
				propsData: {
					el: this.elid
				}
			};
		}
	}
};

const VimeoPlayer = {};

export {PlayerMixin, YouTubePlayer, NativePlayer, VimeoPlayer, VideoPlayer};
