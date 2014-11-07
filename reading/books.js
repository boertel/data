var formats = {
    date: d3.time.format("%Y-%m-%d").parse
};

d3.json("./data/books-2014.json", function (books) {
    window.books = books;
    books.forEach(function (d) {
        d.start_date = formats.date(d.start_date);
        d.end_date = formats.date(d.end_date);
        d.days = (d.end_date - d.start_date) / (1000 * 60 * 60 * 24);
        d.average = d.pages / d.days;
    });

    books.sort(function (a, b) {
        return (a.start_date < b.start_date) ? -1 : 1;
    });

    var extrems = {
        dates: {
            min: new Date("2014-01-01"),
            max: new Date("2014-12-31")
        },
        pages: {
            min: 0,
            max: d3.max(books, function (d) { return d.pages; }) + 1
        }
    };


    var x = d3.time.scale()
			.domain([extrems.dates.min, extrems.dates.max])
            .range([0, width - padding.left - padding.right]);
        y = d3.scale.linear()
            .domain([extrems.pages.min, extrems.pages.max])
            .rangeRound([height, 0]);


    /* Pages numbers and lines */
    var yLines = svg.append("g")
        .attr("transform", "translate(0, " + padding.top + ")")
        .attr("class", "lines y")
        .selectAll(".lines")
        .data(y.ticks(3))
      .enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + 0 + ", " + y(d) + ")"})
    yLines
        .append("line")
        .attr("class", "dot")
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("x1", 0)
        .attr("x2", width - padding.right + padding.left/2)
    yLines
        .append("text")
        .attr("x", width - padding.right + padding.left)
        .attr("y", 6)
        .attr("text-anchor", "start")
        .text(function (d, i) { return i == 0 ? "pages" : d; })


    /* Bars */
    svg.append("g")
        .attr("transform", "translate(" + padding.left + ", " + (padding.top + 1) + ")")
        .attr("class", "bars")
        .selectAll(".bars")
        .data(window.books)
      .enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + x(d.start_date) + ", 0)"; })
        .attr("class", function (d) { return "month-" + (d.start_date.getMonth() + 1); })
        .append("rect")
        .attr("class", "book")
        .attr("y", function (d) { return y(d.pages); })
        .attr("width", function (d) { return x(d.end_date) - x(d.start_date); })
        .attr("height", function (d) { return height - y(d.pages); })

    /* Months abbreviation and lines */
    var xLines = svg.append("g")
        .attr("transform", "translate(" + padding.left + ", " + (height + padding.top) + ")")
        .attr("class", "lines x")
        .selectAll(".lines")
        .data(x.ticks(12))
      .enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + x(d) + ", 0)"; })

    xLines
        .append("line")
        .attr("class", function (d, i) { return i == 0 ? " hidden" : ""; })
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", 6)

    xLines
        .append("text")
        .attr("x", 6)
        .attr("y", 30)
        .text(function (d) { return d3.time.format("%b")(d); })


    /* HTML representation */
    var data = {
        total_books: books.length,
        total_pages: d3.sum(books, function (d) { return d.pages; }),
        total_days: d3.sum(books, function (d) { return (d.end_date - d.start_date) / (1000*60*60*24); })
    };
    data.average_pages = data.total_pages / data.total_books;
    data.average_days = data.total_days / data.total_books;

    d3.selectAll(".d3-data").each(function () {
        var node = d3.select(this),
            attribute = node.attr("data-attribute"),
            format = node.attr("data-format") || ".1f";

        node.text(d3.format(format)(data[attribute]));
    });

    Pages = function () {
        this.node = svg.append("g")
            .attr("class", "pages")
            .attr("transform", "translate(0, " + (y(0) + padding.top) + ")")

        this.line = this.node.append("line")
            .attr("class", "dot")
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("x1", 0)
            .attr("x2", width - padding.right + padding.left/2)
        this.text = this.node.append("text")
            .attr("x", width - padding.right + padding.left)
            .attr("y", 6)
            .attr("text-anchor", "start")

        this.range = svg.append("g")
            .attr("class", "range")
            .attr("transform", "translate(" + (padding.left) + ", 0)")

        this.start_date = this.range.append("line")
            .attr("class", "start_date")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", height + padding.top + padding.bottom)

        this.end_date = this.range.append("line")
            .attr("class", "end_date")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", height + padding.top + padding.bottom)

        this.start_dateText = this.range.append("text")
            .style("text-anchor", "end")
            .attr("y", height + padding.top + padding.bottom - 6)

        this.end_dateText = this.range.append("text")
            .attr("class", "")
            .style("text-anchor", "start")
            .attr("y", height + padding.top + padding.bottom - 6)

        this.node.style("display", "none");
        this.range.style("display", "none");
    };
    Pages.prototype.mouseover = function (d) {
        d3.selectAll(".lines.y g:not(:first-child), .lines.x").style("display", "none");
        this.node.style("display", "block");
        this.range.style("display", "block");

        this.node
            .transition()
            .duration(750)
            .ease("cubic-out")
            .attr("transform", "translate(0, " + (y(d.pages) + padding.top) + ")")
        this.text.text(d.pages)

        this.start_date.attr("transform", "translate(" + x(d.start_date) + ", 0)")
        this.end_date.attr("transform", "translate(" + x(d.end_date) + ", 0)")
        this.start_dateText
            .attr("x", x(d.start_date) - 5)
            .text(d3.time.format("%b. %d")(d.start_date))

        this.end_dateText
            .attr("x", x(d.end_date) + 5)
            .text(d3.time.format("%b. %d")(d.end_date))

        d3.selectAll(".d3-data").each(function () {
            var node = d3.select(this),
                attribute = node.attr('data-attribute'),
                format = node.attr("data-format") || ".1f";

            node.text(d3.format(format)(d[attribute]));
        });
    };
    Pages.prototype.mouseout = function () {
        d3.selectAll(".lines.y g:not(:first-child), .lines.x").style("display", "block")
        this.node.style("display", "none")
        this.range.style("display", "none")
    };

    var pages = new Pages();

    var clicked = false;

    d3.selectAll(".book")
        .on("mouseover", function (d) {
            var book = d3.select(this);
            book.attr("class", "book active");
            d3.select("#placeholder").style("display", "none");
            d3.select("#book-detail").html("" +
                '<h3 class="title">' + d.title + '</h3>' +
                '<h4 class="info">' +
                "written by<em> " + d.author + " </em>in" +
                "<em> " + d.year + " </em>.</h4>");

            pages.mouseover(d);
        })
        .on("click", function () {
            // disable the mouseleave and re-enable on the click on the body
            clicked = true;
            d3.event.stopPropagation()
        });

    function mouseout () {
        d3.select("#placeholder").style("display", "block");
        d3.select("#book-detail").html("")
        pages.mouseout();
    }

    d3.select("#book-wrapper")
        .on("mouseleave", function () {
            if (!clicked) {
                mouseout();
            }
        })

    d3.select("body")
        .on("click", function () {
            mouseout();
            clicked = false;
        });
});

var margin = {
        top: 20,
        right: 10,
        bottom: 20,
        left: 40
    },
    padding = {
        top: 40,
        right: 40,
        bottom: 70,
        left: 60
    };

var width = 1000 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

var svg = d3.select("#chart-book").append("svg")
    .attr("class","chart-book")
    .attr("width", width + margin.left + margin.right + padding.left + padding.right)
    .attr("height", height + margin.top + margin.bottom + padding.top + padding.bottom)
  .append("g")
    .attr("class", "main")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

svg.append('rect')
    .attr('class', 'click-capture')
    //.style('visibility', 'hidden')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width + margin.left + margin.right + padding.left + padding.right)
    .attr('height', height + margin.top + margin.bottom + padding.top + padding.bottom);
