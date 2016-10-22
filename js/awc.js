
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
var flagPause = false;
var small = false;
var lbGroup;
var btPlayPause;
var data;

function load(){

	count = 0;
	
 	btPlayPause = document.getElementById("playpause");
	yearTo = document.getElementById("yearTo");
	groupTo = document.getElementById("lab");


	lbGroup = document.getElementById("group");

	yearTo.options = new Array();
	for(var y= data[grp].iniYear, i=0; y<= data[grp].endYear; y++,i++){
		yearTo.options[i]= new Option(y, y);
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
				for(var z=0; z<items.length; z++){
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
	flagPause = false;
	cleanHint();

	timer = setInterval(function() {
		if(count == years.length) count = 0;
		plotYear();
	},  delay);
}

function pause(){
	flagPause = true;
	clearInterval(timer);
}

function playPause(){
	if(flagPause){
		play();
	}else{
		pause();
	}
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
		small = true;
	}else{
		lbGroup.textContent = data[grp].group;
		maxFontSize = 100;
		small = false;
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
		var color = parseInt(11*r + 29*c + size,16)+200;
		item.style.color = color;
	}
}

function initHint(){
	hint = document.createElement('iframe');
	hint.setAttribute("class", "hint");
	hint.setAttribute("id", "hint");
	hint.style.display = "none";
	document.body.appendChild(hint);
	
	var html = "<html><head></head><body></body></html>";
	hint.contentWindow.document.open();
	hint.contentWindow.document.write(html);
	hint.contentWindow.document.close();
	var head  = hint.contentWindow.document.getElementsByTagName('head')[0];
    var link  = hint.contentWindow.document.createElement('link');
    link.id   = 'hintCSS';
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = 'css/hint.css';
    link.media = 'all';
    head.appendChild(link);
}

function showHint(tag){
	pause();
	var x = event.clientX;     
	var y = event.clientY;   

	var w = window.innerWidth;
	var h = window.innerHeight;

	var year =  data[grp].iniYear + count -1;
	var html = "<bold><h2>"+tag+"&nbsp;&nbsp;&nbsp;<img height=30 width=30 class=\"close\" onclick=\"javascript:parent.document.getElementById('hint').style.display='none';\" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AABcVElEQVR42u2de5gcVZn/ezI9mZ7O2ECSycw57/ueU9Xdc8lkkkkyCQkx0VGDiDcQvLCusOLqgqLgBV1UvC2uF0RFXUV/q7K6oiIuiquIt3W94wVYEBVEvAMCAnKHXH9/pGooQtJdM9Pddarq28/Tj3/Y+Qz1vu85329VnfOeQgEffPDBBx988MFntp+tW6e7tm6dXhD5doEHHnjggQceeOnizfaPd+/9BQ888MADDzzw0sWbresobt063RP5FufqPsADDzzwwAMPvM7z5vLHe7ZunV4Y+fbM82LAAw888MADD7wO8ubyx3u3bp0uRb6987wY8MADDzzwwAOvg7y5/PHS1q3TfZFvaZ4XAx544IEHHnjgdZAXMuP+cMHWrdPlrVunF0W+5a1bpxfM8Q+DBx544IEHHnid53UFiwYXxP3ji7Zune6PfBfN82LAAw888MADD7zO8sIFhM0NQOSPVyLf/nleTD944IEHHnjggddRXldk10BjAxD8uBz5Dzgg+N/5XEzIOQA88MADDzzwwOsIL1xAuDBiALoa/bgUefRQQbDBAw888MADL5W8cNfAjAFo5hT69nr3gGCDBx544IEHXrp45ciugYVbt04Xm70jKEUMwCIEGzzwwAMPPPBSxws1PDQAPY0e/RcDhxAagDKCDR544IEHHnip40V3DfQ1bBoULAroiRiAEoINHnjggQceeKnkVSIGoNRs0V/UAMynXSGSBx544IEHHnjJ8kIDUG6o58E/6o7sEYT4gwceeOCBB156eZVYa/giBqAI8QcPPPDAAw+81PPi7d6LGACIP3jggQceeODlhTfPE4UQbPDAAw888MBLOQ/BAQ888MADDzyIP4IDHnjggQceeBB/BBs88MADDzzwIP4INnjggQceeOBB/MEDDzzwwAMPPIg/eOCBBx544IHnovjH3v2HYIMHHnjggQdeJnhh6//YTYL6EWzwwAMPPPDAS734F2MZgMh5whUEGzzwwAMPPPBSLf7heT+NDUDw43Jw919BsMEDDzzwwAMvteLfG5z229Ow9X/w41Jw998fOVsYwQYPPPDAAw+8dPFKwXfGADRzCn0RA9CPYIMHHnjggQde6njlQM9DA1Bs9o6gFDEAixBs8MADDzzwwEsdL9Tw0AD0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'>";


	var year = years[count-1];
	var papers = year.papers;

	var h=50;
	for(var s=1, i=0; i<papers.length; i++){
		if(papers[i].keyword == tag){
			h+=90;
			html += "<ol><li><span>"+s+".</span><p>"+papers[i].title+". <br><b><i>"+papers[i].author+"</i></b></p></li></ol>";
			s++;
		}
	}
	
	var body  = hint.contentWindow.document.getElementsByTagName('body')[0];
	body.innerHTML = html;
	


	if(small){
		h *= 1.5;
		w = window.innerWidth * 0.95 -5;
		x=5;
		y=80;
	}else{
		var w = Math.ceil(0.3*window.innerWidth);
		w+=tag.length*10;
	}
		
	hint.style.height = h+"px";

	hint.style.width = w+"px";

	fixHintPos(x,y,tag.length);
 
	hint.style.display = "block";
}

function closeHint(){
		hint.style.display = "none";
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
	initHint();
	load();
	play();	
});


