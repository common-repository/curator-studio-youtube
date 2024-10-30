<?php
namespace csyoutube\utils;

if( !defined( 'ABSPATH' ) )
	die('They dead me.');

class Utils{
	// $DEV = 1 ? 'dev' : 'prod'
	const VERSION = '0.1.3';
	static $DEV = 0;
	static $platform = null;
	static $devhost = 'http://localhost:8080/';
					
	static function q($arg, $default=null){
		$v = self::get($_GET, $arg, $default);
		return $v ? sanitize_text_field($v) : $v;
	}
	
	static function x($data, $arg, $default=null){
		$v = self::get($data, $arg, $default);
		return $v ? sanitize_text_field($v) : $v;
	}
	
	static function g($key, $default=null){
		return self::get($GLOBALS['cstudio'], $key, $default);
	}
	
	static function ag($key, $value){
		$GLOBALS['cstudio'][$key] = $value;
	}
	
	static function pick($array, $key, $default=null){
		return array_map(function($e) use($key, $default){ 
			return self::get($e, $key, $default); 
		}, $array);
	}
	
	static function groupBy($array, $key){
		return array_reduce($array, function($acc, $cur) use($key){
			$acc[$cur[$key]] = $cur;
			return $acc;
		}, []);
	}
	
	static function fineCast($array){
		foreach($array as $k=>$v){
			if( $v === 'true' || $v === 'false' ){
				$array[$k] = $v === 'true';
				continue;
			}
			if( $v === 'null' ){
				$array[$k] = null;
				continue;
			}
			if( is_numeric($v) ){
				$n = floatval($v);
				$array[$k] = $n < 2147483647 ? $n : $v;
				continue;
			}
		}
		return $array;
	}
	
	static function hash($source){
		$source = (array)$source;
		ksort($source);
		return md5(json_encode($source));
	}
	
	static function hashArray($array){
		return array_map(function($s){
			return self::hash($s); 
		}, $array);
	}
	
	static function diff($a1, $a2){
		return array_values(
			array_diff($a1, $a2)
		);
	}
	
	static function serialize($val){
		return json_encode($val, JSON_UNESCAPED_UNICODE);
	}
	
	static function unserialize($val){
		return json_decode($val, JSON_UNESCAPED_UNICODE);
	}
	
	static function mergeSerials($item, $serials){
		foreach($serials as $k){
			if( isset($item[$k]) )
				$item[$k] = self::serialize($item[$k]);
		}
		return $item;
	}
	
	static function mergeItem($a, $b){
		$ea = self::get($a, 'extra', []);
		$eb = self::get($b, 'extra', []);
		return array_merge($a, $b, ['extra' => array_merge($ea, $eb)]);
	}
	
	static function applyMissingFields($row, $fields){
		$r = new \stdClass();
		foreach($fields as $fset){
			foreach(explode(', ', $fset[0]) as $f){
				if( property_exists($row, $f) ){
					$r->$f = $row->{$f};
				} else {
					if( gettype($fset[1]) === 'object' )
						$r->$f = clone $fset[1];
					else
						$r->$f = $fset[1];
				}
			}
		}
		return $r;
	}	

	static function get($v, $k, $default=null){
		return isset($v[$k]) ? $v[$k] : $default;
	}

	static function geto($v, $k, $default=null){
		return property_exists($v, $k) ? $v->{$k} : $default;
	}
	
	static function too($val){
		return json_decode(json_encode($val));
	}
	
	static function toa($val){
		return json_decode(json_encode($val), true);
	}
	
	static function create_error($msg, $code=500){
		return (object)[
			'error' => [
				'message' => $msg,
				'code' => $code
			]
		];
	}
	
	static function nonEditorError(){
		return self::create_error('Doesn\'t work in editor. Visit the page with shortcode.', 400);
	}
	
	static function create_api_response($data, $meta=[]){
		return [
			'data' => $data,
			'meta' => (object)$meta
		];
	}

	static function create_api_error($msg='Unknown Error', $code=500, $meta=[]){
		return [
			'meta' => (object)$meta,
			'error' => [
				'message' => $msg,
				'code' => $code
			]
		];
	}

	static function create_api_message($msg, $error=false){
		if($error) return self::create_api_error($msg);
		return self::create_api_response(null, ['message' => $msg]);
	}
	
	static function currentTime($format='mysql'){
		return current_time($format);
	}
	
	static function getListsStreams($lists, $lids){
		$diffsources = [];
		foreach($lids as $d){
			if( isset($lists[$d]) ){
				$list = $lists[$d];			
				if( $list['stream']['sources'] ){
					$diffsources = array_merge($diffsources, $list['stream']['sources']);
				}
				if( $list['stream']['meta'] ){
					$diffsources[] = $list['stream']['meta'];
				}
			}
		}
		return $diffsources;
	}
	
	static function call($args){
		return $args[0]->{$args[1]}();
	}
	
	static function hookTag($tag){
		if(strpos($tag, 'csuni') === 0){
			return $tag;
		}
		return self::$platform.'_'.$tag;
	}
	
	static function add_filter($tag, ...$args){
		return add_filter(self::hookTag($tag), ...$args);
	}
	
	static function apply_filters($tag, ...$args){
		return apply_filters(self::hookTag($tag), ...$args);
	}
	
	static function do_action($tag, ...$args){
		do_action(self::hookTag($tag), ...$args);
	}
	
	static function add_action($tag, ...$args){
		add_action(self::hookTag($tag), ...$args);
	}
}

if(!isset($GLOBALS['cstudio'])){
	$GLOBALS['cstudio'] = [];
}
