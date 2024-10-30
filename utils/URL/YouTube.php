<?php
namespace csyoutube\utils\URL;

if( !defined( 'ABSPATH' ) )
	die('They dead me.');

class YouTube{
	static function videoId( $str ){
		if( strlen(trim($str)) === 11 ) return trim($str);
		// From some stackoverflow answer
		preg_match("/^(?:http(?:s)?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?v(?:i)?=|(?:embed|v|vi|user)\/))([^\?&\"'>]+)/", $str, $matches);
		if( sizeof($matches) ) return $matches[1];
		return '';
	}
	
	static function playlistId( $str ){
		$str = str_replace('amp;', '&', $str);
		parse_str(parse_url($str, PHP_URL_QUERY), $query);
		if( isset($query['list']) ) return $query['list'];
		return $str;
	}
	
	static function channelId( $str ){
		$channel = explode('/channel/', parse_url($str, PHP_URL_PATH));
		if( sizeof($channel) < 2 ) return $str;
		$channel = explode('/', $channel[1]);
		return $channel[0];
	}
}
