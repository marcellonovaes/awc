
var grp = 0;
var years = new Array;
var keywords = new Array();
var papers = new Array();
var items = new Array();
var count = 0;
var delay = 1000;
var timer;
var btPlay;
var btPause;
var hint;
var iframe;
var yearTo;
var colBreak = 30;
var index=0;
var max = 1;
var groupTo;
var maxFontSize = 100;

function load(){
	count = 0;
	lbGroup = document.getElementById("group");
	//lbGroup.textContent = data[grp].group;

	for(var y= data[grp].iniYear, i=0; y<= data[grp].endYear; y++,i++){
		yearTo.options[yearTo.options.length]= new Option(y, y);
		years[i] = {"keywords":new Array(), "papers":new Array()};
	}

	var csvPapersParsed =  data[grp].csvPapers.split(';');
	csvPapersParsed.shift();
	var ulMaster = document.getElementById("words");
	var ul = document.createElement("ul");
	ulMaster.appendChild(ul);	
	for(var c=0,r=0, i=0; i<csvPapersParsed.length; i++){
		var paper = csvPapersParsed[i].split(',');
		var paperKeyword = paper[0];
		var paperTitle = paper[1];
		var paperYear = parseInt(paper[2]);
		var paperAuthor = paper[3];
		var paperType = paper[4];
		paper = {"keyword":paperKeyword, "title":paperTitle, "year":paperYear, "author":paperAuthor, "type":paperType};
		papers.push(paper);

		years[paperYear- data[grp].iniYear].papers.push(paper);

		for(var f=0, j=0; j<keywords.length; j++){
			if(paperKeyword == keywords[j].tag){
				keywords[j].papers.push(paper);
				f=1;
				break;
			}
		}
		if(f==0){
			keywords.push({"tag":paperKeyword, "papers":new Array()});
			if(r == colBreak){
				r = 0;
				c++;
				ul = document.createElement("ul");
				ulMaster.appendChild(ul);
			}
			var li = document.createElement("li");
			li.setAttribute("onclick","javascript:showHint('"+paper.keyword+"')");
			li.setAttribute("row",r);
			li.setAttribute("col",c);
			li.appendChild(document.createTextNode(paper.keyword));
			papers[i].li = li;
			paper.li = li;
			ul.appendChild(li);
			items.push(li);
			r++;
			index++;
		}

	}

	for(var i=0; i<years.length; i++){
		for(var j=0; j<years[i].papers.length; j++){
			var word = years[i].papers[j].keyword;
			var f=0;
			for(var k=0; k<years[i].keywords.length; k++){
				if(word == years[i].keywords[k].tag){
					f=1;
					years[i].keywords[k].weight++;
					break;
				}
			}
			if(f == 0){
				for(z=0; z<items.length; z++){
					if(word == items[z].innerHTML){
						years[i].keywords.push({"tag":word, "weight":1, "li":items[z]});
					}
				}
			}
		}
	}

	max = 1;
	for(var i=0; i<years.length; i++){
		var tags = years[i].keywords;
		for(var j=0; j<tags.length; j++){
			if(max < tags[j].weight){
				max = tags[j].weight;
			}
		}
	}

	for(var i=0; i<papers.length; i++){
		for(var j=0; j<keywords.length; j++){
			if(papers[i].keyword == keywords[j].tag){
				keywords[j].papers.push(papers[i]);
				break;
			}
		}
	}

}

function printKeywords(){
	for(var i=0; i<keywords.length; i++){
		console.log(i+":"+keywords[i].tag);
		console.log(keywords[i].papers);
	}
}

function play(){
	cleanHint();
	btPause.style.display="block";
	btPlay.style.display="none";

	timer = setInterval(function() {
		if(count == years.length) count = 0;
		plotYear();
	},  delay);
}

function pause(){
	btPause.style.display="none";
	btPlay.style.display="block";
	clearInterval(timer);
}

function goTo(){
	pause();
	cleanHint();
	count = parseInt(yearTo.value) -  data[grp].iniYear;
	plotYear();
}

function plotYear(){

	document.getElementById("words").style.width = parseInt(document.getElementById("info").clientWidt)-30;

	if(window.innerWidth < 650){
		lbGroup.textContent = null;
		maxFontSize = 50;
	}else{
		lbGroup.textContent = data[grp].group;
		maxFontSize = 100;
	}

	yearTo.selectedIndex = count;
	
	count++;

	var year = years[count-1];
	
	var tags = year.keywords;

	for(var i=0; i<items.length; i++){
		items[i].style.fontSize = 0;
	}
	
	for(var i=0; i<tags.length; i++){
		var item = tags[i].li;
		var weight = tags[i].weight;
		var size = Math.ceil(maxFontSize*weight / max);
		if(weight == 1) size =10;
		item.style.fontSize = size;
		var r = parseInt(item.getAttribute('row'))
		var c = parseInt(item.getAttribute('col'));
		item.style.color = Math.ceil(c/r) * parseInt(size,16)+130;
	}
}

function showHint(tag){
	pause();
	var x = event.clientX;     
	var y = event.clientY;   

	var w = window.innerWidth;
	var h = window.innerHeight;

	var year =  data[grp].iniYear + count -1;
	var html = "<h1>"+tag+"</h1>";


	var year = years[count-1];
	var papers = year.papers;

	var h=50;
	for(var i=0; i<papers.length; i++){
		if(papers[i].keyword == tag){
			h+=90;
	html += "<ul>";
			html += "<li>"+papers[i].title;
			html += "<br><b><i>"+papers[i].author+"</i></b></li>";
	html += "</ul>";
		}
	}
	hint.style.height = h+"px";


	var w = Math.ceil(0.3*window.innerWidth);
	w+=tag.length*5;
	hint.style.width = w+"px";

	fixHintPos(x,y,tag.length);
 
	hint.contentWindow.document.open();
	hint.contentWindow.document.write(html);
	hint.contentWindow.document.close();


	hint.style.display = "block";
}

function fixHintPos(x,y,p){
	
	var mx = x;    
	var my = y;  

	var ww = parseInt(window.innerWidth)-20;
	var wh = parseInt(window.innerHeight)-15;

	var iw = parseInt(hint.contentWindow.innerWidth);
	var ih = parseInt(hint.contentWindow.innerHeight);

	if(iw == 0){
		iw = Math.ceil(0.3*parseInt(window.innerWidth))+p*5;
	}

	var xr = true;
	var yi = true;
	
	if(ww < (mx+iw))xr = false;
	if(wh < (my+ih))yi = false;


	var maxX = ww - iw;
	var maxY = wh - ih;

	if(!xr) 	x = maxX;

	if(!yi) 	y = maxY;

	hint.style.left = x + "px";
	hint.style.top = y+'px';
	
}

function cleanHint(){
	hint.style.display = "none";
}

function changeGroup(){
	pause();
	grp = groupTo.value;
	load();
	play();
}

document.addEventListener( "DOMContentLoaded", function() {
 	btPlay = document.getElementById("play");
 	btPause = document.getElementById("pause");
	yearTo = document.getElementById("yearTo");
	groupTo = document.getElementById("lab");
	hint = document.createElement('iframe');
	hint.setAttribute("class", "hint");
	hint.style.display = "none";
	document.body.appendChild(hint);
	load();
	play();	
});


