var cheerio = require('cheerio');
var rp = require('request-promise');
var uuid = require('uuid');
const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'trace'
});
async function crawler() {
	let listCopany = [];
	for (i = 0; i <= 56; i++) {
		try {
			option = {
				type: 'POST',

				method: 'POST',
				form: {
					lang_search: 'en',
					page_search: i,
					title_search: '',
					location: ''
				},

				headers: {
					'Content-type': 'application/x-www-form-urlencoded'
				}
			};
			const data = await rp('https://www.topitworks.com/vi/company/ajaxlistcompany', option);
			const res = JSON.parse(data);
			const body = res.data;
			const $ = cheerio.load(body);
			await $('.col-xs-12, .col-md-4, .col-sm-6').each(async (index, el) => {
				const jod = cheerio.load(el);
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
	var bulk = [];

	for (i = 0; i <= 175; i++) {
		try {
			console.log('------------------------------------------------', i, listCopany[i]);
			const cp = {};
			cp.companyId = uuid.v1();
			const data = await rp(listCopany[i]);
			const $ = cheerio.load(data);
			const cp_company_name = $('#cp_company_name');
			const company_type = $('.company_type');

			if (cp_company_name.data() !== undefined) {
				console.log(cp_company_name.text());
				cp.name = cp_company_name.text();
			}

			if (company_type.data() !== undefined) {
				console.log(company_type.text());
				cp.companyType = company_type.text();
			}
			console.log('------------technologies--------------');
			if ($('.cp_key_technologies').data() !== undefined) {
				const cp_key_technologies = cheerio.load($('.cp_key_technologies').html());
				let tec = '';
				cp_key_technologies('ul li').each((index, el) => {
					console.log(cheerio.load(el).text());
					tec = tec + ' ' + cheerio.load(el).text();
				});
				cp.technologies = tec;
				console.log(tec);
			}
			console.log('-------------cp_basic_info_details--------------------');
			if ($('.cp_basic_info_details').data() !== undefined) {
				let location = '';
				const cp_basic_info_details = cheerio.load($('.cp_basic_info_details').html());
				cp_basic_info_details('.li-items-limit').each((index, el) => {
					console.log(cheerio.load(el).text());
					location = location + ' ' + cheerio.load(el).text();
				});
				cp.location = location;
			}
			console.log('---------------------------------------');
			console.log(cp);
			// console.log('-------------jod--------------------');
			// const cp_our_job_item = $('.cp_our_job_item');
			// if (cp_our_job_item.data() !== undefined) {
			// 	cp_our_job_item.each((index, el) => {
			// 		const job = cheerio.load(el);
			// 		console.log(job('h4 a').text());
			// 		job('ul li').each((index, el) => {
			// 			console.log(cheerio.load(el).text().trim());
			// 		});
			// 	});
			// }
			bulk.push({
				index: {
					_index: 'job',
					_type: 'company'
				}
			});
			bulk.push(cp);

			//perform bulk indexing of the data passed
		} catch (error) {
			console.log(error);
		}
	}

	client.bulk({ body: bulk }, function(err, response) {
		if (err) {
			console.log('Failed Bulk operation'.red, err);
		} else {
			console.log('Successfully imported %s', bulk.length);
		}
	});
}

crawler();
