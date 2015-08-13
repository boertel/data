function list (books) {
    field = 'average';
    var extrems = d3.extent(books, function (d) { return d[field]; });

    var list = d3.select('div#list')

    var book = list.selectAll('books').data(books)
      .enter()
        .append('div')
        .attr('class', 'book')

    book.append('div')
        .attr('class', 'description')
        .html(function (d) { return d.author + ' - ' + d.title; });

    book.append('div')
        .attr('class', 'field ' + field)
        .style('width', function (d) { return Math.floor(d[field] * 100 / extrems[1]) + '%'; })

}

loadJSON(function (books) {
    list(books.reverse());
});
