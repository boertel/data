d3.selection.prototype.pluralize = function () {
    console.log(this);
};

var formats = {
    date: d3.time.format("%Y-%m-%d").parse
};

function preformat(books) {
    books.forEach(function (d) {
        d.start_date = formats.date(d.start_date);
        d.end_date = formats.date(d.end_date);
        d.days = (d.end_date - d.start_date) / (1000 * 60 * 60 * 24);
        d.average = d.pages / d.days;
        d.books = 1;
    });

    books.sort(function (a, b) {
        return (a.start_date < b.start_date) ? -1 : 1;
    });
    return books;
}

function update (year, books) {
    var extrems = {
        dates: {
            min: new Date(year + '-01-01'),
            max: new Date(year + '-12-31')
        },
        pages: {
            min: 0,
            max: d3.max(books, function (d) { return d.pages; }) + 1
        }
    };

    x.domain([extrems.dates.min, extrems.dates.max]);
    y.domain([extrems.pages.min, extrems.pages.max]);

    /* Pages numbers and lines */
    // Months abbreviation and lines
    var xDots = xLines.selectAll(".line").data(x.ticks(12), function (d) { return d.getMonth(); })

    xDots.exit()
        .remove()

    xDots.enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + x(d) + ", 0)"; })
        .attr("class", "line")

    xDots
        .append("line")
        .attr("class", function (d, i) { return i == 0 ? " hidden" : ""; })
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", 6)
    xDots.append("text")
        .attr("x", 6)
        .attr("y", 30)
        .text(function (d) {
            return d3.time.format("%b")(d);
        })
    var yDots = yLines.selectAll('.line').data(y.ticks(3), function (d, i) { return d; })

    yDots.exit()
        .remove()

    yDots.enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + 0 + ", " + y(d) + ")"})
        .attr("class", "line")

    yDots
        .append("line")
        .attr("class", "dot")
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("x1", 0)
        .attr("x2", width - padding.right + padding.left/2)
    yDots
        .append("text")
        .attr("x", width - padding.right + padding.left)
        .attr("y", 6)
        .attr("text-anchor", "start")
        .text(function (d, i) { return i == 0 ? "pages" : d; })

    /* Bars */
    var shelf = bars.selectAll('g.shelf').data(window.books, function (d) { return d.title; })

    shelf.exit()
        .remove()

    // add group for each book, positioning the bar on `x`
    shelf.enter().append("g")
        .attr("transform", function (d) { return "translate(" + x(d.start_date) + ", 0)"; })
        .attr("class", function (d) { return "shelf month-" + (d.start_date.getMonth() + 1); })

    // the actual element is a rect and is computing width and height
    var rects = shelf.append("rect")
        .attr("class", "book")
        // need to define values before the transition
        .attr("y", function (d) { return y(0); })
        .attr("height", function (d) { return height - y(0); })

    // and then give them the real value
    rects.transition()
        .duration(300)
        .attr("width", function (d) { return x(d.end_date) - x(d.start_date); })
        .attr("y", function (d) { return y(d.pages); })
        .attr("height", function (d) { return height - y(d.pages); })

    // Interactions
    rects.on('mouseover', function (d) {
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
    })

    pages = new Pages();

    data = {
        books: books.length,
        pages: d3.sum(books, function (d) { return d.pages; }),
        days: d3.sum(books, function (d) { return (d.end_date - d.start_date) / (1000*60*60*24); })
    };

    data.average = data.pages / data.days;

    d3.selectAll(".d3-data").each(showData(data));

}

var data, pages;

function load(year) {
    d3.json("./data/books-" + year + ".json", function (books) {
        window.books = books;
        books = preformat(books);
        update(year, books);
    });
}


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

var x = d3.time.scale()
        .range([0, width - padding.left - padding.right]);
var y = d3.scale.linear()
        .rangeRound([height, 0]);

var yLines = svg.append("g")
    .attr("transform", "translate(0, " + padding.top + ")")
    .attr("class", "lines y")

var xLines = svg.append("g")
    .attr("transform", "translate(" + padding.left + ", " + (height + padding.top) + ")")
    .attr("class", "lines x")

window.books = [];
var bars = svg.append("g")
    .attr("transform", "translate(" + padding.left + ", " + (padding.top + 1) + ")")
    .attr("class", "bars")



/* HTML representation */

function showData(d) {
    return function () {
        var node = d3.select(this),
            attribute = node.attr('data-attribute'),
            pluralize = node.attr('data-pluralize'),
            format = node.attr("data-format") || ".1f";

        if  (pluralize !== null) {
            if (d[attribute] != 1) {
                pluralize += 's';
            }
            node.text(pluralize);
        } else {
            node.text(d3.format(format)(d[attribute]));
        }
    }
}

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
        .attr("transform", function () {
            return "translate(0, " + (y(d.pages) + padding.top) + ")";
        });

    var limit = 0.75,
        max = y(0);
    // define min value so it's not overlapping with "pages" label
    var yValue = y(d.pages) > (max * limit) ? - (y(d.pages) - (max * limit)) : 6;

    this.text.attr("y", yValue);
    this.text.text(d.pages)

    this.start_date.attr("transform", "translate(" + x(d.start_date) + ", 0)")
    this.end_date.attr("transform", "translate(" + x(d.end_date) + ", 0)")
    this.start_dateText
        .attr("x", x(d.start_date) - 5)
        .text(d3.time.format("%b. %d")(d.start_date))

    this.end_dateText
        .attr("x", x(d.end_date) + 5)
        .text(d3.time.format("%b. %d")(d.end_date))

    d3.selectAll(".d3-data").each(showData(d));
};
Pages.prototype.mouseout = function () {
    d3.selectAll(".lines.y g:not(:first-child), .lines.x").style("display", "block")
    this.node.style("display", "none")
    this.range.style("display", "none")

     d3.selectAll(".d3-data").each(showData(data));
};


// cancel/reset click behavior
var clicked = false;
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

// main
load(2014)
