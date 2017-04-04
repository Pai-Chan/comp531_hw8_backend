/*
 * Test suite for articles.js
 */
const expect = require('chai').expect
const fetch = require('isomorphic-fetch')

const url = path => `http://localhost:3000${path}`

describe('Validate Article functionality', () => {

	it('should give me three or more articles', (done) => {
		// IMPLEMENT ME
		fetch(url('/articles'))
		.then(res => {
			expect(res.status).to.eql(200)
			return res.json()
		})
		.then(body => {
			expect(body.articles.length).to.be.at.least(3)
		})
		.then(done)
		.catch(done)
 	}, 200)

	it('should add two articles with successive article ids, and return the article each time', (done) => {
		// add a new article
		// verify you get the article back with an id
		// verify the content of the article
		// add a second article
		// verify the article id increases by one
		// verify the second artice has the correct content

		const text1 = 'Hello World!'
		const text2 = 'Hello World!!!'

		fetch(url('/article'), {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({'text':text1})
		})
		.then(res => {
			expect(res.status).to.eql(200)
			return res.json()
		})
		.then(body => {
			expect(body.articles[0]._id).to.exist
			expect(body.articles[0].text).to.eql(text1)
			return body.articles[0]._id
		})
		.then(prev_id => {
			fetch(url('/article'), {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({'text':text2})				
			})
			.then(res => {
				expect(res.status).to.eql(200)
				return res.json()
			})
			.then(body => {
				expect(body.articles[0]._id).to.eql(prev_id + 1)
				expect(body.articles[0].text).to.eql(text2)
			})
		})
		.then(done)
		.catch(done)
 	}, 200)

	it('should return an article with a specified id', (done) => {
		// call GET /articles first to find an id, perhaps one at random
		// then call GET /articles/id with the chosen id
		// validate that only one article is returned
		fetch(url('/articles'))
		.then(res => {
			expect(res.status).to.eql(200)
			return res.json()
		})
		.then(body => {
			expect(body.articles.length).to.be.at.least(1)
			return body.articles[0]
		})
		.then(article => {
			fetch(url(`/articles/${article._id}`))
			.then(res => {
				expect(res.status).to.eql(200)
				return res.json()
			})
			.then(body => {
				expect(body.articles.length).to.eql(1)
			})
		})
		.then(done)
		.catch(done)
	}, 200)

	it('should return nothing for an invalid id', (done) => {
		// call GET /articles/id where id is not a valid article id, perhaps 0
		// confirm that you get no results
		const invalid_id = -1
		fetch(url(`/articles/${invalid_id}`))
		.then(res => {
			expect(res.status).to.eql(200)
			return res.json()
		})
		.then(body => {
			expect(body.articles.length).to.eql(0)
		})
		.then(done)
		.catch(done)
	}, 200)

});
