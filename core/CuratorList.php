<?php
namespace csyoutube\core;

if( !defined( 'ABSPATH' ) ) die('They dead me.');

use csyoutube\db\DB;
use csyoutube\utils\Utils;

class CuratorList{	
	function __construct($store, $config){
		$this->Store = $store;
		$this->Config = $config;
		$this->Streamer = null;
		
		$this->Errors = [];
		$this->Sources = [];
		$this->Refresh = false;
		$this->Fresh = true;
		
		return $this;
	}
		
	function getStreamer(){
		if( !$this->Streamer ){
			$this->Streamer = new Streamer(
				$this->Store,
				$this->Config
			);
		}
		return $this->Streamer;
	}
	
	function getFreshStreamItems($paths, $args, $fresh=true){
		$this->Fresh = $fresh;
		
		$paths = $this->filterDynamicSources($paths);
		$this->Sources = $this->Store->getSourcesByHashes(
			Utils::hashArray($paths)
		);
		
		$this->checkUnconnectedSources($this->Sources);
		$this->checkMissingSources($paths);
		$this->checkFreshness();
		
		return $this->getStreamItems($this->Sources, $args);
	}
	
	function filterDynamicSources($paths){
		return array_filter($paths, function($p){
			if( $p['entity'] === '__AUTO_STREAM__' ){
				$this->addErrors([
					Utils::hash($p) => Utils::nonEditorError()->error
				]);
				return false;
			}
			return true;
		});
	}
	
	function checkUnconnectedSources($sources){
		$this->Store->connectSourcesToStream(
			array_map(
				function($s){
					return $s['hash'];
				},
				array_filter(
					$sources,
					function($src){ 
						return $src['streams'] == 0;
					}
				)
			)
		);
	}
	
	function addErrors($errors){
		$this->Errors = array_merge($this->Errors, $errors);
	}
	
	function checkMissingSources($paths){
		if( count($paths) > count($this->Sources) ){
			$dbhashes = Utils::groupBy($this->Sources, 'hash');
			$tofetch = array_filter($paths, function($s) use($dbhashes){
				return !isset($dbhashes[ Utils::hash($s) ]);
			});
			
			$re = $this->getStreamer()->streamSources($tofetch);
			
			// Merge Sources with sources fetched just now if any source returned valid data
			if( count($tofetch) !== count($re['errors']) ){
				$this->Sources = array_merge(
					$this->Sources, 
					$this->Store->getSourcesByHashes(
						array_map(function($e){ 
							return Utils::hash($e);
						}, $tofetch)
					)
				);
			}
			$this->addErrors($re['errors']);
		}
	}
	
	function needsRefresh($source){
		$cache_duration = $this->Config['cache_duration'] * 60;
		return Utils::get($source['state'], 'error') || (Utils::currentTime('timestamp') - strtotime($source['updated_time']) > $cache_duration);
	}
	
	function checkFreshness(){
		$sources_to_refresh = array_filter($this->Sources, function($e){
			return $this->needsRefresh($e);
		});
		
		if( $this->Fresh ){
			$this->getStreamer()->refreshStream($sources_to_refresh);
			
			$this->Sources = $this->Store->getSourcesByIds(
				Utils::pick($this->Sources, 'id')
			);
			$this->Refresh = false;
		} else {
			$this->Refresh = !empty($sources_to_fetch);
		}
	}
	
	function getStreamItems($sources, $args){
		$pagi = $args['pagination'];
		
		$re = $this->getEnoughItems(
			$sources,
			$args
		);
							
		$re = [
			'meta' => [
				'sources' => $re[0], 
				'pagination' => [
					'page' => $pagi['page'], 
					'total_results' => $this->totalResults($re[0], $pagi)
				]
			],
			'debug' => null,
			'refresh' => $this->Refresh,
			'errors' => empty($this->Errors) ? null : $this->Errors,
			'items' => $re[1]
		];
		
		return $re;
	}
	
	function getNewStreamItems($paths, $args, $errors){
		$paths = $this->filterDynamicSources($paths);
		$this->Sources = $this->Store->getSourcesByHashes(
			array_keys($paths)
		);
		
		$this->checkMissingSources(array_values($paths));
		if( $errors ) $this->addErrors($errors);
		
		return $this->getStreamItems($this->Sources, $args);
	}
	
	function totalResults($sources, $pagi){
		$items = 0;
		$pagination = false;
		$loaded = ($pagi['page']+1) * $pagi['per_page'];
		
		// Add item count from each source and check if any source has next page available
		foreach($sources as $src){
			$items += $src['items'];
			if( !$pagination ) $pagination = !empty( Utils::get($src['state'], 'pagination') );
		}
		
		if( $items <= $loaded){
			if($pagination) $items += $pagi['per_page'];
		}
		
		if( $pagi['max_results'] ){
			if( $loaded >= $pagi['max_results'] ) return $loaded;
		}
		
		return $items;
	}
	
	/*
		Pre-process sources. Useful for e.g to fetch pinned sources separately.
		Must return an array of 3 elements.
		First element (Array): [Items from pre-processed sources, Pre-processed sources, Non-pre-processed sources] 
		Second element (Integer): Per-page number - length of items from pre-processed sources
		Third element (Array): External_ids of items from pre-processed sources. They'll be excluded from further select queries.
	*/
	function filterSources($sources, $offset, $limit){
		return [[[], [], $sources], $limit, []];
	}
	
