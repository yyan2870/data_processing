const fs = require("fs");
const csvParser = require("csv-parser");
const mysql = require("mysql");

const books = [];
const recordFromRecommendation = [];
const sharedBooks = [];

/*
bookID,
title,
authors,
average_rating,
isbn,
language_code,
num_pages,

ratings_count,
text_reviews_count,
isbn13,


publication_date,
publisher
imageURL

*/


fs.createReadStream("books.csv")
  .pipe(csvParser())
  .on("data", (data) => {
    books.push(data);
  })
  .on("end", () => {
    console.log(books);
  });

fs.createReadStream("Books_recommendation.csv")
  .pipe(csvParser())
  .on("data", (data) => {
    recordFromRecommendation.push(data);
  })
  .on("end", () => {
    console.log(recordFromRecommendation);

    const len = recordFromRecommendation.length;


    for(let i =0; i<len; i++) {
      const isbn = recordFromRecommendation[i].ISBN;

      const foundBook = books.find(b => b.isbn === isbn);

      if (foundBook) {
        
        //remove ratings_count,
        //text_reviews_count,
        //isbn13,
        delete foundBook.ratings_count;
        delete foundBook.text_reviews_count;
        delete foundBook.isbn13;
        foundBook.imageURL = recordFromRecommendation[i]["Image-URL-M"];

        sharedBooks.push(foundBook);
      }
    }

    const valuesToWrite = sharedBooks.map(sb => [sb.title, sb.authors, sb.average_rating,
       sb.isbn, sb.language_code, sb.num_pages, 
       sb.publication_date, sb.publisher, sb.imageURL 
      ]);
    console.log(valuesToWrite);

    writeDataToMysql(valuesToWrite);

  });


const writeDataToMysql = (values) => {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "bookManagement"
  });

  connection.connect(function(err) {
    if (err) throw err;
    console.log("Mysql db Connected!");
	/*let sql = "CREATE TABLE books (id INT AUTO_INCREMENT PRIMARY KEY, \
	title VARCHAR(255), \
	authors VARCHAR(255), \
	average_rating float, \
	isbn VARCHAR(10), \
	language_code VARCHAR(10), \
	num_pages int, \
	publication_date VARCHAR(10), \
	publisher VARCHAR(255), \
	imageURL VARCHAR(255))";
		
	connection.query(sql, function (err, result) {
    if (err) throw err;
		console.log("books Table created");
	});*/
	
    const sql = "INSERT INTO books (title, authors, average_rating, isbn, language_code, num_pages, publication_date, publisher, imageURL) VALUES ?";
    connection.query(sql, [values], function (err, result) {
      if (err) throw err;
      console.log("Number of records inserted: " + result.affectedRows);
    });
  });
} 

  

