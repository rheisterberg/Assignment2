define('ebay.profiler.Performance',function() {

	var Profiler = snap.require('ebay.profiler.Profiler');

	var Performance = function() {};

	snap.extend(Performance,{
		onLoad : function(event) {

			var e2e = new Date().getTime() - performance.timing.navigationStart;
			Profiler.addParam("ex3", e2e); // end to end at client, also log to cal tx

			var newct21 = new Date().getTime() - performance.timing.responseStart;
			Profiler.addParam("ctidl", newct21);  // client rendering, also log to cal tx

			var req = performance.timing.responseStart - performance.timing.navigationStart;
			Profiler.addParam("jsebca", req);  // first byte time

			var dom = performance.timing.domComplete - performance.timing.responseStart;
			Profiler.addParam("ct1chnk", dom); // dom complete

			var dns = performance.timing.domainLookupEnd - performance.timing.domainLookupStart;
			Profiler.addParam("jsljgr3", dns); // dns lookup time

			var conn = performance.timing.connectEnd - performance.timing.connectStart;
			Profiler.addParam("svo", conn); // connection time, also log to cal tx

			var req = performance.timing.responseStart - performance.timing.requestStart;
			Profiler.addParam("jsljgr1", req);  // request time

			var resp = performance.timing.responseEnd - performance.timing.responseStart;
			Profiler.addParam("slo", resp);  // content download time
		}
	});

	var oGaugeInfo = window.oGaugeInfo;
	if (oGaugeInfo && window.performance) $(window).bind('load',Performance.onLoad.bind(Performance));

	return Performance;

});

snap.require('ebay.profiler.Performance');

