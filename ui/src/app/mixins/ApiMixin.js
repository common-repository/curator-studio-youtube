import axios from 'axios';
import md5 from '../../libs/md5';
import qs from 'qs';

const USE_CACHE = process.env.NODE_ENV === 'development' && 0;
const API_URL = window.csvars ? window.csvars.api_url : `http://localhost/wordpress/wp-json/`;
//const API_URL = window.csvars ? window.csvars.api_url : `http://192.168.2.7/wordpress/wp-json/`;
const AJAX_URL = window.csvars && window.csvars.ajax_url;

const platform = process.env.VUE_APP_PLATFORM;
const BASE_URL = `${API_URL}curator-studio/${platform}/v1`;
const platform_slug = `curator_studio_${platform}`;

const ajax = axios.create({
	baseURL: BASE_URL
});

export default {
	data(){
		return {
			loading: false
		};
	},
		
	methods:{
		$$notify(arg){
			if( this.$notify ){
				this.$notify(arg);
			}
		},
		
		setCache({config:{url, data}}, response){
			if( !USE_CACHE ) return;
			const key = md5( [url, data||'null'] );
			localStorage.setItem(key, JSON.stringify(response));
		},
		
		getCache(path, args=null, parsed=false){
			if( !USE_CACHE ) return null;
			const key = md5( [path, JSON.stringify(args||null)] );
			const data = localStorage.getItem(key);
			if( parsed ) return JSON.parse(data);
			return data;
		},
		
		async GET(endpoint){
			if( this.getCache(endpoint) ) return this.getCache(endpoint, null, true);
			return await this.httpResponse(ajax.get(endpoint));
		},
		
		async AJAX(endpoint, {app_id, lid, args, stream}){
			let sources = null;
			if( endpoint === '/stream/meta/' ){
				sources = stream.entity;
			} else {
				sources = stream.sources.map(e => {
					return e.dynamic ? e : {entity: e.entity};
				});
			}
			
			const path = {
				app_id,
				lid,
				sources,
				...(args ? {
					per_page: args.pagination.per_page,
					page: args.pagination.page,
					max_results: args.pagination.max_results,
					order: args.sort.order === 1 ? 'desc' : 'asc',
					order_by: args.sort.by
				} : {})
			};
			
			if( AJAX_URL && window.csvars && window.csvars[platform] ){
				if( !(Array.isArray(sources) && sources[0].edge === 'comments') ){
					const re = window.csvars[platform].lists[lid];
					if( re && (!args || !args.pagination.page) ){
						return Promise.resolve( re.data || re );
					}
				}
			}
			
			return await this.httpResponse(axios({
				method: 'POST',
				url: AJAX_URL,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: qs.stringify({action: platform_slug, endpoint, data: path})
			}));
		},
		
		httpResponse(promise){
			this.loading = true;
			return promise.then(({data:{error, data, meta}, ...res}) => {
				this.loading = false;
				if( meta && meta.quotas ){}
				if( error ){
					this.$$notify({type: 'error', text: error.message});
					return Promise.reject(error);
				}
				if( meta.message ){
					this.$$notify({type: 'success', text: meta.message});
				}
				this.setCache(res, data);
				return data;
			})
			.catch(er => {
				this.loading = false;
				return Promise.reject(er);
			});
		},
		
		async POST(endpoint, data){
			if( AJAX_URL && ['/stream/', '/stream/meta/'].includes(endpoint) ){
				return this.AJAX(endpoint, data);
			}
			if( this.getCache(endpoint, data) ) return this.getCache(endpoint, data, true);
			return await this.httpResponse(ajax.post(endpoint, data));
		}
	}
}

export {ajax};
