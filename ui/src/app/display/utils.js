import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const utcToLocal = date => {
	return dayjs.utc(date).local()
};

const urlify = text => {
	if( !text ) return text;
	//const urlRegex = /(https?:\/\/[^\s]+)/g;
	const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
	return text.replace(urlRegex, function(url) {
		return '<a href="' + url + '" target="_blank">' + url + '</a>';
	});
};

const truncateText = ( text, expanded, l=120, i18n ) => {
	text = urlify(text);
	if( text && text.length > l ){
		return {
			text: expanded ? text : `${text.substr(0, l).trim()}...`,
			hint: expanded ? i18n.less : i18n.more
		};
	}
	return {text, hint: null};
};

const Abbrs = {
	max: 999,
	k: 'K',
	m: 'M',
	b: 'B'
};

const numFormat = ( num, abbrs ) => {
	const min = Abbrs.max;
	if(num <= min) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	
	if(num >= 1000000000) {
		num =  (num / 1000000000).toFixed(1).replace(/\.0$/, '') + abbrs.b;
	} else if(num >= 1000000) {
		num =  (num / 1000000).toFixed(1).replace(/\.0$/, '') + abbrs.m;
	} else  if (num >= 1000) {
		num =  (num / 1000).toFixed(1).replace(/\.0$/, '') + abbrs.k;
	}
	
	return num;
};


export {truncateText, numFormat, utcToLocal};
