/*类型判断*/

export const typeJduge = function() {
	return {
		Json:function(obj){
			return typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
		},
		Array:function(obj){
			return Object.prototype.toString.call(obj) === '[object Array]';
		},
		Obj:function(obj){
			return obj && typeof (obj) == 'object' && Object.prototype.toString.call(obj).toLowerCase() == "[object object]";
		},
		Function:function(obj){
			return Object.prototype.toString.call(obj)=="[object Function]";
		},
		RegExp:function(obj){
			return Object.prototype.toString.call(obj)=="[object RegExp]";
		},
		Integer:function(obj){
			return typeof obj === 'number' && obj%1 === 0;
		}
	}
}();