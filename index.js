var cheerio = require('cheerio')
var rp = require('request-promise')
var uuid = require('uuid')
var mongoose = require('mongoose');
var moment = require('moment')
mongoose.connect('mongodb://localhost/find_job', { useNewUrlParser: true });
// const elasticsearch = require('elasticsearch')
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Skill = new Schema({
	id: String,
	name: String
})
var Job = new Schema({
	id: String,
	company: Object,
	benefit: [String],
	desc: [String],
	require: [String],
	name: String,
	skill: [String],
	created_at: Number,
	salary: Object,
	jobCategory: [String],
	isActive: {
		type: Boolean,
		default: true
	}
})
var Company = new Schema({
	id: String,
	name: String,
	urlLogo: String,
	technologies: [String],
	companyType: String,
	address: [String],
	location: [Object],
	ourPeople: [Object],
	ourStory: [Object],
	benefits: [Object],
	isActive: {
		type: Boolean,
		default: true
	}

});
const STRINGHH = ["Ha Noi", "HN", "Hà Nội", "HA NOI", "HÀ NỘI",]
const STRINGHCM = ["Ho Chi Minh", "HCM", "Hồ Chí Minh", "HO CHI MINH", "HỒ CHÍ MINH", "TPHCM"]
const STRINGDANANG = ["Da Nang", "DN", "Đà Nẵng", "DA NANG", "ĐÀ NẴNG"]
const STRINGCANTHO = ["Can Tho", "CT", "Cần Thơ", "CAN THO", "CẦN THƠ"]
const STRINGBINHDUONG = ["Binh Duong", "DB", "Bình Dương", "BINH DUONG", "BÌNH DƯƠNG"]

var Location = new Schema({
	id: String,
	name: String
})
var LocationModel = mongoose.model('Location', Location)
var JobModel = mongoose.model('Job', Job)
var CompanyModel = mongoose.model('Company', Company);
var SkillModel = mongoose.model('Skill', Skill)




// const client = new elasticsearch.Client({
// 	host: 'localhost:9200',
// })

// client.indices.create({
// 	index: 'company'
// }, function (err, resp, status) {
// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log("create", resp);
// 	}
// });


// client.indices.create({
// 	index: 'job'
// }, function (err, resp, status) {
// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log("create", resp);
// 	}
// });


