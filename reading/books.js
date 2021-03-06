d3.selection.prototype.pluralize = function () {
    console.log(this);
};


var COLORS = {
  2014: '#ACC7B4',
  2015: '#331B3F',
  2016: '#F5D042',
  2017: '#CED46A',
  2018: '#07553B',
  2019: '#6A7BA2',
  2020: '#2C5F2D',
  2021: '#ADEFD1',
  2022: '#DDA94B',
  2023: '#A4193D',
  2024: '#815854',
}


function update(books, year) {
    var extrems = {
        dates: {
            min: year ? new Date(year + '-01-01') : books[0].start_date,
            max: year ? new Date(year + '-12-31') : books[books.length - 1].end_date,
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
    var xDots = xLines.selectAll(".line").data(x.ticks(12), function (d) { return d.getFullYear(); })

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
            return d3.time.format("%Y")(d);
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
        .attr("x2", width)
    yDots
        .append("text")
        .attr("x", width - 30)
        .attr("y", function (d, i) { return i === 0 ? -10 : -5})
        .attr("text-anchor", "end")
        .text(function (d, i) { return i == 0 ? "pages" : d; })

    /* Bars */
    var shelf = bars.selectAll('g.shelf').data(books, function (d) { return d.title; })

    shelf.exit()
        .remove()

    // add group for each book, positioning the bar on `x`
    shelf.enter().append("g")
        .attr("transform", function (d) { return "translate(" + x(d.start_date) + ", 0)"; })
        .attr("class", function (d) { return "shelf month-" + (d.start_date.getMonth() + 1); })

    // the actual element is a rect and is computing width and height
    var rects = shelf.append("rect")
        .attr("class", "book")
        .attr('fill', function (d) { return COLORS[d.start_date.getFullYear()]; })
        // need to define values before the transition
        .attr("y", function (d) { return y(0); })
        .attr("height", function (d) { return height - y(0); })

    // and then give them the real value
    rects.transition()
        .duration(300)
        .attr("width", function (d) {
            var end_date = new Date(d.end_date.getTime());
            if (d.end_date.getTime() === d.start_date.getTime()) {
                end_date.setDate(end_date.getDate() + 1);
            }
            return x(end_date) - x(d.start_date);
        })
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
        days: d3.sum(books, function (d) { return (d.end_date - d.start_date) / (1000*60*60*24) + 1; })
    };

    data.average = data.pages / data.days;

    d3.selectAll(".d3-data").each(showData(data));

}

var data, pages;

var qs = {
  parse: function (search) {
    search = search.substring(1, search.length)
    var parts = search.split('&')
    var obj = {}
    parts.forEach(function (part) {
      var keyValue = part.split('=')
      obj[keyValue[0]] = keyValue[1]
    })
    return obj
  }
}



var margin = {
        top: 20,
        right: 0,
        bottom: 20,
        left: 0
    },
    padding = {
        top: 40,
        right: 180,
        bottom: 70,
        left: 110
    };

var width = window.innerWidth,
    height = 200 - margin.top - margin.bottom;

var svg = d3.select("#chart-book").append("svg")
    .attr("class","chart-book")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + padding.top + padding.bottom)
  .append("g")
    .attr("class", "main")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

svg.append('rect')
    .attr('class', 'click-capture')
    //.style('visibility', 'hidden')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width + margin.left + margin.right)
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

var bars = svg.append("g")
    .attr("transform", "translate(" + padding.left + ", " + (padding.top + 1) + ")")
    .attr("class", "bars")

window.books = [];


/* HTML representation */

function showData(d) {
    return function () {
        var node = d3.select(this),
            attribute = node.attr('data-attribute'),
            pluralize = node.attr('data-pluralize'),
            format = node.attr("data-format") || ".1f";

        if (d.start_date) {
          node.style('color', COLORS[d.start_date.getFullYear()])
        } else {
          node.style('color', 'initial')
        }
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

    var end_date = new Date(d.end_date.getTime());
    if (d.end_date.getTime() === d.start_date.getTime()) {
        end_date.setDate(end_date.getDate() + 1);
    }

    this.start_date.attr("transform", "translate(" + x(d.start_date) + ", 0)")
    this.end_date.attr("transform", "translate(" + x(end_date) + ", 0)")
    this.start_dateText
        .attr("x", x(d.start_date) - 5)
        .text(d3.time.format("%b. %d")(d.start_date))

    this.end_dateText
        .attr("x", x(end_date) + 5)
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
function loadBooks(books, year) {
    if (year) {
      books = books.filter(function (book) {
          return book.end_date.getFullYear() === year;
      });
    }
    update(books, year);
}


var query = qs.parse(document.location.search)
var year = query.year ? parseInt(query.year, 10) : null

loadJSON(function (books) {
    loadBooks(books, year);
});
