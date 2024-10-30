<?php
namespace csyoutube\api;

use csyoutube\utils\Utils;
use csyoutube\core\Store;
use csyoutube\core\Streamer;
use csyoutube\core\CuratorList;
use csyoutube\platform\Platform;

class API{
	function __construct(){
		$this->Store = new Store();
		$this->Config = null;
	}
	
	private function parseArgs($data){
		if( !is_array($data) ){
			$data = [];
		}
		
		return [
			'pagination' => [
				'page' => (int)Utils::x($data, 'page', 0),
				'per_page' => (int)Utils::x($data, 'per_page', 10),
				'max_results' => (int)Utils::x($data, 'max_results', 0)
			],
			'sort' => [
				'by' => Utils::x($data, 'order_by', 'sequence'),
				'order' => Utils::x($data, 'order') === 'desc' ? 1 : -1
			]
		];
	}
	
	function getConfig(){
		if( !$this->Config ){
			$this->Config = $this->Store->getSettings();
		}
		return $this->Config;
	}
	
	private function newList(){
		return new CuratorList($this->Store, $this->getConfig());
	}

	function validateSources($sources){
		if( !is_array($sources) ){
			return null;
		}
		
		$source = Platform::sourceNames()[0];
		$sources = array_map(function($e) use($source){
			if( !is_array($e) ){
				return false;
			}
			$e['source'] = $source;
			if( !isset($e['edge']) || !isset($e['entity']) ){
				return false;
			}
			return $e;
		}, $sources);
		
		return array_filter($sources, function($e){
			return is_array($e);
		});
	}

	function parseSources($sources){
		return $this->validateSources($sources);
	}
	
	private function create_error($message, $code){
		return Utils::create_error($message, $code);
	}
		
	function getSourcesLimit(){
		return Utils::apply_filters('csuni_sources_limit', 10);
	}
		
	function stream($qd){
		if(!is_array($qd)) {
			return $this->create_error('Sources not provided', 400);
		}
		
		$sources = $this->parseSources(Utils::get($qd, 'sources', []));
		$args = $this->parseArgs(Utils::get($qd, 'args', []));
		if(!$sources) {
			return $this->create_error('Sources not provided', 400);
		}
		
		$source_count = $this->getSourcesLimit();
		if(count($sources) > $source_count){
			return $this->create_error("Sources cannot be more than $source_count", 400);
		}
		
		return $this->newList()->getFreshStreamItems($sources, $args);
	}
	
	function profiles($qd){
		if(!is_array($qd)) {
			return $this->create_error('Sources not provided', 400);
		}
		
		$sources = $this->parseSources(Utils::get($qd, 'sources', []));
		if(!$sources) {
			return $this->create_error('Sources not provided', 400);
		}
		
		$source_count = $this->getSourcesLimit();
		if(count($sources) > $source_count){
			return $this->create_error("Sources cannot be more than $source_count", 400);
		}

		return $this->newList()->getProfiles($sources);
	}
}
