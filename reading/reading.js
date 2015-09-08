var formats = {
    date: d3.time.format("%Y-%m-%d").parse
};

function preformat(books) {
    books.forEach(function (d) {
        d.start_date = formats.date(d.start_date);
        d.end_date = formats.date(d.end_date);
        d.days = (d.end_date - d.start_date) / (1000 * 60 * 60 * 24) + 1;
        d.average = d.pages / d.days;
        d.books = 1;
    });

    books.sort(function (a, b) {
        return (a.start_date < b.start_date) ? -1 : 1;
    });

    return books;
}


function loadJSON(cb) {
    d3.json("./data/books.json", function (books) {
        window.books = books;
        books = preformat(books);
        cb && cb(books);
    });
}

