let currentSong = new Audio;
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) { //client side project
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="/img/music.svg" alt="">
                             <div class="info">
                                 <div> ${song.replaceAll("%20", " ")} </div>
                                 <div>Artist</div>
                             </div>
                             <div class="playNow">
                                 <span>Play Now</span>
                                 <img class="invert"  src="/img/play.svg" alt="">
                             </div></li>`;
    }
    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    });
    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio ("/songs/" + track);
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        p.src = "/img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}
async function displayAlbum() {
    let a = await fetch(`/songs`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardOne = document.querySelector(".cardOne");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = (e.href.split("/").slice(-2)[0]);
            // Get the metadata of folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardOne.innerHTML = cardOne.innerHTML + `  <div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="/img/play.svg" alt="">
                        </div>
                        <img class="pic" src="/songs/${folder}/cover.jpeg" alt="">
                        <h4>${response.title}</h4>
                        <p>${response.description}</p>
                    </div>`
        }
        // Load the playlist whenever the folder is click
        Array.from(document.getElementsByClassName(" card")).forEach((e) => {
            e.addEventListener("click", async item => {
                songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0])
            })
        })
    }

}
async function main() {

    //get the list of all songs
    await getsongs("songs/ncs");
    playMusic(songs[0], true)

    //display all album on the page
    displayAlbum();

    //attach an event listener to play,previous and next buttons
    p.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            p.src = "/img/pause.svg"
        }
        else {
            currentSong.pause();
            p.src = "/img/play.svg"
        }
    })
    //listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })
    //add an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })
    //  Add an event elistener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    // Add an event listener to close 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })
    // Add an event listener to previous 
    pr.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    // Add an event listener to next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    // Add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })
    // Add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        console.log(e.target)
        if (e.target.src.includes("/img/volume.svg")) {
            e.target.src = e.target.src.replace("/img/volume.svg", "/img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("/img/mute.svg", "/img/volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 30;
        }
    })

}

main();