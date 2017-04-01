function requestAsForm(){
	return function(data){
		if (data === undefined)
			return data;
		return $.param(data);
	}
};

angular.module('RequestBuilder',[]);

angular.module('RequestBuilder').filter('html',['$sce', function($sce){
	return function(input){
		return $sce.trustAsHtml(input);
	};
}]);

angular.module('RequestBuilder').controller('MainCtrl',['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
	$scope.data = {
		'url' : 'http://localhost',
		'method' : 'GET',
		'form' : 'PAYLOAD',
		'headerFields' : 1,
		'renderType' : 'RAW',
		'header' : [
			{
				'key':'',
				'value':''
			}
		],
		'dataFields' : 1,
		'data' : [
			{
				'key':'',
				'value':''
			}
		],
	};

	$scope.resp = {
		status : '-',
		header: '-',
		data: '-',
		time: '-',
	};

	$scope.timeStart = 0;
	$scope.savedItems = [];
	$scope.savedCurrent = 0;
	$scope.savedLast = 0;


	$scope.updateFields = function(type){
		var current = [];
		var obj     = {};

		for(var i in $scope.data[type])
			current.push($scope.data[type][i]);

		$scope.data[type] = [];
		for(var j=0; j<$scope.data[type+"Fields"]; j++){
			obj = current[j] || {'key':'', 'value':''};
			$scope.data[type].push({
				'key'  : obj.key,
				'value': obj.value
			});
		}

		$scope.savedLast = 0;
	};

	$scope.save = function(){
		var copy = {};
		for(var i in $scope.data)
			if($scope.data.hasOwnProperty(i))
				copy[i] = $scope.data[i];

		copy.id = performance.now();

		$scope.savedItems.push(copy);

		$scope.persistSaved();
	};

	$scope.deleteSaved = function(e, id){
		e.stopPropagation();
		e.preventDefault();

		for(var i in $scope.savedItems)
			if($scope.savedItems[i].id === id){
				$scope.savedItems.splice(i,1);
				break;
			}

		$scope.persistSaved();
	}

	$scope.restoreSaved = function(id){
		var item = null;
		for(var i in $scope.savedItems)
			if($scope.savedItems[i].id === id){
				item = $scope.savedItems[i];
				break;
			}

		if(item === null)
			return;

		for(var i in $scope.data)
			if($scope.data.hasOwnProperty(i) && item.hasOwnProperty(i))
				$scope.data[i] = item[i];

		$scope.savedCurrent = item.id;
		$scope.savedLast    = item.id;
	}

	$scope.persistSaved = function(){
		localStorage.setItem("savedItems", JSON.stringify($scope.savedItems));
	}

	$scope.send = function(){

		$scope.timeStart = performance.now();
		$rootScope.$broadcast('loaderStart');

		var custom_data   = {}
		var custom_header = {}
		var config;

		for(var i in $scope.data.data)
			custom_data[$scope.data.data[i].key] = $scope.data.data[i].value;

		for(var i in $scope.data.header)
			if($scope.data.header[i].key.length > 1)
				custom_header[$scope.data.header[i].key] = $scope.data.header[i].value;

		config = {
			'url':    $scope.data.url,
			'method': $scope.data.method,
			'data':   custom_data,
		};

		if($scope.data.form != 'PAYLOAD'){
			custom_header["Content-Type"] = 'application/x-www-form-urlencoded; charset=UTF-8';
			config["transformRequest"]   = requestAsForm();
		}

		if(JSON.stringify(custom_header).length > 2)
			config['headers'] = custom_header;


		$http(config).then(function(response){
			var h = response.headers();
			$scope.parseResponse(response.data,response.status,h);
		},function(response){
			var h = response.headers();
			if(response.status === -1){
				response.status = 0;
				response.data = "Não encontrado";
			}
			$scope.parseResponse(response.data,response.status,h);
		});
	};


	$scope.parseResponse = function(data,status,headers){
		var beautyData    = "";
		var beautyHeaders = "";

		try{
			if(typeof data === 'object')
				beautyData = JSON.stringify(data,null,"    ");
			else
				beautyData = data;
		}catch(e){
			beautyData = data;
		}

		$scope.resp.data    = beautyData;
		$scope.resp.status  = status;
		$scope.resp.headers = headers;
		$scope.resp.time    = Math.round(performance.now() - $scope.timeStart) + "ms";

		$rootScope.$broadcast('loaderDone');
	};

	$scope.ResponseHeaders = function(){
		var ret = "";
		for(var i in $scope.resp.headers)
			ret += i+': '+$scope.resp.headers[i] + "\n";
		return ret.length < 1 ? '-' : ret;
	}

	$scope.initialize = function(){
		console.log(localStorage.getItem("savedItems"));
		if(localStorage.getItem("savedItems") !== null)
			$scope.savedItems = JSON.parse(localStorage.getItem("savedItems"));
	};

	$scope.initialize();
}]);


angular.module('RequestBuilder').directive("rbLoader", function(){
	return {
		'restrict' : 'A',
		'link' : function(scope, element, attrs, controller){
			scope.$on('loaderDone', function(){
				$(element).removeClass('visible');
			});

			scope.$on('loaderStart', function(){
				$(element).addClass('visible');
			});
		}
	};
});


angular.module('RequestBuilder').directive("rbNanoScroller", function(){
	return {
		'restrict' : 'A',
		'link' : function(scope, element, attrs, controller){
			$(element).height(window.innerHeight - 150);

			scope.$on('loaderDone', function(){
				setTimeout(function(){
					console.log("update");
					$(element).nanoScroller();
				},1);
			});
		}
	};
});