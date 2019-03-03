var cheerio = require('cheerio');
var request = require('request');

request('https://topdev.vn/it-jobs/?q=&cid=&page=1', function(err, resp, body) {
	if (!err) {
		const $ = cheerio.load(body);
		const listJ = $('.job-list').html();
		const item = cheerio.load(listJ);
		item('.job-item').each((index, el) => {
			// console.log(index);
			console.log('------------------------------');
			const jod = cheerio.load(el);
			console.log(jod('.bold-red a').text().trim());
			console.log(jod('.company').text().trim());
			console.log(jod('.salary span').last().text().trim());
			console.log(jod('.location span').last().text().trim());
			jod('.tag-skill').each((index, el) => {
				console.log(cheerio.load(el).text());
			});
		});
	}
});
