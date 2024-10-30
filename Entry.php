<?php
namespace csyoutube;

if( !defined( 'ABSPATH' ) )
	die('They dead me.');

use csyoutube\core\Infra;
use csyoutube\utils\Utils;
use csyoutube\platform\Platform;

class Entry{
	function __construct(){
		$this->platform = Platform::$slug;
		$this->Infra = null;
		
		$this->Appts = [];
		$this->outputs = [
			'apps' => [],
			'instances' => [],
			'lists' => []
		];
		
		add_action('admin_menu', [$this, 'addMenu']);
						
		add_shortcode('curator-studio-'.$this->platform, [$this, 'parseShortcode']);
		add_action('wp_footer', [$this, 'printOutput']);
						
		add_action( 'wp_ajax_curator_studio_'.$this->platform, [$this, 'handleAjaxEndpoint']);
		add_action( 'wp_ajax_nopriv_curator_studio_'.$this->platform, [$this, 'handleAjaxEndpoint']);
		
		if( Utils::$DEV || current_user_can('manage_options') ){
			add_action('rest_api_init', [$this, 'registerRestEndpoints']);
			if( Utils::$DEV ){
				add_action('init', function(){
					header("Access-Control-Allow-Origin: *");
				});
			}
		}
	}
	
	static function make(){
		Platform::init();
		$uni = Platform::$slug === 'universe';
		if($uni){
			Platform::entry();
		}
		if(!$uni || (!$uni && Utils::$DEV)) {
			new Entry();
		}
	}
	
	function handleAjaxEndpoint(){
		$this->createInfra();
		$ep = Utils::get($_POST, 'endpoint');
		if( $ep === '/stream/' ) wp_send_json($this->Infra->getStream());
		else if( $ep === '/stream/meta/' ) wp_send_json($this->Infra->getStreamMeta());
		die(0);
	}
	
	function createInfra(){
		$this->Infra = new Infra();
	}
		
	function addMenu(){
		$slug = 'curator-studio';
		$subslug = "curator-studio-{$this->platform}";
		
		global $admin_page_hooks;
		
		if( empty($admin_page_hooks[$slug]) ){
			$hook = add_menu_page(
				'Curator Studio',
				'Curator Studio',
				'manage_options',
				$slug,
				function(){},
				'dashicons-networking'
			);
			
			add_action("load-$hook", function() use($subslug){
				wp_redirect( admin_url("admin.php?page={$subslug}") );
				exit();
			});
		}
				
		$subhook = add_submenu_page(
			$slug,
			Platform::$name,
			Platform::$label,
			'manage_options',
			$subslug,
			[$this, 'printEditorOutput']
		);
		
		add_action("load-$subhook", function(){
			add_action( 'admin_enqueue_scripts', [$this, 'enqueueAdminScripts'] );
		});
 	}
 	
 	function getEditorVars(){
		return json_encode(
			Platform::editorVars()
		);
	}
	
 	function printEditorOutput(){
		$platform = Platform::$name;
		$slug = $this->platform;
		
		echo '
			<style>
				#cs-e-w > div > div > div{padding: 0;}
				#cs-e-w > div > div > div > div{margin: 0;}
			</style>
			<div style="font-size: 16px" id="cs-e-w" class="wrap">
				<h1 class="wp-heading-inline" style="margin-bottom: .5em">'.$platform.'</h1>
				<div id="cs-editor"></div>
			</div>
			<script type="text/javascript">
				var csvars = {
					api_url: "'.get_rest_url().'", 
					'.$slug.':{
						public_path: "'.plugin_dir_url(__FILE__).'ui/dist/"
					}
				};
				var cs_editor_vars = '.$this->getEditorVars().';
			</script>
		';
	}
	
	function enqueueAdminScripts(){
		$platform = Platform::$name;
		$slug = $this->platform;
		
		if( Utils::$DEV ){
			$scripts = array_map(function($e){ 
				return Utils::$devhost."js/$e";
			}, ['chunk-vendors.js', 'chunk-common.js', 'index.js']);
		
		} else {
			
			$dir = plugin_dir_url(__FILE__);
	$__scripts__ = 'dist/js/chunk-2d0ae5a4.8ca73e43.js,dist/js/chunk-common.f71323dd.js,dist/js/chunk-vendors.651762bb.js,dist/js/index.f152c482.js';
			
			$scripts = array_map(function($e) use($dir){
				return "{$dir}ui/$e";
			}, array_values(array_filter(explode(',', $__scripts__), function($e){
				return strpos($e, 'chunk-common') !== false || strpos($e, 'chunk-vendors') !== false || strpos($e, 'index') !== false;
			})));
		}
		
		foreach($scripts as $i=>$s){
			wp_enqueue_script("cs-$platform-script-$i", $s, null, null, true);
		}
	}
	
	function outputError($msg, $data){
		$show = is_user_logged_in() ? 'block' : 'none';
		return '
			<div style="color:red;padding:1em;background:#fff;border:1px dotted;display:'.$show.'">
				<small style="padding:0 .5em;margin:0;background:red;color:#eee;display:inline-block">Admin Only</small>
				<h4 style="margin:0;color:inherit">Curator Studio</h3>
				<p style="margin:0">'. $msg .'</p>
				<script type="text/javascript">
					(window.cserrors || (window.cserrors = [])).push('. json_encode($data) .');
				</script>
			</div>
		';
	}
	
