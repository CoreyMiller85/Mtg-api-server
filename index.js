const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Card = require("./models/Card");
const app = express();
const axios = require("axios");
const Path = require("path");
const CronJob = require("cron").CronJob;
const fs = require("fs");
const JSONStream = require("JSONStream");
const https = require("https");
const { parse } = require("dotenv");
const cardsRoute = require("./routes/cards");
const authRoutes = require("./routes/authRoutes");
const deckRoutes = require("./routes/deckRoutes");

require("dotenv").config();

let newData = [];

mongoose.connect(
	`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}${process.env.DB_HOST}`,
	{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
	console.log("Connection Open...");
});

app.use(cors());
app.use(express.json());

async function getDownloadURI() {
	// dropCollection();
	console.log("getting uri for download");
	const res = await axios.get("https://api.scryfall.com/bulk-data");
	const downloadURI = res.data.data[2].download_uri;
	downloadCards(downloadURI);
}

async function dropCollection() {
	await db.dropCollection("cards");
}

async function sendToDB() {
	try {
		let toInsert = [];
		for (let i = 0; i < newData.length; i++) {
			toInsert.push(newData[i]);

			const isLastItem = i === newData.length - 1;
			// every 100 items, insert into the database
			if (i % 500 === 0 || isLastItem) {
				await Card.insertMany(toInsert);
				toInsert = [];
			}
		}
		console.log("Data Inserted");
	} catch (err) {
		console.log(err);
	}
}

const downloadCards = async (urlToPrint) => {
	console.log("Before job instantiation");
	var file = fs.createWriteStream("allcards.json");
	https.get(urlToPrint, function (response) {
		response
			.on("data", function (data) {})
			.on("end", function (data) {
				parseCards();
			})
			.pipe(file);
	});
};

const parseCards = async () => {
	console.log("Parsing Cards");
	let count = 0;
	const stream = fs.createReadStream("allcards.json", { encoding: "utf-8" });
	const parser = JSONStream.parse("*");
	stream.pipe(parser);
	parser.on("data", function (obj) {
		newData.push(obj);
		count++;
	});

	parser.on("end", async (val, i) => {
		console.log("parse complete");

		console.log(count + "number of entries");

		sendToDB();
	});
};

// getDownloadURI();

/* ROUTES */

app.get("/", async (req, res) => {
	let limit = Math.abs(req.query.limit) || 10;
	let page = (Math.abs(req.query.page) || 1) - 1;
	const results = await Card.find({ "legalities.standard": "legal" })
		.limit(limit)
		.skip(limit * page);
	res.send(results);
});

app.use("/api/cards", cardsRoute);
app.use("/auth/", authRoutes);
app.use("/decks/", deckRoutes);

app.get("/api/search", async (req, res) => {
	console.log(req.query);
	let dbQuery = await Card.find(
		{ colors: ["G"], colors: ["W"], colors: ["G", "W"] },
		null,
		{ limit: 10 }
	).sort({ name: "DESC" });
	// let dbQuery = await Card.find(req.query, null, {limit: 10})
	res.send(dbQuery);
});

app.listen("3002", () => console.log(`Server listening on port 3002...`));

// const job = new CronJob('0 0 */12 * * *', function() {
// 	const d = new Date();
// 	console.log('Every 12 hours:', d);

// });
// job.start();

// const updateList = async (downloadCards) => {
//   await  downloadCards();
//   await Card.collection.drop();
//   const newList = []
//   const first100 = newData.forEach((item, i, list) => {
//     if (i < 10000) {
//       return newList.push(item)
//     }
//     return
//   })
//   try {
//     const data = await Card.insertMany(newList);
//     await console.log("Data Inserted");
//   } catch (err) {
//     await console.log(err);
//   }
// }

// const printf = (message) => {
//   console.log(message);
// };

// // PAGINATION CODE
// let limit = Math.abs(req.query.limit) || 10;
// let page = (Math.abs(req.query.page) || 1) - 1;
// Schema.find()
//   .limit(limit)
//   .skip(limit * page);