	function getEnoughItems($sources, $args){	
		$pagi = $args['pagination'];	
		$offset = $pagi['page'] * $pagi['per_page'];
		$limit = $pagi['per_page'];
		$sort = $args['sort'];
		
		// 111 is the magic number used for open lists
		$i = $limit === 111 ? 5 : 0;
		
		list($pre, $limit, $exclude) = $this->filterSources($sources, $offset, $limit);
		list($pitems, $psources, $sources) = $pre;
						
		$items = $this->Store->selectStreamItems($sources, $offset, $limit, $sort, $exclude);
		
		$errors = [];
		$tofetch = $sources;
		
		while( !empty($tofetch) && count($items) < $limit && $i < 5 ){
			$states = $this->getStreamer()->streamPage($tofetch);
			
			$merged = $this->mergeSources($sources, $states);
			$sources = $merged[0];
			$tofetch = $merged[1];

			$items = $this->Store->selectStreamItems($sources, $offset, $limit, $sort, $exclude);
			$errors += $states['errors'];
			$i++;
		}
		
		$sources = array_merge($psources, $sources);
		$this->addErrors(
			array_merge($this->combineErrors($sources), $errors)
		);
		
		return [
			$sources,
			$this->postProcessItems($sources, array_merge($pitems, $items)), 
		];
	}
	
	function mergeSources($sources_, $states){
		$sources = [[], []];
		$hashed = Utils::groupBy($sources_, 'hash');
		
		foreach($hashed as $hash => $source){
			if( isset($states['data'][$hash]) ){
				$src = array_merge($source, $states['data'][$hash]);
				// override old states of sources
				$src['state'] = array_merge(
					$source['state'], 
					$src['state']
				);
				$sources[0][] = $src;
				// Put sources that returned data in the second array too to fetch more in next iteration if needed
				$sources[1][] = $src;
			} else {
				// These returned error
				$sources[0][] = $source;
			}
		}
		
		return $sources;
	}
	
	function combineErrors($sources){
		$errors = [];
		foreach($sources as $source){
			$state = $source['state'];
			if( Utils::get($state, 'error') ){
				$errors[$source['hash']] = $state['error'];
			}
		}
		return $errors; 
	}
	
	function postProcessItems($sources, $items){
		$authors = [];
		$source_names = [];
		foreach($sources as $src){
			$source_names[$src['id']] = $src['path']['source'];
			if( isset( $src['extra']['author'] ) ){
				$authors[$src['id']] = $src['extra']['author'];
			}
		}
		
		foreach($items as &$it){
			$it['source'] = $source_names[$it['source_id']];
			if( isset( $authors[$it['source_id']] ) ){
				$it['author'] = $authors[$it['source_id']];
			}
		}
		
		return $items;
	}
	
	function getMeta($hash, $fresh=true, $hard_refresh=false){
		$sources = $this->Store->getSourcesByHashes([$hash]);
		if( empty($sources) ){
			return false;
		}
		
		$source = $sources[0];
		if( $source['streams'] == 0 ){
			$this->Store->connectSourcesToStream([ $source['hash'] ]);
		}
		if( $fresh && ($hard_refresh || $this->needsRefresh($source)) ){
			$this->getStreamer()->refreshMeta($source);
			return $this->Store->getSourcesByHashes([ $source['hash'] ])[0];
		}
		return $source;
	}
	
	function getProfiles($paths){
		$errors = [];
		$fetched_now = [];
		
		$sources = Utils::groupBy(
			$this->Store->getSourcesByHashes(
				Utils::hashArray($paths)
			),
			'hash'
		);

		$this->checkUnconnectedSources($sources);
		
		foreach($sources as $src){
			if($this->needsRefresh($src)){
				$this->getStreamer()->refreshMeta($src);
				$fetched_now[] = $src['hash'];
			}
		}
		
		if( count($paths) > count($sources) ){
			$fetched = [];
			
			foreach($paths as $path){
				$hash = Utils::hash($path);
				if( !isset($sources[ $hash ]) ){
					$re = $this->getStreamer()->getMeta($path, $hash);
					if(!$re){
						$errors[$hash] = Utils::create_error('Unable to save fetched data');
					} else if( gettype($re) === 'object' ){
						$errors[$hash] =  Utils::toa($re->error);
					} else {
						$fetched_now[] = $hash;
					}
				}
			}
		}
		
		if(!empty($fetched_now)){
			foreach($this->Store->getSourcesByHashes($fetched_now) as $src){
				$sources[$src['hash']] = $src;
			}
		}
		
		$items = [];
		$sources = array_map(function($e) use(&$items){
			$items[] = array_merge(
				$e['extra'],
				[
					'source' => $e['source'],
					'source_id' => $e['id']
				]
			);
			$e['extra'] = null;
			return $e;
		}, array_values($sources));
		
		return [
			'meta' => [
				'sources' => $sources
			],
			'items' => $items,
			'errors' => empty($errors) ? null : $errors
		];
	}
}
