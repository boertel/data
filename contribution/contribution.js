function format(data) {
    var leadingZero = d3.format('02d');

    var fullyear = [];
    for (var i = 1; i <= 12; i += 1) {
        var month = leadingZero(i);
        for (var j = 1; j <= 31; j += 1) {
            var day = leadingZero(j),
                date = '2015-' + month + '-' + day;

            if (moment(date).isValid()) {
                var actions = data[date] || {
                    comment: 0,
                    upload: 0,
                    view: 0,
                    total: 0
                };
                fullyear.push({
                    date: date,
                    actions: actions
                });
            }
        }
    }

    console.log(fullyear);

    fullyear.forEach(function (d) {
        d.actions.total = d3.sum(d3.values(d.actions));
    });

    var nest = d3.nest()
        .key(function (d) { return moment(d.date).format('YYYY-WW'); })
        .entries(fullyear);
    nest.forEach(function (d) { d.month = moment(d.values[0].date).month(); })
    return nest;
}


var margin = {
    top: 20,
    right: 10,
    bottom: 10,
    left: 30
};

var width = 800 - margin.left - margin.right,
    height = 300 - margin.bottom - margin.top;

var color = d3.scale.linear()
    .range(['#FCDFDA', '#F15B41'])

var svg = d3.select('#chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.bottom + margin.top)

var graph = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

var months = svg.append('g')
    .attr('class', 'legend months')
    .attr('transform', 'translate(' + margin.left + ', 15)')

var days = svg.append('g')
    .attr('class', 'legend days')
    .attr('transform', 'translate(0, ' + margin.top + ')')

var daysData = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

days.selectAll('.number')
    .data(daysData)
  .enter()
    .append('text')
    .attr('class', 'number')
    .attr('dy', '9')
    .attr('y', function (d, i) { return i * 12; })
    .style('display', function (d, i) { return i % 2 ? 'none' : 'block'; })
    .text(function (d) { return d; })

var grid = graph.append('g')
    .attr('class', 'grid')


function update(field) {
    var field = field || 'total';

    color.domain([0, d3.max(data, function (d) { return d3.max(d.values, function (dd) { return dd.actions[field]; }); })]);

    var first = moment(data[0].values[0].date).month();

    var monthData = [],
        start = 0;
    for (var i = first; i < (first + 12); i += 1) {
        var n = i % 12,
            weeks = data.filter(function (d) { return d.month == ((i % 12) - 1); }).length;

        monthData.push({
            n: n,
            weeks: weeks,
            start: start
        })
        start += weeks;
    }

    months.selectAll('.month')
        .data(monthData)
      .enter()
        .append('text')
        .attr('class', 'month')
        .attr('x', function (d, i) { return (d.start + d.weeks) * 12; })
        .attr('text-anchor', 'start')
        .text(function (d) { return moment().month(d.n).format('MMM'); })

    var weeks = grid.selectAll('.week')
        .data(data)
      .enter()
        .append('g')
        .attr('class', 'week')
        .attr('transform', function (d, i) { return 'translate(' + (i * 12) + ', 0)'; })

    var rect = weeks.selectAll('.day')
        .data(function (d) { return d.values; })
      .enter()
        .append('rect')
        .attr('class', 'day')
        .attr('width', 10)
        .attr('height', 10)
        .attr('y', function (d, i) { return (d3.time.format('%w')(new Date(d.date)) * 12) })
        .style('fill', function (d) {
            var value = d.actions[field];
            return value === 0 ? '#eee': color(d.actions[field]);
        })

    rect.on('mouseover', function (d) {
        var element = d3.select(this)[0][0];
        var tooltip = d3.select('#tooltip')[0][0];
        n = element.getBoundingClientRect();
        c = n.left + window.pageXOffset - tooltip.offsetWidth / 2 + n.width / 2;
        u = n.bottom + window.pageYOffset - tooltip.offsetHeight - 2 * n.height;
        tooltip.style.top = u + "px";
        tooltip.style.left = c + "px";

        tooltip.innerHTML = d3.time.format('%d %b, %Y')(new Date(d.date));
        //tooltip.style.display = 'block';
    });
}

data = format(raw);

update()
