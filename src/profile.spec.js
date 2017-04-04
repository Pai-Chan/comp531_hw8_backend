/*
 * Test suite for profile.js
 */
const expect = require('chai').expect
const fetch = require('isomorphic-fetch')

const url = path => `http://localhost:3000${path}`

describe('Validate profile functionality', () => {

	it('should get headlines', (done) => {
		// IMPLEMENT ME
		fetch(url('/headlines'))
		.then(res => {
			expect(res.status).to.eql(200)
			return res.json()
		})
		.then(body => {
			expect(body.headlines).to.exist
			expect(body.headlines[0].username).to.eql('Scott')
			expect(body.headlines[0].headline).to.exist
		})
		.then(done)
		.catch(done)
 	}, 200)

	it('should always return a value for /headlines/sampleUser', (done) => {
		// add a new article
		// verify you get the article back with an id
		// verify the content of the article
		// add a second article
		// verify the article id increases by one
		// verify the second artice has the correct content

		const name = 'anyname'
		fetch(url('/headlines/'+name))
		.then(res => {
			expect(res.status).to.eql(200)
			return res.json()
		})
		.then(body => {
			expect(body.headlines).to.exist
			expect(body.headlines[0].username).to.eql(name)
			expect(body.headlines[0].headline).to.exist
		})
		.then(done)
		.catch(done)
 	}, 200)

	it('should updates value in memory for default user, so a GET call returns new value', (done) => {
		// call GET /articles first to find an id, perhaps one at random
		// then call GET /articles/id with the chosen id
		// validate that only one article is returned
		fetch(url('/headlines'))
		.then(res => {
			expect(res.status).to.eql(200)
			return res.json()
		})
		.then(body => {
			expect(body.headlines).to.exist
			expect(body.headlines[0].username).to.eql('Scott')
			expect(body.headlines[0].headline).to.exist
		})
		.then(
			fetch(url('/headline'), {
				method: 'PUT',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({headline: 'happy'})
			}).then(res => {
				expect(res.status).to.eql(200)
				return res.json()
			})
			.then(body => {
				expect(body).to.exist
				expect(body.username).to.eql('Scott')
				expect(body.headline).to.eql('happy')
			})
			.then(
				fetch(url('/headlines'))
				.then(res => {
					expect(res.status).to.eql(200)
					return res.json()
				})
				.then(body => {
					expect(body.headlines).to.exist
					expect(body.headlines[0].username).to.eql('Scott')
					expect(body.headlines[0].headline).to.eql('happy')
				})				
			)
		)
		.then(done)
		.catch(done)
	}, 200)

});