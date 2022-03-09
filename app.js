const WebSocket = require("ws");
const fs = require("fs");

require("dotenv").config();
const pubPassword = process.env.PUB_PASSWD


let subscriptions = [];
let topics = {"default": {
        "pubs": 0,
        "max-pubs": 1,
        "subs": []
        }
};

//retriving the topics.json --Sync--
try{
    let data = fs.readFileSync('./topics.json', {encoding:'utf8', flag:"r"})
    data = JSON.parse(data);
    data.forEach(d => topics[d["name"]] = {"pubs":0, "max-pubs":d["max-pubs"], "subs":[]})
}
catch(e){
    console.log("Retriving topic.json wasn't successful")
    console.log("going with default topic")
}

//creating the two websockets
//for pub
const pub = new WebSocket.Server({
    port:8080
}, ()=>{console.log("Publisher Server is running on port 8080 (internally)")})

//for sub
const sub = new WebSocket.Server({
    port:8181
}, ()=>{console.log("Subscriber Server is running on port 8181 (internally) you should subscribe too ;)")})


let publishersInfo = {};


pub.on('connection', (socket, req)=>{
    //checking publisher password on the handshake
    if(req.headers["pub-password"] != pubPassword){
        socket.terminate();
        return
    }

    socket.send("Connecting to topic...");
    if(req.headers["name"] && topics.hasOwnProperty(req.headers["topic"])){
        if(topics[req.headers["topic"]]["pubs"] >= topics[req.headers["topic"]]["max-pubs"]){
            socket.send("This topic reached it's maximum publishers.");
            socket.terminate();
            return
        }

        publishersInfo[req.headers["name"]] = {"topic": req.headers["topic"]};
        topics[req.headers["topic"]]["pubs"]++;

        socket.send(`Successfuly connected to Topic ${publishersInfo[req.headers["name"]]["topic"]} as Publisher`)
        console.log(`Publisher has been connected to topic ${req.headers["topic"]}`)
    }else{
        socket.send("Topic/name doesn't exist");
        socket.terminate();
    }
    
    socket.on('message', (msg) =>{
        topics[req.headers["topic"]]["subs"].forEach(s => s.send(`[${req.headers["name"]}] ${msg}`))
    })
    //close
    socket.on('close', () =>{
        if(topics.hasOwnProperty(req.headers["topic"]) && req.headers["pub-password"] == pubPassword){
            topics[req.headers["topic"]]["pubs"]--;
            console.log("publisher has been disconnected.")
        }
    })
})

sub.on('connection', (socket, req) =>{
    socket.send("Connecting to Topic....");
    if(req.headers["topic"] && topics.hasOwnProperty(req.headers["topic"])){
        topics[req.headers["topic"]]["subs"].push(socket);
        subscriptions.push(socket);
        
        socket.send(`Connected Successfuly to topic ${req.headers["topic"]}`)
        console.log(`Successful sub connection, to topic ${req.headers["topic"]}`)
    }else{
        socket.send("Topic doesn't exist. Disconnecting....");
        console.log(`Unsuccessful sub connection, to topic ${req.headers["topic"]}`)
    }
})


