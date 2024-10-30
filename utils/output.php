<?php
namespace csyoutube\utils;
use csyoutube\utils\Utils;

function fillChildLists($src, $list, &$lists){
	if( !empty( $list['items'] ) ){
		foreach($list['items'] as $item){
			$l = &$lists['lists'][ $item['child_list'] ];
			if( $l['stream']['sources'] ){
				foreach($l['stream']['sources'] as &$lsrc){
					if( $lsrc['entity'] === '__AUTO_STREAM__' ){
						$lsrc['entity'] = $src['entity'];
					}
				}
			}
		}
	}
}

function fillDynamicSource( &$src, $atts, $list, &$lists ){
	if( strpos($src['edge'], '--') !== false){
		$parts = explode('--', $src['edge']);
		$from = $parts[1];
		
		if( $from === 'shortcode' ){
			$src['edge'] = $parts[0];
			$src['entity'] = Utils::get($atts, $src['entity'], '');
			fillChildLists($src, $list, $lists);
		} elseif ( $from === 'url-parameter' ){
			$src['edge'] = $parts[0];
			$src['entity'] = Utils::q( $src['entity'], '' );
			fillChildLists($src, $list, $lists);
		}
	}
}

function fillDynamicSources($lists, $atts){
	foreach($lists['lists'] as $k=>&$v){
		if( $v['stream']['meta'] ){
			fillDynamicSource( $v['stream']['meta'], $atts, $v, $lists );
		}
		if( $v['stream']['sources'] ){
			foreach($v['stream']['sources'] as &$src){
				fillDynamicSource( $src, $atts, $v, $lists );
			}
		}
	}
	return $lists;
}

function printOutput( $output, $translations ){
	if( Utils::$DEV ){
		$scripts = array_map(function($e){ 
			return Utils::$devhost."js/$e";
		}, ['chunk-vendors.js', 'chunk-common.js', 'front.js']);
	
	} else {
		
		$dir = plugin_dir_url(__DIR__);
	$__scripts__ = 'dist/js/chunk-2d0ae5a4.8ca73e43.js,dist/js/chunk-common.6b2e61d9.js,dist/js/chunk-vendors.0523b5f7.js,dist/js/index.52cbe0e4.js';
		
		$scripts = array_map(function($e) use($dir){
			return "{$dir}ui/$e";
		}, array_values(array_filter(explode(',', $__scripts__), function($e){
			return strpos($e, 'chunk-common') !== false || strpos($e, 'chunk-vendors') !== false || strpos($e, 'index') !== false;
		})));
	}
	
	$rest_url = get_rest_url();
	$ajax_url = admin_url('admin-ajax.php');
	
	$output = json_encode($output);
	$scripts = json_encode($scripts);
	$translations = json_encode($translations);
	$platform = Utils::$platform;
	$public_path = plugin_dir_url(__DIR__).'ui/dist/';
	
	$handle = "cs-$platform-front";
	
	wp_register_script($handle, '');
	wp_enqueue_script($handle);
	
	return wp_add_inline_script($handle, <<<CS
			if( !window.csvars ){
				var csvars = {api_url: '$rest_url', ajax_url: '$ajax_url'};
			}
			if( !window.csvars['$platform'] ){
				csvars['$platform'] = {
					apps: {}, 
					instances: [], 
					lists: {},
					translations: $translations,
					public_path: '$public_path'
				};
			}
			(function(){
				var v = $output;
				for(var k in v.apps){
					csvars['$platform'].apps[k] = v.apps[k];
				}
				for(var k in v.lists){
					csvars['$platform'].lists[k] = v.lists[k];
				}
				v.instances.forEach(function(k){
					csvars['$platform'].instances.push(k);
				});
				
				function loadScript(src){
					var script = document.createElement('script');
						script.setAttribute('data-cfasync', 'false');
						script.setAttribute('type', 'text/javascript');
						script.setAttribute('async', 'async');
						script.src = src;
						document.querySelector('body').appendChild(script);
				}
				$scripts.forEach(function(e){
					loadScript(e);
				});
			})();
CS
		);
}
