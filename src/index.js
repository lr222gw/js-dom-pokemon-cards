// Note: Path needs to start from the root directory...
import {data} from "./data.js"; // Autocomplete: Just export data from data.js, then set script type to module

console.log(data);

//You can start simple and just render a single 
//pokemon card from the first element 
console.log(data[0]); 
var imageDictionaryCache = {}
var imageDictionaryIdCache = {}
var imagePerGame = {}
for(let d in data) 
{
    // data[d].sprites.versions["generation-i"].
    for(let v in data[d].sprites.versions)
    {
        let generation = data[d].sprites.versions[v] 
        for(let g in generation)
        {
            const re = RegExp('.+[0-9]+.png');
            let gamesInString = g.split("-");
            if (re.test(g.split[1]))
                gamesInString = [g.split[0]];

            for(let gg in gamesInString)
            {
                let strippedGameName = gamesInString[gg];
                if( !(strippedGameName in imagePerGame)) 
                    imagePerGame[strippedGameName] = [];

                let gameImages= generation[g]
                for (let imgIndex in gameImages) 
                {
                    if(gameImages[imgIndex] != null && typeof(gameImages[imgIndex]) == typeof(""))
                        imagePerGame[strippedGameName].push(gameImages[imgIndex]);
                }
            }
        }
         
    }
    for(let i = 0; i < data[d].sprites.versions.length; i++)
    {

    }
}

for(let d in data) 
{    
    // Create a card List entry 
    var cardLi = 
        $("<li class=\"card\">")
            // Each entry has a h2, img and a ul tag
            .append(
                 $(`<h2>`)
                    .addClass("card--title")
                    .text(
                        data[d].name[0].toUpperCase() // Capital letter (altough, probably better to do that in css...)
                        + data[d].name.substring(1)
                    )
            )
            .append( // Extension: Part of what game, toggle between images
                $("<label for=\"gamever\">Appears in</label>")
                .text("Appears in:")
                .css("width", "fit-content")
                .css("margin", "0 auto")
                .css("display", "block")
                .append(
                    $("<select id=\"gamever\">").addClass("game_info")
                    .append($.map(data[d].game_indices, 
                        x => {
                            return $("<option>").text(x.version.name)}
                        )
                    ).on("change",  x => 
                    {
                        // imagePerGame[]
                        let selectedGame = x.target.options[x.target.selectedIndex].value.split("-")[0];
                        if(selectedGame in imagePerGame) 
                        {
                            let p = $(x.target.parentElement).next();
                            let strId = `${data[Number(d)].id}`;
                            let url = imagePerGame[selectedGame].find(x => x.slice(-(4 + strId.length)) == `${strId}.png`);
                            onClickImage({target : p[0]},Number(d), url);
                        }
                    }
                    )
                )
            )
            .append(
                $("<img>")
                    .addClass("card--img")
                    .attr("width", 256)
                    .attr("src", data[d].sprites.other["official-artwork"].front_default)
                    .on("click", x=> onClickImage(x,d))
            )
            .append(
                // Each ul contains a number of stats
                $("<ul>").addClass("card--text")
                    .append($.map( data[d].stats, (x) => 
                        {
                            return $("<li>").append(`<p>${x.stat.name.toUpperCase()}: ${x.base_stat}`);
                        }
                    )
                )   
        );

    $(".cards").append(cardLi[0]);
}

function onClickImage(x,d, requestedPath = null)
{
    let imgs = [];
    function recursiveGet(arg, list)
    {
        $.each(arg, b => {
            if (arg[b] != null && typeof(arg[b]) === typeof(""))
                list.push(arg[b]);
            else 
                recursiveGet(arg[b], list)
            return null;
        });
    }
    
    // Get cached image url, to avoid recursive call... 
    if(imageDictionaryCache[data[d].id] == undefined) 
    {
        recursiveGet(data[d].sprites, imgs);
        imageDictionaryCache[data[d].id] = imgs; 
    }
    else 
    {
        imgs = imageDictionaryCache[data[d].id];
    }
    
    // Find the next image, select....
    if(imageDictionaryIdCache[data[d].id] == undefined)
        imageDictionaryIdCache[data[d].id] = 0;

    if (requestedPath != null)
        imageDictionaryIdCache[data[d].id] = imageDictionaryCache[data[d].id].indexOf(requestedPath);

    let currentid = imageDictionaryIdCache[data[d].id];
    let nextId = (currentid+1)%imgs.length;
    x.target.src = imgs[nextId]
    imageDictionaryIdCache[data[d].id] = (nextId+1)%imgs.length;
    //Preload next two images
    for(let j = 1; j <= 2; j++){
        let img = new Image();
        img.src = imgs[(nextId+j)%imgs.length];
    }
    
}