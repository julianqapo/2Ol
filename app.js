const express = require("express")
const app = express()
const path = require("path")
const fs = require("fs")
const users = require("./users")
const lookPretty = require("js-beautify")

const port = process.env.PORT || 8080






// serving static files
app.use(express.static("vie"))


app.set("view engine", "ejs")

//handle post request
app.use(express.urlencoded({extended : false}))

//change views location
app.set("views",path.join(__dirname, "vie") )
app.get("/", (req,res)=> res.render("years", {users : users}))
app.get("/:id", (req,res)=> {
    
    Object.keys(users).filter(e=>{
        if (req.params.id.trim() == e){
            res.render("index",{users : users[e],
            year : e,
            url : req.params.id} )
            console.log(e)
        }
    })
    
})

//adding new year

app.post("/addyear", (req,res)=>{
    //from
    let year = req.body.year
    let x = Object.keys(users)
    let last = x[x.length -1]
    if (year == Number(last) +1){
        users[year] = users[last]
        users[year].forEach(e=>{
            e[0] = ""
            e[1] = ""
            e[2] = ""
            e[3] = ""
            e[4] = ""
            e[5] = ""
            e[6] = ""
            e[7] = ""
            e[8] = ""
            e[9] = ""
            e[10] = ""
            e[11] = ""
        })
    let z = JSON.stringify(users)
    fs.writeFileSync("users.json", lookPretty(z))
    res.render("years", {users : users})
    } else{
        res.send("you have added incorrect year")
    }   
})



//adding user



app.get("/:id/adduser", (req,res)=>{
    res.render("addUser", {url : req.params.id})
    res.end
})

app.post("/:id/adduser", (req,res)=>{
    
        let user = {
        name : req.body.name,
        number : req.body.number,
        username : req.body.username,
        password : req.body.password,
        type : req.body.type,
        0 : "",
        1 : "",
        2 : "",
        3:"",
        4 : "",
        5: "",
        6 : "",
        7 :"",
        8 : "",
        9 : "",
        11 : "",
        12 : ""
        }
        // to mikrotik 
        toAdd()
        //to here 
        let year = req.params.id.trim()
        users[year].push(user)
        let finalusers = JSON.stringify(users)
        res.render("addedsuc", {user : user,
                                url : req.params.id.trim()})
        fs.writeFileSync("users.json", lookPretty(finalusers))
        
    })

    //edit user month payment
    app.post("/:id/",(req,res)=>{
        let url = req.params.id.trim()
        let month = req.body.month
        let user = req.body.name
        let amoun = req.body.amount
        console.log("im url :"+url)
        console.log("im amount :"+amoun)
       // console.log(users[2019])
        let z = users[url].filter(e=>e.name ==user.trim())
       // console.log("im user :"+z[0].name)
       // console.log(month)
       // console.log(user)
        z[0][month] = amoun
        let finalusers = JSON.stringify(users)
        fs.writeFileSync("users.json", lookPretty(finalusers))

        //copy to d:
        fs.writeFileSync("d:/users.json", lookPretty(finalusers))

        //console.log(z[0].month)
        res.render("index",{url : url, users : users[url]})
        console.log(url)
        toDisconnect()
    })
    //to here

    /*
    users.push(user)
    console.log(user)
    let finalusers = JSON.stringify(users)
    res.render("addedsuc", {user : user})
    fs.writeFileSync("users.json", finalusers)
    */

    //rename name, number, user and pass
    app.get("/:id/:iu/", (req,res)=>{
        let year = req.params.id
        let username = req.params.iu
        let userTaget = users[year].filter(e=>e.username == username.trim())
        let userTaget2 = userTaget[0]
        if (userTaget2){
            res.render("rename", {year : year,
                                user : userTaget2.name,
                                number : userTaget2.number,
                                username : username,
                                password : userTaget2.password,
                                type : userTaget2.type})
        }
    })

    app.post("/:id/:iu/", (req,res)=>{
        let year = req.params.id
        let username = req.params.iu
        console.log(username)
        let year2 = year
        let name = req.body.name
        let number = req.body.number
        let password = req.body.password
        let type = req.body.type
        let userTaget = users[year].filter(e=>e.name == username.trim())
        console.log(userTaget)
        userTaget[0].name = name
        userTaget[0].number = number
        userTaget[0].password = password
        userTaget[0].type = type
        let finalusers = JSON.stringify(users)
        fs.writeFileSync("users.json", lookPretty(finalusers))
        console.log(userTaget[0].type)
        console.log(year)
        var dt = new Date();
        let yyy = dt.getYear() 
        console.log(yyy)
        res.render("renameDone",{yyy : yyy,
                            name : name,
                            number : number,
                            type : type,
                            password : password,
                            username : username})
    })


//from here 
const Client = require('ssh2').Client;
function toDisconnect(){

const date = new Date
const year = date.getFullYear()
const month = date.getMonth()
console.log(month)
const conn = new Client();
conn.on('ready', function() {
  console.log('Client :: ready');
  users[2019].forEach(e=>{
     if (e[month] == ""){
             conn.exec(`ppp secret disable [find name=${e.username}]`, data=> console.log("disabled")) 
          } else {
            conn.exec(`ppp secret enable [find name=${e.username}]`, data=> console.log("active"))
              }
   //conn.exec(`ppp secret add name=${e.username}`, data=> console.log("added"))
  })
}).connect({
  host: '192.168.93.93',
  port: 22,
  username: 'admin',
  password : "",
  privateKey: require('fs').readFileSync('./key.ppk')
});
}

// to here

// fro here function to add to mikrotik
function toAdd(){
    let date = new Date
    let year = date.getFullYear()
    const conn = new Client();
    conn.on('ready', function(user) {
      console.log('Client :: ready');

      users[year].forEach(e=>{
      conn.exec(`ppp secret add name=${e.username} password=${e.password} service="pppoe" profile=${e.type} comment= "${e.name} ${e.number}"`, data=> console.log("added"))
      //set
      conn.exec(`ppp secret set [find name="${e.username}"] password="${e.password}" profile="${e.type}" comment="${e.name} ${e.number}"`, data=>console.log("done"))
      })
    }).connect({
      host: '192.168.93.93',
      port: 22,
      username: 'admin',
      password : "",
      privateKey: require('fs').readFileSync('./key.ppk')
    });
    }
//to here

app.listen(port, ()=> console.log(`listening to port : ${port}`))

toDisconnect()
toAdd()