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
		var key = value.getProperty('TOWNNAME');
		value.setProperty('num',DengueKH[key][week_index]);
	});

	map.data.setStyle(function(feature){
		var num = feature.getProperty('num');
		color = ColorBar(num);
		return {
			fillColor: color,
			fillOpacity: 0.6,
			strokeColor: 'gray',
			strokeWeight: 1
		}
	});

	map.data.addListener('mouseover', function(event){
		var TownName = event.feature.getProperty('TOWNNAME');
		map.data.revertStyle();
		map.data.overrideStyle(event.feature, {fillColor: 'white'});
	});

	map.data.addListener('mouseout', function(event){
		map.data.revertStyle();
	});

	map.data.addListener('click', function(event){
		var TownName = event.feature.getProperty('TOWNNAME');
		if($('#myTab a[name|="'+TownName+'"]').tab('show').length == 0){
			$('#myTab').append('<li><a name="'+TownName+'" href="#'+TownName+'" data-toggle="tab">'+TownName+
				'<button class="close" onclick="closeTab(this.parentNode)">×</button></a></li>');
			$('#myTabContent').append('<div class="tab-pane fade" id="'+TownName+'"><div></div></div>');
			$('#myTab a:last').tab('show');
			createStockChart(TownName);
			$('#myTab li a:last').click(function (e) {
				$(window).trigger('resize');
			});
		}
	});
	createStockChart('合計');
}

function createStockChart(TownName){
	start = new Date(2013,12-1,29);
	var series = []
	for(var i = 0 ; i < DengueKH[TownName].length ; i = i + 1){
		start.setDate(start.getDate() + 7);
		series.push([ start.getTime() , DengueKH[TownName][i] ]);
	}

	$('#'+TownName).highcharts('StockChart', {
		chart: {
			alignTicks: false,
			width: $('#myTabContent').width(),
			height: $('#myTabContent').height()
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
							$('#detial > #title').text('第' + (this.index+1) + '週(' + new Date(this.x-1).toLocaleDateString() + ')');
							week_index = this.index
							town.forEach(function(value){
								var key = value.getProperty('TOWNNAME');
								value.setProperty('num', DengueKH[key][week_index]);
							});
						}
					}
				},			
			}
		},
		series: [{
				type: 'column',
				name: TownName,
				data: series,
		}]
	});
}

$(window).resize(function() {
	var len = $('#myTabContent > div').length;
	for( var i = 1; i<=len; i = i + 1){
		$('#myTabContent > div:nth-child('+i+')').highcharts().setSize($('#myTabContent').width(),$('#myTabContent').height());
	}
});

function closeTab(node){
	var nodename = node.name;
	node.parentNode.remove();
	$('#'+nodename).remove();
}

google.maps.event.addDomListener(window, 'load', initialize);