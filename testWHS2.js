var searchStr = [];
var photos = [];

// A react component for a tag
class Tag extends React.Component {
    render () {
			var removeTag = this.props.onClick;
			var _idNum    = this.props.idNum;
			var _index    = this.props.index;
			var _text     = this.props.text;
			var modtext = _text + "      x";
		return React.createElement('p',
		{className: 'tagText',
		onClick: function onClick(e) {
			return removeTag(e, _idNum, _text)}},
		 modtext);
	 } //render
};
class addTag extends React.Component{
  stopOnclick(event){
    event.stopPropagation();
  }
  render(){
    var addNewTag = this.props.onClick;
    var _idNum = this.props.idNum;

    return React.createElement('div',{id: "tagInput", onClick: this.stopOnclick},
      React.createElement('input',
         {className: "tagInput",
               type: "text",
                 id: _idNum }),

      React.createElement('button',
        {className: "addTag",
           onClick: function onClick(e){
             return addNewTag(e, _idNum)}},
						"+"));
  }
};



// A react component for controls on an image tile
class TileControl extends React.Component {

			constructor(props){
				super(props);
				this.removeTag = this.removeTag.bind(this);
				this.addNewTag = this.addNewTag.bind(this);
				this.state = {tagArray: this.props.tagArray};
			}
			removeTag(event,idNum, tag){
				event.stopPropagation(); //stop second onclick from activating
				let newArray = this.state.tagArray;
				var index = newArray.indexOf(tag);
				dbRemoveTag(idNum, newArray[index]);      //calls function to remove tag from the database
				newArray.splice(index, 1); //remove from array
				this.setState({tagArray: newArray});
			}
			addNewTag(event, idNum){
				event.stopPropagation(); //stop second onclick from activating
 			    var userInput = document.getElementById(idNum).value;
                var newArray = this.state.tagArray;
				userInput = userInput.trim();
				newArray.push(userInput);

				if(userInput != ""){
					dbAddTag(idNum, userInput);
					this.setState({tagArray: newArray});
				}

			}

	    render () {
  			// remember input vars in closure
            var _selected = this.props.selected;
            var _tag = this.props.tagList;
            var _src = this.props.src;
		    var _idNum = this.props.idNum;
            // parse for tags
            var tagArray = _tag.split(",");

				var inputTest = tagArray.indexOf("               ");
				if(inputTest != -1){
					tagArray.split(inputTest, 1);
				}
				var args = [];

				//if first time rendering set the state
				if(typeof this.state.tagArray == 'undefined')
					this.state.tagArray = tagArray;
				//else user may have deleted a tag, so update state
				else
					tagArray = this.state.tagArray;

				args.push('div');
                args.push({className: _selected ? 'selectedControls' : 'normalControls'});

        for(var i = 0; i < tagArray.length; i++){
						args.push(React.createElement(Tag,
										{text: tagArray[i],
										 index: i,
										 idNum: _idNum,
                     onClick: this.removeTag
										}));

				}
				//create the add tag template
				if(tagArray.length != 7){
					args.push(React.createElement(addTag, {idNum: _idNum, onClick: this.addNewTag}));

				}

        return (React.createElement.apply(null, args));
    	} // render */
};


// A react component for an image tile
class ImageTile extends React.Component {

    render() {
	// onClick function needs to remember these as a closure
	var _onClick = this.props.onClick;
	var _index = this.props.index;
	var _photo = this.props.photo;
	var _selected = _photo.selected; // this one is just for readability



	return (
	    React.createElement('div',
	        {style: {margin: this.props.margin, width: _photo.width},
									 className: 'tile',
                   onClick: function onClick(e) {
			    					return _onClick (e,
					     { index: _index, photo: _photo })
								}
					 }, // end of props of div
		 // contents of div - the Controls and an Image
		React.createElement(TileControl,
		    {selected: _selected,
		     src: _photo.src,
				 tagList: _photo.tagList,
				 idNum: _photo.idNum
				}),
		React.createElement('img',
		    {className: _selected ? 'selected' : 'normal',
                     src: _photo.src,
		     width: _photo.width,
                     height: _photo.height
			    })
				)//createElement div
	); // return
    } // render
} // class


// The react component for the whole image gallerysdfsdf
// Most of the code for this is in the included library
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { photos: photos };
		if(this.state.photos.length != 0){
			document.getElementById("landingPage").style.display = "none";
		}
		else{
			document.getElementById("landingPage").style.display = "initial";
		}
    this.selectTile = this.selectTile.bind(this);
  }

  selectTile(event, obj) {
    console.log("in onclick!", obj);
    let photos = this.state.photos;
    photos[obj.index].selected = !photos[obj.index].selected;
    this.setState({ photos: photos });
 }

  render() {
    return (
       React.createElement( Gallery, {photos: this.state.photos,
       onClick: this.selectTile,
       ImageComponent: ImageTile} )
      );
  }
}
function dbAddTag(id, tag){
	console.log("In func addNewTag");
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/query?addTag=" + id + "+" + tag); //build query to add tag @ id
	xhr.send();
}

