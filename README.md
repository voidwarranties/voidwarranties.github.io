# voidwarranties.github.io
VoidWarranties static website is using [Jekyll](https://jekyllrb.com/) static site generator with [Github pages](https://pages.github.com). Reasoning:
* Github is hosting, so no hosting costs for us and good uptime
* can add/edit pages through Github using markdown, cfr. a CMS
* well documented and everything is in Github by design
* use Jekyll for templating, so it's more powerful than a static website (e.g. default template with navbar)


## For testing:
### Checkout the source
	$ git clone https://github.com/voidwarranties.github.io/
or from your own forked clone of the repo:
	$ git clone https://github.com/<user>/voidwarranties.github.io.git

### Jekyll setup
Read : https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/
Run the following after installing a standard jekyll install:
	$ sudo apt-get install ruby
	$ sudo bundle install
	$ sudo gem install bundler

### Run your site to test
	$ cd <git repo clone>
	$ bundle exec jekyll serve
Open your browser to http://0.0.0.0:4000

Edit your documents, save, refresh your browser, etc. ...
