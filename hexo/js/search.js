var SearchService = "";

(function($) {
  /**
   * A super class of common logics for all search services
   * @param options : (object)
   */
  SearchService = function(options) {
    var self = this;

    self.config = $.extend({
      per_page: 10,
      selectors: {
        body: "body",
        form: ".u-search-form",
        input: ".u-search-input",
        container: "#u-search",
        modal: "#u-search .modal",
        modal_body: "#u-search .modal-body",
        modal_footer: "#u-search .modal-footer",
        modal_overlay: "#u-search .modal-overlay",
        modal_results: "#u-search .modal-results",
        modal_metadata: "#u-search .modal-metadata",
        modal_error: "#u-search .modal-error",
        modal_loading_bar: "#u-search .modal-loading-bar",
        modal_ajax_content: "#u-search .modal-ajax-content",
        modal_logo: '#u-search .modal-footer .logo',
        btn_close: "#u-search .btn-close",
        btn_next: "#u-search .btn-next",
        btn_prev: "#u-search .btn-prev"
      },
      brands: {
        'hexo': {logo: '', url: ''},
        'algolia': {logo: 'algolia.svg', url: 'https://www.algolia.com'}
      },
      imagePath: ROOT + "img/"
    }, options);

    self.dom = {};
    self.percentLoaded = 0;
    self.open = false;
    self.queryText = "";
    self.nav = {
      next: -1,
      prev: -1,
      total: 0,
      current: 1
    };

    self.parseSelectors = function() {
      for (var key in self.config.selectors) {
        self.dom[key] = $(self.config.selectors[key]);
      }
    };

    self.beforeQuery = function() {
      if (!self.open) {
        self.dom.container.fadeIn();
        self.dom.body.addClass('modal-active');
      }
      self.dom.input.each(function(index,elem) {
        $(elem).val(self.queryText);
      });
      document.activeElement.blur();
      self.dom.modal_error.hide();
      self.dom.modal_ajax_content.removeClass('loaded');
      self.startLoading();
    };

    self.afterQuery = function() {
      self.dom.modal_body.scrollTop(0);
      self.dom.modal_ajax_content.addClass('loaded');
      self.stopLoading();
    };

    /**
     * Perform a complete serach operation including UI updates and query
     * @param startIndex {int} start index or page number
     */
    self.search = function(startIndex, callback) {
      self.beforeQuery();
      if (self.search instanceof Function) {
        self.query(self.queryText, startIndex, function() {
          self.afterQuery();
        });
      }
      else {
        console.log("query() does not exist.");
        self.onQueryError(self.queryText, '');
        self.afterQuery();
      }
    };

    /**
     * Query error handler
     * @param queryText: (string)
     * @param status: (string)
     */
    self.onQueryError = function(queryText, status) {
      var errMsg = "";
      if (status === "success") errMsg = "No result found for \"" +queryText+ "\".";
      else if (status === "timeout") errMsg = "Unfortunate timeout.";
      else errMsg = "Mysterious failure.";
      self.dom.modal_results.html("");
      self.dom.modal_error.html(errMsg);
      self.dom.modal_error.show();
    };

    self.nextPage = function() {
      if (self.nav.next !== -1) {
        self.search(self.nav.next);
      }
    };

    self.prevPage = function() {
      if (self.nav.prev !== -1) {
        self.search(self.nav.prev);
      }
    };

    self.getUrlRelativePath = function(url) {
　　　　var arrUrl = url.split("//");
　　　　var start = arrUrl[1].indexOf("/");
　　　　var relUrl = arrUrl[1].substring(start);
　　　　if(relUrl.indexOf("?") != -1){
　　　　　　relUrl = relUrl.split("?")[0];
　　　　}
　　　　return relUrl;
　　}

    /**
     * Close the modal, resume body scrolling
     * no param
     */
    self.close = function() {
      self.open = false;
      self.dom.container.fadeOut();
      self.dom.body.removeClass('modal-active');
    };

    /**
     * Generate html for one result
     * @param url : (string) url
     * @param title : (string) title
     * @param digest : (string) digest
     * @param index : 标号
     */
    self.buildResult = function(url, title, digest, index) {
      var html = "";
      var result = self.getUrlRelativePath(url);
      html = "<li>";
      html +=   "<a class='result search-result-fix' value='" + result + "'>";
      html +=     "<span class='title'>" +index + ".  " + title+ "</span>";
      if(digest !== "")
      html +=     "<span class='digest'>" +digest+ "</span>";
      html +=     "<span class='fas fa-chevron-thin-right'></span>";
      html +=   "</a>";
      // html += "<script>$('.fix-search-pjax-" + index +"').click(function (event) {pjax.loadUrl('"+self.getUrlRelativePath(url)+"');setTimeout(function(){$('#u-search').fadeOut(500);$('body').removeClass('modal-active');}, 300);});</script>";
      html += "</li>";
      return html;
    };

    /**
     * Searchform submit event handler
     * @param queryText : (string) the query text
     */
    self.onSubmit = function(event) {
      event.preventDefault();
      self.queryText = $(this).find('.u-search-input').val();
      if (self.queryText) {
        self.search(1);
      }
    };

    /**
     * Start loading bar animation
     * no param
     */
    self.startLoading = function() {
      self.dom.modal_loading_bar.show();
      self.loadingTimer = setInterval(function() {
        self.percentLoaded = Math.min(self.percentLoaded+5,95);
        self.dom.modal_loading_bar.css('width', self.percentLoaded+'%');
      }, 100);
    };

    /**
     * Stop loading bar animation
     * no param
     */
    self.stopLoading = function() {
      clearInterval(self.loadingTimer);
      self.dom.modal_loading_bar.css('width', '100%');
      self.dom.modal_loading_bar.fadeOut();
      setTimeout(function() {
        self.percentLoaded = 0;
        self.dom.modal_loading_bar.css('width', '0%');
      }, 300);
    };

    /**
     * Add service branding
     * @param service {String} service name
     */
    self.addLogo = function(service) {
      var html = "";
      if (self.config.brands[service] && self.config.brands[service].logo) {
        html += "<a href='" +self.config.brands[service].url+ "' class='" +service+ "'>";
        html +=    '<img src="' +self.config.imagePath+self.config.brands[service].logo+ '" />';
        html += "</a>";
        self.dom.modal_logo.html(html);
      }
    };

    self.destroy = function() {
      self.dom.form.each(function(index,elem) {
        $(elem).off('submit');
      });
      self.dom.modal_overlay.off('click');
      self.dom.btn_close.off('click');
      self.dom.btn_next.off('click');
      self.dom.btn_prev.off('click');
      self.dom.container.remove();
    };

    /**
     * Load template and register event handlers
     * no param
     */
    self.init = function() {
      $('body').append(template);
      self.parseSelectors();
      self.dom.modal_footer.show();
      self.dom.form.each(function(index,elem) {
        $(elem).on('submit', self.onSubmit);
      });
      self.dom.modal_overlay.on('click', self.close);
      self.dom.btn_close.on('click', self.close);
      self.dom.btn_next.on('click', self.nextPage);
      self.dom.btn_prev.on('click', self.prevPage);
    };

    self.init();
  };

  var template = '<div id="u-search"><div class="modal"> <header class="modal-header" class="clearfix"><form id="u-search-modal-form" class="u-search-form" name="uSearchModalForm"> <input type="text" id="u-search-modal-input" class="u-search-input" /> <button type="submit" id="u-search-modal-btn-submit" class="u-search-btn-submit"> <span class="fas fa-search"></span> </button></form> <a class="btn-close"> <span class="fas fa-times"></span> </a><div class="modal-loading"><div class="modal-loading-bar"></div></div> </header> <main class="modal-body"><ul class="modal-results modal-ajax-content"></ul> </main> <footer class="modal-footer clearfix"><div class="modal-metadata modal-ajax-content"> <strong class="range"></strong> of <strong class="total"></strong></div><div class="modal-error"></div> <div class="logo"></div> <a class="nav btn-next modal-ajax-content"> <span class="text">NEXT</span> <span class="fas fa-chevron-right"></span> </a> <a class="nav btn-prev modal-ajax-content"> <span class="fas fa-chevron-left"></span> <span class="text">PREV</span> </a> </footer></div><div class="modal-overlay"></div></div>';
})(jQuery);

