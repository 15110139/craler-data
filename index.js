var cheerio = require('cheerio');
var rp = require('request-promise');

async function crawler() {
	let listCopany = [];
	for (i = 0; i <= 0; i++) {
		try {
			option = {
				type: 'POST',

				method: 'POST',
				form: {
					lang_search: 'en',
					page_search: i,
					title_search: '',
					location: '',
				},

				headers: {
					'Content-type': 'application/x-www-form-urlencoded',
				},
			};
			const data = await rp('https://www.topitworks.com/vi/company/ajaxlistcompany', option);
			const res = JSON.parse(data);
			const body = res.data;
			const totalPage = res.totalPage;
			const currentPage = res.currentPage;
			const $ = cheerio.load(body);
			await $('.col-xs-12, .col-md-4, .col-sm-6').each(async (index, el) => {
				const jod = cheerio.load(el);
				console.log(jod('a').attr('href'));
				const urlCompany = jod('a').attr('href');
				listCopany.push(urlCompany);
				// await crawlerCompay(urlCompany);
				// });
			});
		} catch (error) {
			console.log('co loi');
			break;
		}
	}

	console.log(listCopany.length);
	console.log('0k');

	for (i = 11; i <= 11; i++) {
		try {
			console.log('------------------------------------------------', i, listCopany[i]);
			const data = await rp(listCopany[i]);
			const $ = cheerio.load(data);
			const cp_company_name = $('#cp_company_name');
			console.log(cp_company_name);
			console.log(cp_company_name.text());
			const company_type = $('.company_type');
			if (company_type.data() !== undefined) {
				console.log(company_type.text());
			}
			console.log('------------technologies--------------');
			if ($('.cp_key_technologies').data() !== undefined) {
				const cp_key_technologies = cheerio.load($('.cp_key_technologies').html());
				cp_key_technologies('ul li').each((index, el) => {
					console.log(cheerio.load(el).text());
				});
			}
			console.log('-------------cp_basic_info_details--------------------');
			if ($('.cp_basic_info_details').data() !== undefined) {
				const cp_basic_info_details = cheerio.load($('.cp_basic_info_details').html());
				cp_basic_info_details('.li-items-limit').each((index, el) => {
					console.log(cheerio.load(el).text());
				});
			}
			console.log('-------------jod--------------------');
			const cp_our_job_item = $('.cp_our_job_item');
			if (cp_our_job_item.data() !== undefined) {
				cp_our_job_item.each((index, el) => {
					const job = cheerio.load(el);
					console.log(job('h4 a').text());
					job('ul li').each((index, el) => {
						console.log(cheerio.load(el).text().trim());
					});
				});
			}
		} catch (error) {
			console.log(error);
		}
	}

	// let page = 0;
	// const option = {
	// 	url: 'https://www.topitworks.com/vi/company/ajaxlistcompany',
	// 	type: 'POST',

	// 	method: 'POST',
	// 	form: {
	// 		lang_search: 'en',
	// 		page_search: 2,
	// 		title_search: '',
	// 		location: '',
	// 	},

	// 	headers: {
	// 		'Content-type': 'application/x-www-form-urlencoded',
	// 	},
	// };
	// while (true) {
	// 	try {
	// 		const data = await rp(option);
	// 		const res = JSON.parse(data);
	// 		const body = res.data;
	// 		const totalPage = res.totalPage;
	// 		const currentPage = res.currentPage;
	// 		const $ = cheerio.load(body);
	// 		await $('.col-xs-12, .col-md-4, .col-sm-6').each(async (index, el) => {
	// 			console.log(index);
	// 			const jod = cheerio.load(el);
	// 			console.log(jod('a').attr('href'));
	// 			const urlCompany = jod('a').attr('href');
	// 			// await crawlerCompay(urlCompany);
	// 			// });
	// 		});
	// 		page = page + 1;
	// 		// console.log('page', page);
	// 	} catch (error) {
	// 		console.log(error);
	// 		break;
	// 	}
	// }
}

async function crawlerCompay(urlCompany) {
	try {
		const chirdboyd = await rp(urlCompany);
		console.log(chirdboyd);
	} catch (error) {
		throw error;
	}
}

crawler();
