const Sources = {
	'free': {},
	'pro': {}
};

const isDone = () => {
	return Object.keys(Sources.free).length + Object.keys(Sources.pro).length == 6;
}

const handleLoad = (re, p, t) => {
	Sources[t][p] = {
		comments: re.commentStream,
		paths: re.default.filter(e => !e.fields.edge.includes('--'))
	};
	if(isDone()){
		console.log(Sources);
	}
};

for(const t of ['free', 'pro']){
	const ext = t == 'pro' ? 'pro.js' : 'js';
	import(`../app/platforms/youtube/sources/sources.${ext}`).then(re => handleLoad(re, 'youtube', t));
	import(`../app/platforms/twitter/sources/sources.${ext}`).then(re => handleLoad(re, 'twitter', t));
	import(`../app/platforms/facebook/sources/sources.${ext}`).then(re => handleLoad(re, 'facebook', t));
}
