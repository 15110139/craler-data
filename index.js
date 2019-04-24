var cheerio = require('cheerio')
var rp = require('request-promise')
var uuid = require('uuid')
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/find_job', { useNewUrlParser: true });
const elasticsearch = require('elasticsearch')
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var People = {
	name: String,
	position: String,
	content: [String],
}

var Story = {
	title: String,
	content: [String],

}

var Benefit = {
	title: String,
	description: String,
}

var Company = new Schema({
	_id: String,
	name: String,
	technologies: [String],
	companyType: String,
	location: [String],
	ourPeople: [Object],
	ourStory: [Object],
	benefits: [Object],
	isActive: {
		type: Boolean,
		default: true
	}

});

var CompanyModel = mongoose.model('Company', Company);


const client = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'trace'
})

async function crawlerJob() {

	for (i = 0; i <= 0; i++) {
		try {
			option = {
				type: 'GET',

				method: 'GET',

			}
			const data = await rp('https://www.vietnamworks.com/recruitment-specialist-chuyen-vien-tuyen-dung-2-1090101-jd/?utm_source=company_profile')
			console.log(data)
			const $ = cheerio.load(data)

		} catch (error) {
			console.log('co loi', error)
			break
		}
	}
}

async function crawler() {
	let listCopany = []
	let listCompanytype = []
	for (i = 0; i <= 0; i++) {
		try {
			console.log('hhihi')
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
			}
			const data = await rp('https://www.topitworks.com/vi/company/ajaxlistcompany', option)
			const res = JSON.parse(data)
			const body = res.data
			const $ = cheerio.load(body)
			await $('.col-xs-12, .col-md-4, .col-sm-6').each(async (index, el) => {
				const jod = cheerio.load(el)
				const urlCompany = jod('a').attr('href')
				listCopany.push(urlCompany)
				// await crawlerCompay(urlCompany);
				// });
			})

		} catch (error) {
			console.log('co loi', error)
			break
		}
	}

	console.log(listCopany.length)
	console.log('0k')
	let bulk = []
	let bulkJob = []
	let letListjob = []
	let listLinkjob = []

	for (i = 0; i <= 0; i++) {
		try {
			console.log('------------------------------------------------', i, listCopany[i])
			const cp = {}
			cp._id = uuid.v1()
			const data = await rp(listCopany[i])
			const $ = cheerio.load(data)
			const cp_company_name = $('#cp_company_name')

			const company_type = $('span.company_type')
			if (company_type.data() !== undefined) {
				// console.log(company_type.text())
				cp.company_type = company_type.text()
				// listCompanytype.push(company_type.text())
			}
			// 
			if (cp_company_name.data() !== undefined) {
				// console.log(cp_company_name.text())
				cp.name = cp_company_name.text()
			}

			// cp.company_type = listCompanytype[i]


			console.log('------------technologies--------------')
			if ($('.cp_key_technologies').data() !== undefined) {
				const cp_key_technologies = cheerio.load($('.cp_key_technologies').html())
				let tec = []
				cp_key_technologies('ul li').each((index, el) => {
					// console.log(cheerio.load(el).text())
					tec.push(cheerio.load(el).text())
				})
				cp.technologies = tec
				// console.log(tec)
			}
			// console.log('-------------cp_basic_info_details--------------------')
			// if ($('.cp_basic_info_details').data() !== undefined) {
			// 	let location = ''
			// 	const cp_basic_info_details = cheerio.load($('.cp_basic_info_details').html())
			// 	cp_basic_info_details('.li-items-limit').each((index, el) => {
			// 		console.log(cheerio.load(el).text())
			// 		location = location + ' ' + cheerio.load(el).text()
			// 	})
			// 	cp.location = location
			// }
			const location = []
			console.log('-------------location--------------------')
			if ($('div.cp_address-container').data() !== undefined) {
				const cp_our_office_img = cheerio.load($('div.cp_address-container').html())
				cp_our_office_img('p').each((index, el) => {
					if (cheerio.load(el).text().length > 12) {
						location.push(cheerio.load(el).text())
					}
				})

			}
			cp.location = location
			console.log('-------------ourStory--------------------')
			if ($('div.cp_our_story_container').data() !== undefined) {
				let ourStory = []
				const cp_our_story_container = cheerio.load($('div.cp_our_story_container').html())
				cp_our_story_container('div.cp_story_item_content').each((index, el) => {
					let store = {}
					const cp_story_item_content = cheerio.load(el)
					// console.log(cp_story_item_content('h2').text())
					store.title = cp_story_item_content('h2').text()
					let content = []
					const custom_story_item_content = cheerio.load(cp_story_item_content('div').html())
					custom_story_item_content('p').each((index, elp) => {
						if (cheerio.load(elp).text().length > 45 && cheerio.load(elp).text() !== "                                            ") {
							// console.log(cheerio.load(elp).text())
							content.push(cheerio.load(elp).text())
						}
					})
					store.content = content
					// console.log(store)
					ourStory.push(store)
				})
				// console.log(ourStory)
				cp.ourStory = ourStory
			}
			console.log('-------------People--------------------')
			if ($('div.cp_our_people_container').data() !== undefined) {
				// console.log('hih')
				let ourPeople = []
				const cp_our_people_container = cheerio.load($('div.cp_our_people_container').html())
				cp_our_people_container('div.cp_our_people_item_content').each((index, el) => {
					console.log(index)
					let people = {}
					const cp_our_people_item_content = cheerio.load(el)
					// console.log(cp_story_item_content('h2').text())
					people.name = cp_our_people_item_content('h2').text()
					people.position = cp_our_people_item_content('h3').text()

					let content = []
					const custom_people_item_content = cheerio.load(cp_our_people_item_content('div').html())
					custom_people_item_content('p').each((index, elp) => {
						if (cheerio.load(elp).text().length > 45 && cheerio.load(elp).text() !== "                                            ") {
							// console.log(cheerio.load(elp).text())
							content.push(cheerio.load(elp).text())
						}
					})
					people.content = content
					// console.log(people)
					ourPeople.push(people)
				})
				// console.log(ourPeople)
				cp.ourPeople = ourPeople

			}
			console.log('-------------Benefits--------------------')

			if ($('div.cp_our_benefits_container').data() !== undefined) {
				let benefits = []
				const cp_our_benefits_container = cheerio.load($('div.cp_our_benefits_container').html())
				cp_our_benefits_container('div.cp_our_benefit_item_container').each((index, el) => {
					// console.log(index)
					let benefit = {}
					const cp_our_benefit_item_container = cheerio.load(el)
					// console.log(cp_story_item_content('h2').text())
					benefit.title = cp_our_benefit_item_container('div.cp_benefit_name h3').text()
					benefit.description = cp_our_benefit_item_container('div.cp_benefit_description p').text()

					// let content = []
					// const custom_people_item_content = cheerio.load(cp_our_benefit_item_container('div').html())
					// custom_people_item_content('p').each((index, elp) => {
					// 	if (cheerio.load(elp).text().length > 45 && cheerio.load(elp).text() !== "                                            ") {
					// 		// console.log(cheerio.load(elp).text())
					// 		content.push(cheerio.load(elp).text())
					// 	}
					// })
					// people.content = content
					// console.log(benefit)
					benefits.push(benefit)
				})
				cp.benefits = benefits
				// console.log(benefit)
			}

			console.log('-------------jod--------------------')
			const cp_our_job_item = $('.cp_our_job_item')
			if (cp_our_job_item.data() !== undefined) {
				const listJob = []
				cp_our_job_item.each((index, el) => {
					const job = cheerio.load(el)
					const jobD = {}

					// console.log(job('h4 a').text())
					jobD.name = job('h4 a').text()
					listLinkjob.push(job('h4 a').attr('href'))
					jobD.companyId = cp._id
					jobD.jobId = uuid.v1()
					job('ul li').each((index, el) => {
						// console.log('index', index)
						// console.log(cheerio.load(el).text().trim())'
						if (index === 0) {
							jobD.position = cheerio.load(el).text().trim()
						}
						if (index === 1) {
							jobD.location = cheerio.load(el).text().trim()
						}
						if (index === 2) {
							jobD.datePost = cheerio.load(el).text().trim()
						}
					})

					// console.log('---------1-----')
					// console.log(jobD)
					letListjob.push(jobD)
					// bulkJob.push({
					// 	index: {
					// 		_index: 'data_job',
					// 		_type: 'job'
					// 	}
					// })
					// bulkJob.push(jobD)
					// listJob.push(jobD)
				})

				// console.log('listJob', listJob)
			}
			// console.log(cp)
			await CompanyModel.create({ ...cp })
			// bulk.push({
			// 	index: {
			// 		_index: 'data_job',
			// 		_type: 'company'
			// 	}
			// })
			// bulk.push(cp)
			// console.log("job")
			// client.bulk({ body: bulkJob }, function (err, response) {
			// 	if (err) {
			// 		console.log('Failed Bulk operation'.red, err)
			// 	} else {
			// 		console.log('Successfully imported %s', bulk.length)
			// 	}
			// })
			console.log("end")

		} catch (error) {
			console.log(error)
		}

		for (let j = 0; j <= 0; j++) {
			console.log(listLinkjob[j])
			let link = listLinkjob[j]
			let newString = link.replace('www.topitworks.com/en/job','www.vietnamworks.com')
			console.log(newString)
			newString = newString.replace('?utm_source=company_profile','-jd/?utm_source=company_profile')
			console.log(newString)
			try {
				option = {
					type: 'GET',

					method: 'GET',

				}

				const data = await rp(newString)
				console.log(data)
				const $ = cheerio.load(data)

			} catch (error) {
				console.log('co loi')
				break
			}
		}


		// console.log("company")
		// client.bulk({ body: bulk }, function (err, response) {
		// 	//perform bulk indeing of the data passed
		// 	if (err) {
		// 		console.log('Failed Bulk operation'.red, err)
		// 	} else {
		// 		console.log('Successfully imported %s', bulk.length)
		// 	}
		// })
	}
}

// crawlerJob()
crawler()
