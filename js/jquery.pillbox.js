(function($){

	$.fn.pillbox = function(config){

		var options = $.extend({
			
		},config);

		return this.each(function(){
			var pbox = $(this);

			var obj = {
				values: [],

				init: function(){
					obj.wrapInput();
					obj.hookupWrapper();
					obj.hookupPillbox();
					obj.hookupDelete();
				},
				
				addWord: function(word) {

					var item = $(document.createElement("li")).addClass("pillbox-item").html(word+"<span class='pillbox-delete'>x</span>");

					obj.list.append(item);
					pbox.val("");
					obj.values.push(word);
					setTimeout(function(){
						pbox.focus();
					},100);
				},
				
				clearValues: function(){
					var a;
					for (a = obj.values.length-1; a >= 0; a--) {
						obj.removeWord(obj.values[a]);
					}
					$(".pillbox-item").remove();
				},
				
				getValues: function() {
					return obj.values;
				},
				
				hookupDelete: function() {
					$("body").on("click",".pillbox-delete",function(){
						obj.onDeleteClick(this);
					});
				},
				
				hookupPillbox: function() {
					$("body").on("keyup",pbox,function(e){
						e.preventDefault();
						e.stopPropagation();

						var key = e.which;
						
						switch(key) {
							case 13: //enter key
							case 9: //tab key
							case 188: //comma
								if (pbox.val() === "") { return; }
								obj.addWord(pbox.val());
								break;
							case 8: //backspace
								obj.onBackspace();
								break;
							default:
								break;
						}
					});
				},
				
				hookupWrapper: function() {
					$("body").on("click",obj.wrapper,function(){
						pbox.focus();
					});
				},
				
				onBackspace: function() {

					var kids = obj.list.children();

					if (pbox.val() == "" && kids.length > 0) {
						var last = kids.last();
						if (last.hasClass("highlighted")) {
							obj.onDeleteClick(last.find(".pillbox-delete"));
						} else {
							last.addClass("highlighted");
						}
					}
				},
				
				onDeleteClick: function(el) {
					var li = $(el).closest(".pillbox-item");
					el.remove();
					var word = li.html();
					obj.removeWord(word);
					li.remove();
				},
				
				removeWord: function(word) {
					var a, val;
					for (a = obj.values.length-1; a >= 0; a--) {
						if (obj.values[a] == word) {
							obj.values.splice(a,1);
							break;
						}
					}
				},
				
				setValues: function(values) {
					if (typeof values === "string") {
						values = [values];
					}
					var a, len, val;
					for (a = 0, len = values.length; a < len; a++) {
						val = values[a];
						obj.addWord(val);
					}
				},
				
				wrapInput: function(){
					obj.wrapper = $(document.createElement("div")).addClass("pillbox-wrap");
					obj.list = $(document.createElement("ul")).addClass("pillbox-list");
					var clear = $(document.createElement("div")).css("clear","both");
					
					pbox.addClass("pillbox-input").attr("placeholder","type a word and press enter, tab, or comma");
					pbox.wrap(obj.wrapper);
					obj.list.insertBefore(pbox);
					clear.insertAfter(pbox);
				}
			};
			
			obj.init();
			
			//public functions
			this.getValues = obj.getValues;
			this.setValues = obj.setValues;
			this.clearValues = obj.clearValues;
		});
	};
}(jQuery));