function dbRemoveTag(id, tag){
	console.log("Want to remove"+tag+ " at " + id);
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/query?remTag=" + id + "+" + tag); //build query remove tag @ id
	xhr.send();
}
/* Finally, we actually run some code */

const reactContainer = document.getElementById("react");
var reactApp = ReactDOM.render(React.createElement(App),reactContainer);

/* Workaround for bug in gallery where it isn't properly arranged at init */
window.dispatchEvent(new Event('resize'));

/*Updates tag based on */
function autoComplete(){

  var userInput = document.getElementById("req-text").value;
	if(userInput.length == 2){
		//make ajax query
		document.getElementById("searchAutocomplete").style.display = 'flex';
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "/query?autocomplete=" + userInput);
		xhr.addEventListener("load", (evt) =>{
			if(xhr.status == 200){
				console.log("autocomplete success");
				updateAutoComplete(JSON.parse(xhr.responseText));
			}
			else{
				console.log("XHR ERROR AT AUTOCOMPLETE", xhr.responseText);
			}

		})
	 xhr.send();
	}
	else if(userInput.length == 0){
		document.getElementById("autoTags").style.display = 'none';
	}
}

function removefromSearch(obj){
	var index = searchStr.indexOf(obj.textContent);
	searchStr.splice(index, 1);
	obj.remove();
}

function updateSearch(obj){
	var tagShelf = document.getElementById("savedTags");
	//var tagShelf = document.createElement("div");
	tagShelf.id = "savedTags";
	var tagEle = document.createElement("p");
	tagEle.id = "tag_save";
	tagEle.textContent = obj.textContent + "    x";
	tagEle.addEventListener('click', function(){return removefromSearch(this)}, false);

	tagShelf.append(tagEle);
	searchStr.push(obj.textContent);
	document.getElementById("req-text").textContent == "";
}
function updateAutoComplete(tagList){
	//display autocomplete div
	var tagShelf = document.getElementById("searchAutocomplete");
	if(document.contains(document.getElementById("autoTags"))){
		document.getElementById("autoTags").style.display = 'initial';
		document.getElementById("autoTags").remove();
	}

	var newShelf = document.createElement("div");
	newShelf.id = "autoTags";

	for(tag in tagList.tags){
		var tagEle = document.createElement("p");
		tagEle.id = "tag_auto";
		tagEle.textContent = tag;
		tagEle.addEventListener('click', function(){return updateSearch(this)}, false);
		newShelf.append(tagEle);
	}
	tagShelf.append(newShelf);
}

//Modifies the searched by part
function searchedBy(){
	if(document.contains(document.getElementById("searchTags"))){
		document.getElementById("searchTags").remove();
	}

	if(document.contains(document.getElementById("searchedText"))){
		document.getElementById("searchedText").remove();
	}
  var searchedText = document.createElement("p");
	searchedText.id = "searchedText";
	searchedText.textContent = "You searched for";

	var searchShelf =	document.createElement("div");
	searchShelf.id = "searchTags";
	for(ind in searchStr){
		var tagEle = document.createElement("p");
		tagEle.id = "searchedTags";
		tagEle.textContent = searchStr[ind];
		searchShelf.append(tagEle);
		console.log("tag in searchedby: " + searchStr[ind]);
	}

	document.getElementById("searchedBy").append(searchedText);
	document.getElementById("searchedBy").append(searchShelf);
}
function updateImages()
{
	//remove tag completion
	if(document.contains(document.getElementById("autoTags"))){
		 document.getElementById("autoTags").remove();
	}
	document.getElementById("searchAutocomplete").style.display = 'none';
	document.getElementById("savedTags").remove();
	var newTags = document.createElement("div");
  newTags.id = "savedTags";
	document.getElementById("searchAutocomplete").prepend(newTags);
//	var reqIndices = document.getElementById("req-text").value;
//	var str = searchStr.join() + ',';
//	reqIndices = str + reqIndices;
  var reqIndices = searchStr.join();
	if (!reqIndices)
		if(searchStr.length == 0)
			 return; // No query? Do nothing!

	console.log("Search string @update images: " + reqIndices);
	searchedBy();

	searchStr = [];
	document.getElementById("landingPage").style.display = "none";


	var xhr = new XMLHttpRequest();
  xhr.open("GET", "/query?keyList=" + reqIndices.replace(/ \s+ |,/g, "+")); // We want more input sanitization than this!

  xhr.addEventListener("load", (evt) => {
    if (xhr.status == 200) {
       reactApp.setState(JSON.parse(xhr.responseText));
			 window.dispatchEvent(new Event('resize')); /* The world is held together with duct tape */
    } else {
        console.log("XHR Error!", xhr.responseText);
    }
  } );
  xhr.send();



}
