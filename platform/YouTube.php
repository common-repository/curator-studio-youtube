<?php
namespace csyoutube\platform;

if( !defined( 'ABSPATH' ) )
	die('They dead me.');

use csyoutube\utils\URL;
use csyoutube\utils\Utils;
use csyoutube\platform\BaseSource;
	
class YouTube extends BaseSource{
	function __construct(){
		parent::__construct();
	}
		
	function init($creds){
		$this->limit = \csyoutube\platform\Platform::editorVars()['source']['limit']['any'];
		$this->Creds = $creds;
		return $this;
	}
			
	function request( $url ){
		//wp_send_json($url);
		$re = $this->query($url);
		//wp_send_json( json_decode($re) );
		if(gettype($re) === 'object') return $re;
		
		return json_decode( $re );
	}
	
	function makeURL($ppath, $path=null){
		$ppath = Utils::apply_filters('make_url', $ppath, $path);
		return "https://www.googleapis.com/youtube/v3/$ppath&key={$this->Creds['key']}";
	}
					
	function getChannelMeta($path){
		return $this->request( 
			$this->makeURL( "channels?part=snippet,statistics,brandingSettings&id={$path['entity']}", $path )
		);
	}
		
	function getPlaylistVideos($path, $state){
		return $this->request( 
			$this->makeURL( "playlistItems?part=snippet,contentDetails&maxResults={$this->limit}&pageToken={$state['pagination']['after']}&playlistId={$path['entity']}", $path )
		);
	}
			
	function getVideos($path, $state){
		$order = Utils::get($path, 'sortby') ? $path['sortby'] : 'date';		
		return $this->request(
			$this->makeURL( "search?q=&channelId={$path['entity']}&order=$order&part=snippet&type=video&pageToken={$state['pagination']['after']}&maxResults={$this->limit}", $path )
		);
	}
		
	function getSingleVideos($ids){
		$ids = is_array($ids) ? implode(',', $ids) : $ids;
		return $this->request( 
			$this->makeURL( "videos?part=snippet&id={$ids}" )
		);
	}
	
	function defaultState(){
		return [
			'pagination' => [
				'after' => ''
			]
		];
	}
	
	function checkCreds($state, $entity=null){
		$hash = hash('sha256', $this->Creds['key']);
		$this->validateCreds($state, $hash, [400, 403], 3600);
	}
				
	function getItems($path, $state=null, $anystate=null){
		$this->checkCreds($anystate);
		if( $this->nonCredible ) return $this->nonCredible;
		
		if( !$state ) $state = $this->defaultState();
		
		$this->limit = Utils::get($path, 'limit', $this->limit);
				
		if( $path['edge'] === 'playlist-videos' ){
			$re = $this->getPlaylistVideos($path, $state);
			if( Utils::geto($re, 'error') ) return $re;
			$re = $this->normalizeItems( $re );
		
		} else if( $path['edge'] === 'videos' ){
			$re = $this->getVideos($path, $state);
			if( Utils::geto($re, 'error') ) return $re;
			$re = $this->normalizeItems( $re );
		
		} else if( $path['edge'] === 'video' ){
			$re = $this->getSingleVideos( $path['entity'] );
			if( Utils::geto($re, 'error') ) return $re;
			$re = $this->fullNormalizeVideos( $re );
		
		} else if( $this->nonLiveEdge($path) ){
			
			return Utils::nonEditorError();
		
		} else {
			return Utils::apply_filters('get_remote_items', Utils::create_error('Unknown path', 400),
				$path, $state, $this
			);
		}
		
		return (object)['data' => Utils::apply_filters('normalized_source', $re, $path)];
	}
	