	function parseShortcode( $atts ){
		if( empty($atts['app']) ){
			return $this->outputError('No app specified', $atts);
		}
		
		$this->createInfra();
		if( empty( $this->Appts[ $atts['app'] ] ) ){
			$re = $this->Infra->Store->getAppsById([ $atts['app'] ]);
			
			if( empty($re) ){
				return  $this->outputError('No such app found', $atts);
			}
			
			$this->Appts[ $re[0]['id'] ] = $re[0];
		}
				
		include_once(__DIR__.'/utils/output.php');
		
		$app = $this->Appts[ $atts['app'] ];
		$app['value']['lists'] = \csyoutube\utils\fillDynamicSources(
			$app['value']['lists'], 
			$atts
		);
				
		$subapps = [];
		if( empty( $this->Appts[ $app['value']['dom'] ] ) )
			$subapps[] = $app['value']['dom'];
		if( empty( $this->Appts[ $app['value']['theme'] ] ) )
			$subapps[] = $app['value']['theme'];
		
		$subapps = $this->Infra->Store->getAppsById($subapps);
		foreach($subapps as $sub){
			$this->Appts[ $sub['id'] ] = $sub;
		}
		
		$preload = $this->preloadLists($app);
		
		$this->applyShortcodeAttsToPreloadedList($app, $preload[1], $atts);
		$this->outputs['lists'] = array_merge(
			$this->outputs['lists'],
			$preload[0]
		);
				
		$uid = uniqid('cs-');
		$this->outputs['apps'][ $uid ] = $app;
		$this->outputs['instances'][] = $uid;
		
		foreach($subapps as $s){
			$this->outputs['apps'][ $s['id'] ] = $s;
		}
		
		return '<div id="cs-app-'.$uid.'"></div>';
	}
	
	function generateSchemaOrg($lists, $lids){
		
	}
	
	function applyShortcodeAttsToPreloadedList(&$app, $lid, $atts){
		if( !$lid ) return null;
		
		$viewer = [];
		$override = ['autoplay', 'start', 'preload'];
		
		foreach($override as $o){
			if( isset($atts[$o]) ) $viewer[$o] = $atts[$o];
		}
		
		$app['value']['lists']['lists'][$lid]['list']['viewer'] = array_merge(
			$app['value']['lists']['lists'][$lid]['list']['viewer'],
			$viewer
		);
	}
	
	function preloadLists($app){
		//return [];
		$lists = $app['value']['lists']['lists'];
		$root = $app['value']['lists']['root'];
		
		$nls = [$root => $lists[ $root ]];
		$rlists = [];
		
		$preload_lid = null;
		$meta_lid = null;
		
		while( !empty($nls) ){
			$ls = $nls;
			$nls = [];
			
			foreach($ls as $k=>$l){
				if( !empty($l['items']) || $l['stream']['meta'] ){
					if( $l['stream']['meta'] ){
						$meta_lid = $k;
						$rlists[$k] = $this->Infra->getFreshStreamMeta([
							'stream' => $l['stream']['meta']
						]);
					}
					if( isset($l['items'][0]) ){
						$nls[ $l['items'][0]['child_list'] ] = $lists[ $l['items'][0]['child_list'] ];
					}
				} else {
					$preload_lid = $k;
					$rlists[$k] = $this->Infra->newList()->getFreshStreamItems(
						$l['stream']['sources'],
						$l['list']
					);
				}
			}
		}
		return [$rlists, $preload_lid, $meta_lid];
	}
	
	function printOutput(){
		if( empty( $this->outputs['instances'] ) ) return;
		include_once(__DIR__.'/utils/output.php');
		echo \csyoutube\utils\printOutput(
			$this->outputs,
			$this->Infra->Store->getTranslations()
		);
	}
		
	function getEndPoints(){
		return Utils::apply_filters('register_rest_endpoints', [
			['/lists/merge-list/', 'POST', 'mergeListList'],
			['/lists/change/', 'POST', 'changeLists'],
			['/lists/update/', 'POST', 'updateLists'],
			
			['/editor-data/', 'GET', 'getEditorData'],
			['/apps/', 'GET', 'getApps'],
			['/apps/create/', 'POST', 'createApp'],
			['/apps/remove/', 'POST', 'removeApp'],
			['/apps/update-name/', 'POST', 'updateAppName'],
			['/apps/update-sub-apps/', 'POST', 'updateSubApps'],
			['/apps/upgrade-sub-apps/', 'POST', 'upgradeSubApps'],
			
			['/save-key-value/', 'POST', 'saveKeyValue'],
			['/debug/', 'POST', 'debug'],
			
			['/stream/', 'POST', 'getStream'],
			['/stream/update/', 'POST', 'updateStream'],
			['/stream/meta/', 'POST', 'getStreamMeta'],
			['/stream/update-options/', 'POST', 'updateStreamOptions']	
		]);
	}
					
	function registerRestEndpoints(){
		$namespace = 'curator-studio/'.$this->platform.'/v1';
		$endpoints = $this->getEndPoints();
		$this->createInfra();

		foreach($endpoints as $ep){
			register_rest_route( $namespace, $ep[0], array(
				'methods' => $ep[1],
				'callback' => [$this->Infra, $ep[2]],
				'permission_callback' => function(){
					return true;
				}
			));
		}
		
		if( Utils::$DEV ){
			register_rest_route( $namespace, '/test/', array(
				'methods' => 'GET',
				'callback' => function($req){
					return $this->platform;
				}
			));
		}		
	}
}
