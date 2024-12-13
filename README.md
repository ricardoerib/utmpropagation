# UTM PROPAGATOR 

This script helps to is a small and simples solution to propagate utm params in a url for every link in a page.
It is useful when you want to track the source of the traffic in your website.
The solution includes the use of a cookie to store the utm for 24hours and also contemplate the solution for dynamic urls in SPA applications.

## How to use
Add the minified version of the script in the <header> of your page. 
```html
<script src="./utm-propagator.min.js"></script>
```

## How it works
The script will check if there is any utm params in the url, if so, it will store the utm params in a cookie for 24 hours.
Then it will propagate the utm params to every internal link in the page.

## Credits
This script was created by [Ricardo Ribeiro](me@ricardoribeiro.tech)