var AlgoliaSearch;
(function($) {
  'use strict';

  /**
   * Search by Algolia Search
   * @param options : (object)
   */
  AlgoliaSearch = function(options) {
    SearchService.apply(this, arguments);
    var self = this;
    var endpoint = "https://" +self.config.appId+ "-dsn.algolia.net/1/indexes/" + self.config.indexName;
    self.addLogo('algolia');

    /**
     * Generate result list html
     * @param data : (array) result items
     */
    self.buildResultList = function(data) {
      var html = "";
      $.each(data, function(index, row) {
        var url = row.permalink || row.path || "";
        if (!row.permalink && row.path) {
          url = ROOT + url;
        }
        var title = row.title;
        var digest = "";
        html += self.buildResult(url, title, digest, index+1);
      });
      html += "<script>$('.result.search-result-fix').click(function(event){var url = this.getAttribute('value');pjax.loadUrl(url);setTimeout(function(){$('#u-search').fadeOut(500);$('body').removeClass('modal-active');}, 300);});</script>";
      return html;
    };

    /**
     * Generate metadata after a successful query
     * @param data : (object) the raw search response data
     */
    self.buildMetadata = function(data) {
      self.nav.current = data.page * data.hitsPerPage + 1;
      self.nav.currentCount = data.hits.length;
      self.nav.total = parseInt(data.nbHits);
      self.dom.modal_metadata.children('.total').html(self.nav.total);
      self.dom.modal_metadata.children('.range').html(self.nav.current + "-" + (self.nav.current+self.nav.currentCount-1));
      if (self.nav.total > 0) {
        self.dom.modal_metadata.show();
      }
      else {
        self.dom.modal_metadata.hide();
      }

      if (data.page < data.nbPages-1) {
        self.nav.next = (data.page+1)+1;
        self.dom.btn_next.show();
      }
      else {
        self.nav.next = -1;
        self.dom.btn_next.hide();
      }
      if (data.page > 0) {
        self.nav.prev = (data.page+1)-1;
        self.dom.btn_prev.show();
      }
      else {
        self.nav.prev = -1;
        self.dom.btn_prev.hide();
      }
    };

    /**
     * Send a GET request
     * @param queryText : (string) the query text
     * @param page : (int) the current page (start from 1)
     * @param callback : (function)
     */
    self.query = function(queryText, page, callback) {
      $.get(endpoint, {
        query: queryText,
        page: page-1,
        hitsPerPage: self.config.per_page,
        "x-algolia-application-id": self.config.appId,
        "x-algolia-api-key": self.config.apiKey
      }, function(data, status) {
        if (status === 'success' && data.hits && data.hits.length > 0) {
          var results = self.buildResultList(data.hits);
          self.dom.modal_results.html(results);
        }
        else {
          self.onQueryError(queryText, status);
        }
        self.buildMetadata(data);
        if (callback) {
          callback(data);
        }
      });
    };

    return self;
  };

})(jQuery);