	function normalizeMedia($r){
		$images = (array)Utils::geto($r, 'thumbnails', []);
		//unset($images['high']);
				
		$images = array_map(function($e){ 
			return (array)$e; 
		}, array_values($images));
		
		array_multisort(array_column($images, 'width'), SORT_DESC, $images);
		return $images;
	}

	
	function normalizeItem( $it ){
		$type = 'video';
		$r = $it->snippet;
		$extra = [];
				
		if( $it->kind === 'youtube#playlist' ){
			$id = $it->id;
			$type = 'playlist';
		} else if( $it->kind === 'youtube#video' ){
			$id = $it->id;
		} else if( $it->kind === 'youtube#playlistItem' ){
			$id = $it->contentDetails->videoId;
		} else {
			$id = Utils::geto($it->id, 'videoId');
			if( !$id ){
				$id = Utils::geto($it->id, 'playlistId');
				$type = 'playlist';
			}
		}
		
		if( Utils::geto($r, 'liveBroadcastContent', 'none') !== 'none' ){
			$extra['live'] = Utils::geto($r, 'liveBroadcastContent');
		}
				
		return [
			'created_time' => $r->publishedAt,
			'title' => $r->title,
			'text' => $r->description,
			'external_id' => $id,
			'media' => $this->normalizeMedia($r),
			'author' => $this->extractAuthor($r),
			'type' => $type,
			'extra' => $extra
		];
	}
	
	function normalizeItems( $re ){
		return [
			'source' => $this->prepareSource($re),
			'items' => Utils::apply_filters(
				'normalized_items', 
				array_map(function($e){
					return $this->normalizeItem($e); 
				}, $re->items),
				$re->items
			)
		];
	}
	
	function fullNormalizeVideos($re){
		return [
			'source' => $this->prepareSource($re),
			'items' => array_map(function($it){
				return array_merge(
					$this->normalizeItem($it),
					$this->normalizeVideoDetails($it)
				);
			}, $re->items)
		];
	}
	
	function normalizeVideoDetails($it){
		return [];
	}
	
	function extractAuthor($it){
		return [
			'name' => $it->channelTitle,
			'external_id' => $it->channelId,
			'picture' => null
		];
	}
		
	function prepareSource($re, $extra=null){
		return [
			'name' => '',
			'state' => [
				'pagination' => Utils::geto($re, 'nextPageToken') ? [
					'after' => $re->nextPageToken
				] : null
			],
			'extra' => $extra
		];
	}
	
	function getMeta($path, $state=null, $anystate=null){
		$this->checkCreds($anystate);
		if( $this->nonCredible ) return $this->nonCredible;
		
		if( $path['edge'] === 'profile' ){
			$re = $this->getChannelMeta($path);
			if( Utils::geto($re, 'error') ) return $re;
			if( !Utils::geto($re, 'items') ){
				return Utils::create_error('Unknown Error');
			}
			
			$re = $re->items[0];
			
			$images = []; //Utils::geto($re, 'brandingSettings') ? (array)$re->brandingSettings->image : [];
			$images = array_map(function($e){
				return [
					'url' => $e,
					'width' => (int)@explode('-fcrop', explode('=w', $e)[1])[0]
				];
			}, array_values(
					array_filter($images, function($e){
						return strpos($e, 'Tv') === false;
					}, ARRAY_FILTER_USE_KEY)
				)
			);
			
			array_multisort(array_column($images, 'width'), SORT_DESC, $images);
			
			return (object)['data' => [
				'external_id' => $re->id,
				'text' => Utils::geto($re->snippet, 'description', ''),
				'name' => $re->snippet->title,
				'followers' => (int)$re->statistics->subscriberCount,
				'followers_hidden' => $re->statistics->hiddenSubscriberCount,
				'username' => Utils::geto($re->snippet, 'customUrl'),
				'pictures' => $this->normalizeMedia($re->snippet),
				'items' => (int)$re->statistics->videoCount,
				'views' => (int)$re->statistics->viewCount,
				'cover' => empty($images) ? null : $images
			]];
		} else if( $this->nonLiveEdge($path) ){
			return Utils::nonEditorError();
		} else {
			return Utils::create_error('Unknown path', 400);
		}		
	}
}
