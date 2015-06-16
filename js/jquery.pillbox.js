(function($){
	$.fn.pillbox = function(config){
		var options = $.extend({
			values: [],
			data: []
		},config);

		return this.each(function(){
			var self = this,
				oSelf = $(this);
				oSelf.values = [];

			var obj = {
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
					if (obj.currentHighlight != undefined) {
                        var word = obj.currentHighlight.html();

                        oSelf.values.push({
                            "key": word,
                            "value": obj.currentHighlight.attr("data-val")
                        });

                        obj.addWord(word);
                        oSelf.autoComplete.hide();
                        oSelf.autoComplete.find(".pillbox-auto-suggest-item").removeClass("highlight");
                        delete obj.currentHighlight;
                    } else {
                        obj.addWord(oSelf.val());
                    }
				},

				addWord: function(word) {
					var item = $(document.createElement("li")).addClass("pillbox-item").html(word+"<span class='pillbox-delete'>x</span>");

					oSelf.list.append(item);
					oSelf.val("");
					setTimeout(function(){
						self.focus();
					},100);
				},

				buildAutoComplete: function() {
					oSelf.autoComplete = $(document.createElement("div")).addClass("pillbox-auto-suggest-wrap");

					var ul = $(document.createElement("ul")).addClass("pillbox-auto-suggest-list"),
						a, len, val;

					oSelf.autoComplete.append(ul).appendTo(oSelf.parent());

					for (a = 0, len = options.data.length; a < len; a++) {
						val = options.data[a];
						ul.append($(document.createElement("li")).addClass("pillbox-auto-suggest-item").attr("data-val",val.value).html(val.key));
					}

					oSelf.parent().find(".pillbox-auto-suggest-wrap").on("click",".pillbox-auto-suggest-item",function(){
						$(".pillbox-auto-suggest-item").removeClass("highlight");

						var li = $(this);

						li.addClass("highlight");
						obj.currentHighlight = li;
						obj.addAutoCompleteValue();
					});

					$("body").on("click",function(){
						oSelf.autoComplete.hide();
					});
				},

				clearValues: function(){
					var a;

					for (a = oSelf.values.length-1; a >= 0; a--) {
						obj.removeWord(oSelf.values[a]);
					}

					oSelf.parent().find(".pillbox-item").remove();
				},

				filterList: function() {
					var val = oSelf.val().toLowerCase(),
						items = oSelf.parent().find(".pillbox-auto-suggest-item"),
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

				findNext: function(item) {
					var next = item.next();

					if (next.css("display") !== "none") {
						obj.onNextFound(next);
					} else {
						obj.findNext(next);
					}
				},

				findPrev: function(item) {
					var prev = item.prev();

					if (prev.css("display") !== "none") {
						obj.onPrevFound(prev);
					} else {
						obj.findPrev(prev);
					}
				},

				getValues: function() {
					return oSelf.values;
				},

				hookupDelete: function() {
					oSelf.parent().on("click",".pillbox-delete",function(){
						obj.onDeleteClick(this);
					});
				},

				hookupPillbox: function() {
					oSelf.on("keyup",function(e){
						e.preventDefault();
						e.stopPropagation();

						var key = e.which;

						switch(key) {
							case 13: //enter
							case 9: //tab
								if (oSelf.val() === "" && oSelf.autoComplete.css("display") === "none") { return; }
								if (oSelf.autoComplete && oSelf.autoComplete.css("display") !== "none") {
									obj.addAutoCompleteValue();
								} else {
									var word = oSelf.val();
									obj.addWord(word);
									oSelf.values.push(word);
								}
								break;
							case 8: //backspace
								obj.onBackspace();
								break;
							case 27: //esc key
								oSelf.autoComplete.hide();
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
					oSelf.parent().on("click",function(){
						oSelf.focus();
					});
				},

				onBackspace: function() {
					var kids = oSelf.list.children();

					if (oSelf.val() == "" && kids.length > 0) {
						var last = kids.last();
						if (last.hasClass("highlighted")) {
							obj.onDeleteClick(last.find(".pillbox-delete")[0]);
						} else {
							last.addClass("highlighted");
						}
						if (options.data) {
							obj.filterList();
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
					if (oSelf.autoComplete.css("display") === "none") {
						oSelf.autoComplete.css("display","block");
						var items = oSelf.autoComplete.find(".pillbox-auto-suggest-item"),
							item = $(items[0]);
						items.show();
						item.addClass("highlight");
						obj.currentHighlight = item;
						return;
					}
					obj.findNext(obj.currentHighlight);
				},

				onNextFound: function(next) {
					if (next.length == 0) {return;}
					obj.currentHighlight.removeClass("highlight");
					next.addClass("highlight");
					obj.currentHighlight = next;
				},

				onPrevFound: function(prev){
					if (prev.length == 0) {return;}
					obj.currentHighlight.removeClass("highlight");
					prev.addClass("highlight");
					obj.currentHighlight = prev;
				},

				onUpArrow: function() {
					obj.findPrev(obj.currentHighlight);
				},

				removeWord: function(word) {
					var a, val;

					for (a = oSelf.values.length-1; a >= 0; a--) {
						val = oSelf.values[a];
						if (val === word || (val.key && val.key === word)) {
							oSelf.values.splice(a,1);
							break;
						}
					}
				},

				setValues: function(values){
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
						oSelf.values.push(val);
					}
				},

				showDropdown: function() {
					if (oSelf.val() !== "") {
						oSelf.autoComplete.show();
					} else {
						oSelf.autoComplete.hide();
					}
				},

				wrapInput: function(){
					oSelf.wrapper = $(document.createElement("div")).addClass("pillbox-wrap");
					oSelf.list = $(document.createElement("ul")).addClass("pillbox-list");
					var clear = $(document.createElement("div")).css("clear","both");
					oSelf.addClass("pillbox-input").attr("placeholder","type a word and press enter");
					oSelf.wrap(oSelf.wrapper);
					oSelf.list.insertBefore(oSelf);
					clear.insertAfter(oSelf);
				}
			};

			obj.init();

			//public functions
			self.getValues = obj.getValues;
			self.setValues = obj.setValues;
			self.clearValues = obj.clearValues;
		});
	};
}(jQuery));