var HexoSearch;
(function($) {
  'use strict';

  /**
  * Search by Hexo generator json content
  * @param options : (object)
  */
  HexoSearch = function(options) {
    SearchService.apply(this, arguments);
    var self = this;
    self.config.endpoint = ROOT + ((options||{}).endpoint || "content.json");
    self.config.endpoint = self.config.endpoint.replace("//","/"); //make sure the url is correct
    self.cache = "";

    /**
     * Search queryText in title and content of a post
     * Credit to: http://hahack.com/codes/local-search-engine-for-hexo/
     * @param post : the post object
     * @param queryText : the search query
     */
    self.contentSearch = function(post, queryText) {
      var post_title = post.title.trim().toLowerCase(),
          post_content = post.text.trim().toLowerCase(),
          keywords = queryText.trim().toLowerCase().split(" "),
          foundMatch = false,
          index_title = -1,
          index_content = -1,
          first_occur = -1;
      if (post_title !== '' && post_content !== '') {
        $.each(keywords, function(index, word) {
          index_title = post_title.indexOf(word);
          index_content = post_content.indexOf(word);
          if (index_title < 0 && index_content < 0) {
            foundMatch = false;
          }
          else {
            foundMatch = true;
            if (index_content < 0) {
              index_content = 0;
            }
            if (index === 0) {
              first_occur = index_content;
            }
          }
          if (foundMatch) {
            post_content = post.text.trim();
            var start = 0, end = 0;
            if (first_occur >= 0) {
              start = Math.max(first_occur-40, 0);
              end = (start === 0) ? Math.min(200, post_content.length) : Math.min(first_occur + 120, post_content.length);
              var match_content = post_content.substring(start, end);
              keywords.forEach(function(keyword) {
                var regS = new RegExp(keyword, "gi");
                match_content = match_content.replace(regS, "<b style='color: #c00'>"+keyword+"</b>");
              });
              post.digest = match_content + "......";
            }
            else {
              end = Math.min(200, post_content.length);
              post.digest = post_content.trim().substring(0, end);
            }
          }
        });
      }
      return foundMatch;
    };

    /**
     * Generate result list html
     * @param data : (array) result items
     */
    self.buildResultList = function(data, queryText) {
      var results = [],
          html = "";
      var i = 1;
      $.each(data, function(index, post) {
        if (self.contentSearch(post, queryText)) {
          var articleName = HEXO_PERMALINK.split('/');
          if(post.permalink.indexOf(articleName[0]) >= 0) 
            html += self.buildResult(post.permalink, post.title, post.digest, i++);
        }
      });
      html += "<script>$('.result.search-result-fix').click(function(event){var url = this.getAttribute('value');pjax.loadUrl(url);setTimeout(function(){$('#u-search').fadeOut(500);$('body').removeClass('modal-active');}, 300);});</script>";
      return html;
    };

    /**
     * Generate metadata after a successful query
     * @param data : (object) the raw google custom search response data
     */
    self.buildMetadata = function(data) {
      self.dom.modal_footer.hide();
    };

    /**
     * Send a GET request
     * @param queryText : (string) the query text
     * @param startIndex : (int) the index of first item (start from 1)
     * @param callback : (function)
     */
    self.query = function(queryText, startIndex, callback) {
      if (!self.cache) {
        $.get(self.config.endpoint, {
          key: self.config.apiKey,
          cx: self.config.engineId,
          q: queryText,
          start: startIndex,
          num: self.config.per_page
        }, function(data, status) {
          if (status !== 'success' ||
              !data ||
              (!data.posts && !data.pages) ||
              (data.posts.length < 1 && data.pages.length < 1)
            ) {
            self.onQueryError(queryText, status);
          }
          else {
            self.cache = data;
            var results = "";
            results += self.buildResultList(data.pages, queryText);
            results += self.buildResultList(data.posts, queryText);
            self.dom.modal_results.html(results);
          }
          self.buildMetadata(data);
          if (callback) {
            callback(data);
          }
        });
      }
      else {
        var results = "";
        results += self.buildResultList(self.cache.pages, queryText);
        results += self.buildResultList(self.cache.posts, queryText);
        self.dom.modal_results.html(results);
        self.buildMetadata(self.cache);
        if (callback) {
          callback(self.cache);
        }
      }
    };

    return self;
  };

})(jQuery);
