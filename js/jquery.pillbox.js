(function($){

	$.fn.pillbox = function(config){

		var options = $.extend({
			values: [],
			data: []
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
					obj.setValues(options.values);
					if (options.data.length > 0) {
						obj.buildAutoComplete();
					}
				},
				
				addAutoCompleteValue: function() {
					var word = obj.currentHighlight.html();
					obj.values.push({
						"key": word,
						"value": obj.currentHighlight.attr("data-val")
					});
					obj.addWord(word);
					obj.autoComplete.hide();
				},
				
				addWord: function(word) {

					var item = $(document.createElement("li")).addClass("pillbox-item").html(word+"<span class='pillbox-delete'>x</span>");

					obj.list.append(item);
					pbox.val("");
					setTimeout(function(){
						pbox.focus();
					},100);
				},
				
				buildAutoComplete: function() {
					obj.autoComplete = $(document.createElement("div")).addClass("pillbox-auto-suggest-wrap");
					var ul = $(document.createElement("ul")).addClass("pillbox-auto-suggest-list"),
						a, len, val;

					obj.autoComplete.append(ul).appendTo($(".pillbox-wrap"));
					
					for (a = 0, len = options.data.length; a < len; a++) {
						val = options.data[a];
						ul.append($(document.createElement("li")).addClass("pillbox-auto-suggest-item").attr("data-val",val.value).html(val.key));
					}
					
					$("body").on("click",".pillbox-auto-suggest-item",function(){
						$(".pillbox-auto-suggest-item").removeClass("highlight");
						var li = $(this);
						li.addClass("highlight");
						obj.currentHighlight = li;
						obj.addAutoCompleteValue();
					});
				},
				
				clearValues: function(){
					var a;
					for (a = obj.values.length-1; a >= 0; a--) {
						obj.removeWord(obj.values[a]);
					}
					$(".pillbox-item").remove();
				},
				
				filterList: function() {
					var val = pbox.val().toLowerCase(),
						items = $(".pillbox-auto-suggest-item"),
						item, val;
						
					delete obj.currentHighlight;
					items.removeClass("highlight");
						
					items.each(function(idx, item){
						item = $(item),
						html = item.html().toLowerCase(),
						dataval = item.attr("data-val");
						if (html.indexOf(val) != -1 || dataval.indexOf(val) != -1) {
							if (!obj.currentHighlight) {
								obj.currentHighlight = item;
								item.addClass("highlight");
							}
							item.show();
						} else {
							item.hide();
						}
					});
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
								if (obj.autoComplete && obj.autoComplete.css("display") != "none") {
									obj.addAutoCompleteValue();
								} else {
									var word = pbox.val();
									obj.addWord(word);
									obj.values.push(word);
								}
								break;
							case 8: //backspace
								obj.onBackspace();
								break;
							case 38: //up arrow
								obj.onUpArrow();
								break;
							case 40: //down arrow
								obj.onDownArrow();
								break;
							default:
								if (options.data.length > 0) {
									obj.showDropdown();
									obj.filterList();
								}
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
				
				onDownArrow: function() {
					var next = obj.currentHighlight.next();
					if (next.length == 0) {return;}
					obj.currentHighlight.removeClass("highlight");
					next.addClass("highlight");
					obj.currentHighlight = next;
				},
				
				onUpArrow: function() {
					var prev = obj.currentHighlight.prev();
					if (prev.length == 0) {return;}
					obj.currentHighlight.removeClass("highlight");
					prev.addClass("highlight");
					obj.currentHighlight = prev;
				},
				
				removeWord: function(word) {
					var a, val;
					for (a = obj.values.length-1; a >= 0; a--) {
						val = obj.values[a];

						if (val === word || (val.key && val.key === word)) {
							obj.values.splice(a,1);
							break;
						}
					}
				},
				
				setValues: function(values) {
					obj.clearValues();
					if (typeof values === "string") {
						values = [values];
					}
					var a, len, val;
					for (a = 0, len = values.length; a < len; a++) {
						val = values[a];
						if (typeof val === "string") {
							obj.addWord(val);	
						} else {
							obj.addWord(val.key);
						}
						obj.values.push(val);
					}
				},
				
				showDropdown: function() {
					if (pbox.val() !== "") {
						obj.autoComplete.show();
					} else {
						obj.autoComplete.hide();
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