async function crawler() {
	const objectHaNoi = await LocationModel.create({ id: "location_" + uuid.v1(), name: "Hà Nội" })
	const objectDaNang = await LocationModel.create({ id: "location_" + uuid.v1(), name: "Đà Nẵng" })
	const objectBinhHDuong = await LocationModel.create({ id: "location_" + uuid.v1(), name: "Bình Dương" })
	const objectHoChiMinh = await LocationModel.create({ id: "location_" + uuid.v1(), name: "Hồ Chí Minh" })
	const objectCanTho = await LocationModel.create({ id: "location_" + uuid.v1(), name: "Cần Thơ" })
	const objectOther = await LocationModel.create({ id: "location_" + uuid.v1(), name: "Other" })


	let listCopany = []
	let allKill = []
	for (i = 0; i <= 20; i++) {
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
	let letListjob = []
	let listLinkjob = []

	for (i = 0; i <= 120; i++) {
		try {
			console.log('------------------------------------------------', i, listCopany[i])
			const cp = {}
			cp.id = "company_" + uuid.v1()
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


			console.log('------------logo--------------')
			if ($('div.cp_logo').data() !== undefined) {
				console.log($('.cp_logo div img').attr('src'))

				cp.urlLogo = $('.cp_logo div img').attr('src')
			}

			// cp.company_type = listCompanytype[i]


			console.log('------------technologies--------------')
			if ($('.cp_key_technologies').data() !== undefined) {
				const cp_key_technologies = cheerio.load($('.cp_key_technologies').html())
				let tec = []
				cp_key_technologies('ul li').each((index, el) => {
					// console.log(cheerio.load(el).text())
					tec.push(cheerio.load(el).text().trim())
				})
				cp.technologies = tec
				// console.log(tec)
			}
			let location = []
			console.log('-------------cp_basic_info_details--------------------')
			if ($('.cp_basic_info_details').data() !== undefined) {
				const cp_basic_info_details = cheerio.load($('.cp_basic_info_details').html())
				cp_basic_info_details('.li-items-limit').each((index, el) => {
					if (index === 0) {
						console.log(cheerio.load(el).text())
						const textLocation = cheerio.load(el).text()
						let listLocation = textLocation.split(",")
						console.log(listLocation)
						for (let v = 0; v < listLocation.length; v++) {
							if (STRINGHH.includes(listLocation[v].trim())) {
								location.push(objectHaNoi)
							}
							if (STRINGDANANG.includes(listLocation[v].trim())) {
								location.push(objectDaNang)
							}
							if (STRINGBINHDUONG.includes(listLocation[v].trim())) {
								location.push(objectBinhHDuong)
							}
							if (STRINGHCM.includes(listLocation[v].trim())) {
								location.push(objectHoChiMinh)
							}
							if (STRINGCANTHO.includes(listLocation[v].trim())) {
								location.push(objectCanTho)
							}
						}
					}
				})
			}
			cp.location = location
			const address = []
			console.log('-------------location--------------------')
			if ($('div.cp_address-container').data() !== undefined) {
				const cp_our_office_img = cheerio.load($('div.cp_address-container').html())
				cp_our_office_img('p').each((index, el) => {
					if (cheerio.load(el).text().length > 12) {
						address.push(cheerio.load(el).text())
					}
				})

			}
			cp.address = address
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
					let people = {}
					const cp_our_people_item_content = cheerio.load(el)
					// console.log(cp_story_item_content('h2').text())
					people.name = cp_our_people_item_content('h2').text().trim()
					people.position = cp_our_people_item_content('h3').text().trim()

					let content = []
					const custom_people_item_content = cheerio.load(cp_our_people_item_content('div').html())
					custom_people_item_content('p').each((index, elp) => {
						if (cheerio.load(elp).text().length > 45 && cheerio.load(elp).text() !== "                                            ") {
							// console.log(cheerio.load(elp).text())
							content.push(cheerio.load(elp).text().trim())
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
					benefit.description = cp_our_benefit_item_container('div.cp_benefit_description p').text().trim()

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
					const jobD = {
						company: {
							id: cp.id,
							name: cp.name,
							avatar: cp.urlLogo
						}
					}

					// console.log(job('h4 a').text())
					jobD.name = job('h4 a').text()
					listLinkjob.push(job('h4 a').attr('href'))
					jobD.id = 'job_' + uuid.v1()
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
					letListjob.push(jobD)

					// console.log('---------1-----')
					// console.log(jobD)
					// bulkJob.push({
					// 	index: {
					// 		_index: 'data_job',
					// 		_type: 'job'
					// 	}
					// })
					// bulkJob.push(jobD)
				})

				// console.log('listJob', listJob)
			}
			// console.log(cp)
			await CompanyModel.create({ ...cp })

			cp.companyId = cp.id
			delete cp.id

			// await client.index({
			// 	index: 'company',
			// 	id: cp.companyId,
			// 	type: 'company',
			// 	body: { ...cp }
			// }, function (err, resp, status) {
			// 	console.log(resp);
			// });
			// bulk.push({
			// 	index: {
			// 		_index: 'data_job',
			// 		_type: 'company',
			// 	}
			// })
			// cp.companyId = cp.id
			// delete cp.id
			// bulk.push(cp)
			// console.log(cp)

		} catch (error) {
			console.log(error)
		}
	}
	// console.log("bulkCompany")
	// await client.bulk({ body: bulk }, function (err, response) {
	// 	//perform bulk indeing of the data passed
	// 	if (err) {
	// 		console.log('Failed Bulk operation', err)
	// 	} else {
	// 		console.log('Successfully imported %s', bulk.length)
	// 	}
	// })

	for (let j = 0; j < listLinkjob.length; j++) {
		console.log("----------------------------------job ----- detail ---------------------------------")
		let link = listLinkjob[j]
		console.log("link", link)
		let newString = link.replace('www.topitworks.com/en/job', 'www.vietnamworks.com')
		newString = newString.replace('?utm_source=company_profile', '-jd/?utm_source=company_profile')
		try {
			option = {
				method: 'GET',
				headers: {
					'Cookie': 'lang=2; suggest_course_ab_testing_reset=6; suggest_course_ab_testing=B; user_on_board_ab_testing_reset=3; user_on_board_ab_testing=A; _gcl_au=1.1.1414326183.1556198415; _fbp=fb.1.1556198415886.1820782094; __utmv=136564663.|1=Job%20Detail%20Display=VB=1; VNW128450527232960=bs%2Bd1JzZyseKkHuLcMqd05uunJqIiqqIcJub03CnzZRaknmGaqKj; VNWJSAll128450527232960=bs%2Bd1JzZyseKkHuLcMqd05uunJqIiqqIcJub03CnzZRaknmGaqKj%7Cvffj1r014i1ak30ifrrrnmvg32; VNWWS128450527232960=ksCzoYanust0oJiGh%2BO024bisspz05W%2Fkr3O1oanus9zi5G%2Bhpuv5pK50M10ra%2B%2Fhq2754bvvdx1rZyKktOzoYfMvdmArZSJhuOs14fJ0Mp%2F06qHiLrmu6K%2BmK9tr7Cva7rhu7K%2Bm69YrsGvkLacx4zL06%2BgmnekfavXu4%2FH1a%2BQxa%2Bks77iyIzCm6%2BTr7GwgLPVu2rD07CgxHmwjbLhvIzZ1a%2BgwL6wfczkx4k%3D; VNW_WS_COOKIE=ksCzoYanust0oJiGh%2BO024bisspz05W%2Fkr3O1oanus9zi5G%2Bhpuv5pK50M10ra%2B%2Fhq2754bvvdx1rZyKktOzoYfMvdmArZSJhuOs14fJ0Mp%2F06qHiLrmu6K%2BmK9tr7Cva7rhu7K%2Bm69YrsGvkLacx4zL06%2BgmnekfavXu4%2FH1a%2BQxa%2Bks77iyIzCm6%2BTr7GwgLPVu2rD07CgxHmwjbLhvIzZ1a%2BgwL6wfczkx4k%3D; VNW_USER_COOKIE=bs%2Bd1JzZyseKkHuLcMqd05uunJqIiqqIcJub03CnzZRaknmGaqKj; PHPSESSID=11fit25fh06rm5v9mv72ub9ad7; VNW_LAST_JOB_SEEN=1090101%2C4920199; __utma=136564663.492321141.1556198415.1556198415.1556387230.2; __utmc=136564663; __utmz=136564663.1556387230.2.2.utmcsr=company_profile|utmccn=(not%20set)|utmcmd=(not%20set); FIREBASE_JWT=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJ2aWV0bmFtd29ya3MtbWVzc2FnZUB2aWV0bmFtd29ya3MtbWVzc2FnZS5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6InZpZXRuYW13b3Jrcy1tZXNzYWdlQHZpZXRuYW13b3Jrcy1tZXNzYWdlLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwiYXVkIjoiaHR0cHM6XC9cL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbVwvZ29vZ2xlLmlkZW50aXR5LmlkZW50aXR5dG9vbGtpdC52MS5JZGVudGl0eVRvb2xraXQiLCJpYXQiOjE1NTYzODcyMzMsImV4cCI6MTU1NjM5MDgzMywidWlkIjo0OTIwMTk5fQ.GNZPQNp-hG65FxcYFyJd8zGJ2P05tUacevRRL38TUnQS8Nm62883H9LdMtHbvAvg2Q_vbTufKPLBuDnBqZ3wnCkGdSSaXDRwoqael3IfPMrdwOv0YbDj8XhN3KRjrVx5soIGlDbZ3ybyN8J_t2olnJvstHAezyis86CzkTftIy4YpOk88ZpA5FZEir-Aj2kQK8b4RdK-uk0uHlJNAXa6-r2kgCswltOIas8q5AGpktZBmUQHgYsUHyaWEl82tSsRjlOCN2bgHONIXwI0YrT6Ha-1KjhAizazVhARivRDHrQ1DlvxmJ_5nTXFStNyIDM7xjm7u8KmkHEXX32tervI3w; __utmt=1; __utmb=136564663.5.10.1556387230'
				},

			}
			letListjob[j].benefit = null
			let benefit = []
			const data = await rp(newString, option)
			// console.log(data)
			const $ = cheerio.load(data)
			if ($('div.benefits').data() !== undefined) {
				const benefits = cheerio.load($('div.benefits').html())
				benefits('div.benefit').each((index, el) => {
					const el_che = cheerio.load(el)
					benefit.push(el_che('div.benefit-name').text().trim())
				})
			}
			letListjob[j].salary = {
				from: (Math.floor(Math.random() * 5) + 1) * 100,
				to: (Math.floor(Math.random() * 5) + 7) * 100,
				currency: 'USD'
			}
			// letListjob[j].salary = 'Negotiable'
			// if ($('span.salary').data() !== undefined) {
			// 	letListjob[j].salary = $('span.salary').text().trim()

			// }
			letListjob[j].benefit = benefit
			letListjob[j].require = []
			if ($('div.requirements').data() !== undefined) {
				const requirements = cheerio.load($('div.requirements').html())
				// console.log(requirements.text())
				const stringRequire = requirements.text().trim()
				letListjob[j].require = stringRequire.split(`\n`)
			}
			letListjob[j].desc = []
			if ($('div.description').data() !== undefined) {
				const description = cheerio.load($('div.description').html())
				// console.log(requirements.text())
				const descString = description.text().trim()
				letListjob[j].desc = descString.split(`\n`)
			}
			letListjob[j].skill = []
			letListjob[j].jobCategory = []

			if (
				$('div.box-summary').data() !== undefined
			) {
				const sumary = cheerio.load($('div.box-summary').html())
				sumary('div.summary-item').each((index, el) => {
					const el_post = cheerio.load(el)
					if (index == 0) {
						console.log(el_post('div.summary-content span.content').text().trim())
						letListjob[j].created_at = moment(el_post('div.summary-content span.content').text().trim(), 'DD/MM/YYYY').valueOf()
					}
					if (index == 2) {
						console.log(el_post('div.summary-content span.content').text().trim())
						const stringjobCategory = el_post('div.summary-content span.content').text().trim()
						letListjob[j].jobCategory = stringjobCategory.split(',')
					}
					if (index == 3) {
						console.log(el_post('div.summary-content span.content').text().trim())
						const stringSkill = el_post('div.summary-content span.content').text().trim()
						const arrskll = stringSkill.split(',')

						letListjob[j].skill = arrskll
						allKill = [...allKill, ...arrskll]
					}
				})
			}
			// skill_tags('a').each((index,el)=>{
			// 	console.log(index)
			// 	console.log(el.text())
			// })
			await JobModel.create({ ...letListjob[j] })
			letListjob[j].jobId = letListjob[j].id
			delete letListjob[j].id

			// await client.index({
			// 	index: 'job',
			// 	id: letListjob[j].jobId,
			// 	type: 'job',
			// 	body: {
			// 		...letListjob[j]
			// 	}
			// }, function (err, resp, status) {
			// 	console.log(resp);
			// });
			// bulkJob.push({
			// 	index: {
			// 		_index: 'data_job',
			// 		_type: 'job',
			// 	}
			// })
			// letListjob[j].jobId = letListjob[j].id
			// delete letListjob[j].id
			// bulkJob.push(letListjob[j])
			// console.log(letListjob[j])


		} catch (error) {
			console.log('co loi', error)
			break
		}
	}



	// console.log("bulkJob")
	// await client.bulk({ body: bulkJob }, function (err, response) {
	// 	if (err) {
	// 		console.log('Failed Bulk operation', err)
	// 	} else {
	// 		console.log('Successfully imported %s', bulk.length)
	// 	}
	// })

	let skillChoose = []
	let newList = []
	for (m = 0; m < allKill.length; m++) {
		newList.push(allKill[m].trim())
	}
	for (let o = 0; o < newList.length; o++) {
		try {
			console.log("---------------All---skilll--------------------------")
			if (!skillChoose.includes(newList[o])) {
				skillChoose.push(newList[o])
				await SkillModel.create({ id: 'skill_' + uuid.v1(), name: newList[o] })
			}
		} catch (error) {
			console.log('hihi')
		}
	}
	console.log("----------------------end----------------------------------")
}

// crawlerJob()
crawler()
