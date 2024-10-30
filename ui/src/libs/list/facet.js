const makeFacets = (a, facets) => {
	const fs = Object.create(null);
	
	a.forEach(t => {
		facets.forEach(k => {
			if(Array.isArray(k)){
				let f = fs, ks = [], fl = k.length-1;
				k.forEach((ik, ikx) => {
					ks.push(ik);
					if(!f[ik]) f[ik] = Object.create(null);
					f[ik][t[ik]] = f[ik][t[ik]] || {count: 0};
					f[ik][t[ik]].count++;
											
					f = getDeepProp(fs, ks.map(q => `${q}.${t[q]}`).join('.'));
					if(fl === ikx) (f.items || (f.items=[])).push(t);
				});
			} else {
				if(!fs[k]) fs[k] = Object.create(null);
				fs[k][t[k]] = fs[k][t[k]] || {count: 0};
				fs[k][t[k]].count++;
			}
		});
	});
			
	for(let k in {}){
		fs[k] = Object.entries(fs[k])
			.map(([s, c]) => ({key: k, value: s, count: c}))
			.sort((a, b) => a.value > b.value ? 1 : -1);
	}
			
	return fs;
};
	
const groupBy = (arr, key) => {
	return arr.reduce((g, e) => {
		(g[e[key]] || (g[e[key]]=[])).push(e);
		return g;
	}, Object.create(null));
};

const objToArr = (obj, depth) => {
	return Object.keys(obj).map(k => {
		return ({key: k, values: depth ? objToArr(obj[k], --depth) : obj[k]});
	});
};

const groupLoop = (arr, keys, agg) => {
	const grp = groupBy(arr, keys[0]);
	const rkeys = keys.slice(1);
	
	if(rkeys.length) for(let k in grp) grp[k] = groupLoop(grp[k], rkeys, agg);
	else if(agg) for(let k in grp) grp[k] = agg(grp[k]);
	
	return grp;
};

const group = (arr, keys, agg, as_array) => {
	const re = groupLoop(arr, keys, agg);
	if(as_array) return objToArr(re, keys.length-1);
	return re;
};

export {group, groupBy, objToArr};
