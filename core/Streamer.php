<?php
namespace csyoutube\core;

if( !defined( 'ABSPATH' ) ) die('They dead me.');

use csyoutube\utils\Utils;
use csyoutube\platform\Platform;

class Streamer{
	function __construct($store, $config){
		$this->Store = $store;
		$this->Config = $config;
		
		foreach(Platform::sourceClasses() as $k=>$v){
			$this->{$k} = $v->init( $this->getCreds( $k ) );
		}
	}
	
	function getCreds($k){
		return $this->Config['creds'][$k];
	}
		
	function updateSourceWithError($source, $re){
		$source['state']['error'] = $re->error;
		$source['updated_time'] = Utils::currentTime();
		$this->Store->updateSource($source['id'], $source);
	}
	
	function mergeExtra($source, $re){
		$re = $re->data;
		$re['source']['updated_time'] = Utils::currentTime();
		if( isset($re['source']['extra']) ){
			$re['source']['extra'] = array_merge(
				$source['extra'],
				$re['source']['extra']
			);
		} else {
			$re['source']['extra'] = $source['extra'];
		}
		return $re;
	}
		
	function refreshStream($new){
		$sources = ['errors' => [], 'data' => []];
		foreach($new as $source){
			$path =  $source['path'];
			$state = $source['state'];
			
			$re = $this->{$path['source']}->getItems(
				$path, 
				null,
				$state
			);
			
			if( property_exists($re, 'error') ){
				$sources['errors'][$source['hash']] = Utils::toa($re->error);
				$this->updateSourceWithError($source, $re);
				continue;
			}
						
			$re = $this->mergeExtra($source, $re);
			
			$re['source']['state'] = array_merge(
				$state,
				[
					'error' => null,
					'cache_pagination' => $re['source']['state']['pagination']
				],
				$re['source']['state']
			);
			
			// preserve old pagination - may have reached may pages deep
			if( Utils::get($state, 'pagination') ){
				$re['source']['state']['pagination'] = $state['pagination'];
			}
						
			$this->Store->upsertItemsAndUpdateSource($source, $re, $sources, 'refresh');
		}
		return $sources;
	}
	
	function streamPage($new){
		$sources = ['errors' => [], 'data' => []];
		foreach($new as $source){
			$path =  $source['path'];
			$state = $source['state'];
			
			if( !Utils::get($state, 'pagination') )
				continue;
						
			$re = $this->{$path['source']}->getItems(
				$path, 
				$state,
				$state
			);
						
			if( property_exists($re, 'error') ){
				$sources['errors'][$source['hash']] =  Utils::toa($re->error);
				$this->updateSourceWithError($source, $re);
				continue;
			}
						
			$re = $this->mergeExtra($source, $re);
			
			$re['source']['state'] = array_merge(
				$state,
				['error' => null],
				$re['source']['state']
			);
						
			$this->Store->upsertItemsAndUpdateSource($source, $re, $sources, 'pagination');
		}
		return $sources;
	}
	
	function streamSources($paths){
		$sources = ['errors' => [], 'data' => []];
		foreach($paths as $f){
			$hash = Utils::hash($f);
			$re = $this->stream($f, $hash);
			if( Utils::geto($re, 'error') ){
				$sources['errors'][$hash] =  Utils::toa($re->error);
			} else {
				$this->Store->insertSource($re->data);
				$sources['data'][$hash] = $re->data;
			}
		}
		return $sources;
	}
	
	function stream($path, $hash){
		$re = $this->{$path['source']}->getItems( $path );
		
		if( property_exists($re, 'error') ){
			return $re;
		}
				
		$re->data['source'] = array_merge(
			['extra' => []],
			$re->data['source'],
			['source' => $path['source'], 'hash' => $hash, 'path' => $path]
		);
		
		return $re;
	}
		
	function refreshMeta($source){
		$path = $source['path'];
		$re = $this->{$path['source']}->getMeta( $path, $source['state'] );
		
		if( Utils::geto($re, 'error') ){
			$source['state']['error'] = $re->error;
			$source['updated_time'] = Utils::currentTime();
			$this->Store->updateSource($source['id'], $source);
		} else {
			$source['state']['error'] = null;
			$this->Store->updateSource($source['id'], array_merge(
				$source,
				[
					'extra' => $re->data,
					'updated_time' => Utils::currentTime()
				]
			));
		}
	}
	
	function getMeta($path, $hash){
		$re = $this->{$path['source']}->getMeta( $path );
		
		if( property_exists($re, 'error') ){
			return $re;
		}
		
		$re = [
			'source' => [
				'source' => $path['source'],
				'path' => $path,
				'hash' => $hash,
				'extra' => $re->data
			]
		];
		
		$inserted = $this->Store->insertSource($re);
		return $inserted ? $hash : 0;
	}
}
