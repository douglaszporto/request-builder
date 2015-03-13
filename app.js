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

angular.module('RequestBuilder').controller('MainCtrl',['$scope', '$http', function($scope,$http){
	$scope.data = {
		'url' : '/RequestBuilder/test_get.php',
		'host' : document.location.host,
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
		data: '-'
	}


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
	};

	$scope.send = function(){

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


		$http(config).success(function(data,status,headers,config){
			var h = headers();
			$scope.parseResponse(data,status,h);
		}).error(function(data,status,headers,config){
			var h = headers();
			$scope.parseResponse(data,status,h);
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
	};

	$scope.ResponseHeaders = function(){
		var ret = "";
		for(var i in $scope.resp.headers)
			ret += i+': '+$scope.resp.headers[i] + "\n";
		return ret.length < 1 ? '-' : ret;
	}

}]);
