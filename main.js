$.ajaxSetup({async: false});

var map;
var week_index = 46
$.getJSON('DengueKH.json', function(data){
	DengueKH = data
});


function initialize(){
	/*map setting*/
	map = new google.maps.Map(document.getElementById('map-canvas'), {
		zoom: 10,
		center: {lat: 22.75, lng: 120.50 }
	});

	$.getJSON('townKH.json', function( data ){
		town = map.data.addGeoJson(data);
	});

	town.forEach(function(value){
		var key = value.getProperty('TOWNNAME')
		value.setProperty('num',DengueKH[key][week_index])
	});

	map.data.setStyle(function(feature){
		var num = feature.getProperty('num')
		color = ColorBar(num)
		return {
			fillColor: color,
			fillOpacity: 0.6,
			strokeColor: 'gray',
			strokeWeight: 1
		}
	})

	map.data.addListener('mouseover', function(event){
		var TownName = event.feature.getProperty('TOWNNAME')
		map.data.revertStyle();
		map.data.overrideStyle(event.feature, {fillColor: 'white'});
	});
	map.data.addListener('mouseout', function(event){
		map.data.revertStyle();
	});

	start = new Date(2013,12-1,29)
	total = []
	for(var i = 0 ; i < DengueKH['合計'].length ; i = i + 1){
		start.setDate(start.getDate() + 7)
		total.push([ start.getTime() , DengueKH['合計'][i] ])
	}

	/*highchart setting*/
	$('#highchart').highcharts('StockChart', {
		chart: {
			alignTicks: false
		},

		rangeSelector: {
			enabled: false
		},
		tooltip: {
			enabled: true,
			positioner: function(){ return {x: 10, y: 30}}
		},
		plotOptions: {
			series: {
				cursor: 'pointer',
				point: {
					events: {
						click: function(){
							$('#detial > #title').text('第' + (this.index+1) + '週(' + new Date(this.x).toLocaleDateString() + ')');
							week_index = this.index
							town.forEach(function(value){
								var key = value.getProperty('TOWNNAME')
								value.setProperty('num', DengueKH[key][week_index])
							});
						}
					}
				},			
			}
		},
		series: [{
				type: 'column',
				name: '高雄市',
				data: total,
		}]
	});
}

google.maps.event.addDomListener(window, 'load', initialize);