const express = require('express')
const passport = require('passport')
const session = require('express-session')
const bodyParser = require('body-parser');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
var userJwt ='';
const cors = require('cors');
const {Server} = require("socket.io");
const http = require("http")
const sequelize = require('./db')
const users = require('./user')
const games = require('./games')
const gamesPerDay =  require('./gamesPerDay')
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const transport = nodemailer.createTransport(
nodemailerSendgrid({

  })
);

const app = express()


//middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(cors());

const server= http.createServer(app);
const io = new Server(server,{
  cors:{
    origin:"http://localhost:3000"
  }
})
// Loging a user and return a JWT token
const jwtMethod = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'Amar secret key'
  };
  
passport.use(new JwtStrategy(jwtMethod, (jwtData, done) => {
  
    if (jwtData.sub ) {
        done(null, { id: jwtData.sub });
      } else {
        done(null, false);
      }
  }));

app.post('/api/login',async (req,res)=>{
  const {email, password} = req.body;
  const cur_user = await users.findOne({where:{email:email}});
  console.log(cur_user)

  if (cur_user!== null){
      if(email === cur_user.email && password === cur_user.password){
        // Login successful
        const jwttoken = jwt.sign({ sub: email }, 'Amar secret key');
        cur_user.jwt = jwttoken;
        userJwt = jwttoken;

        await cur_user.save();
        res.status(200).json({message:"Successful login", jwt:jwttoken});
      }
      else{
        res.status(401).json({error:"Incorrect Password"});
      }
  }
  else{
        res.status(401).json({error:"No user found with this email!"});
    }
})

app.get('/api/getjwt',(req,res)=>{
  res.status(200).json({jwt:userJwt});
})
// registering a new user
app.post('/api/register',async (req,res)=>{
    const {email, password, repassword} = req.body;
    
    var found = await users.findOne({where:{email:email}});

    if(password !== repassword){
        res.status(401).json({error:"Both password should match"});
    }
    else if (found!==null){
        res.status(401).json({error:"User exits !!!"});
    }
    else{
      //verification 
      const code=parseInt(Math.random()*10000);
      console.log(code);
      transport.sendMail({
        from: 'kabir73826@gmail.com',
        to: `User Client <${email}>`,
       subject: 'Confirm your e-mail',
       html: `<html>
                <head>
                  <style type="text/css">
                    body, p, div {
                      font-family: Helvetica, Arial, sans-serif;
                      font-size: 16px;
                    }
                  </style>
                  <title></title>
                </head>
                <body>
                <center>
                  <p>
                    <strong>Your Tic-tac-toe account verification code is: ${code}</strong>
                  </p>
                </center>
                </body>
              </html>`
     });
      res.status(200).json({sent:code});
    }
})

app.post('/api/verifiedRegister',async (req,res)=>{
  const {email, password} = req.body;
  try {
        sequelize.sync()
        .then(() => {
            console.log('Database synchronized');
        })
        .catch(err => {
            console.error('Error synchronizing database:', err);
        });
        const jwttoken = jwt.sign({ sub: email }, 'Amar secret key');
        const newUser = await users.create({
            email: email,
            password: password,
            jwt:jwttoken
        });
        res.status(200).json({ message: "User successfully added."});
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: "Error adding user." });
    }
})

// game section veryfying through jwt
app.post('/api/game',passport.authenticate('jwt', { session: false }),(req,res)=>{
  const token = req.headers.authorization.split(' ')[1]; 
  const decodedToken = jwt.decode(token);
  const userEmail = decodedToken.sub;

    res.status(200).json({verified:"yes", email:userEmail});
})

// get games details played by user on each days
app.post('/api/gameDay',async (req,res)=>{
  const {email} = req.body;
  if(email){
    const usersday = await gamesPerDay.findAll({where:{email:email}})
    res.status(200).json(usersday);
  }
  else
    res.status(404).json(null)

})

//api for custom db query result
app.post('/api/dbquery',async (req,res) => {
    const {type,by} =req.body;
    if(type === 'user'){
      const data = await users.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('email')), 'count'],
          by.by
        ],
        group: by.by,
        order:[ by.by]
      });
      
      res.status(200).json(data);
    }
    else if( type === 'game'){
      const data = await users.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('gamesPlayed')), 'count'],
          by.by
        ],
        group: by.by,
        order: [by.by]
      });

      res.status(200).json(data);
    }
    else if( type === 'win'){
      const data = await users.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('gamesPlayed')), 'played'],
          [sequelize.fn('SUM', sequelize.col('gamesWon')), 'won'],
          by.by
        ],
        group: by.by,
        order: [by.by]
      });

      
      res.status(200).json(data);
    }

})


//socket logic
const players = []
const rooms =[]
io.on("connection",(socket)=>{

  socket.on("start", async (data)=>{
    players[socket.id] = {state: "Waiting",
                          name: data.playerName
                            }
    const waitingPlayers = Object.keys(players).filter((i) => players[i].state === 'Waiting');

        if(waitingPlayers.length>=2){
          while (waitingPlayers.length >= 2) {
            var index = parseInt(100000000*Math.random())%waitingPlayers.length;
            const player1 = waitingPlayers[index];
            waitingPlayers.splice(index,1);

            var index2 = parseInt(Math.random()*10000)%waitingPlayers.length;
            const player2 = waitingPlayers[index2];
            waitingPlayers.splice(index2,1);


            const room = 'room-' + Math.random().toString(36).substr(2, 5);
            rooms[room] = [player1, player2];
            players[player1].room = room;
            players[player2].room = room;

            const newGame = await games.create({
                                                  room:room,
                                                  player1:players[player1].name,
                                                  player2:players[player2].name
                                                })
            io.to(player1).emit('room_assigned', { room, opponent:players[player2].name , playingAs:'O', id:newGame.id});
            io.to(player2).emit('room_assigned', { room, opponent:players[player1].name , playingAs:'X', id:newGame.id});

            players[player1].state = "playing";
            players[player2].state = "playing";
        }
        
      }
  })

  socket.on("move",({nextCells, nextMoves, room})=>{
    var p1,p2;
    p1=rooms[room][0];
    p2=rooms[room][1];
    io.to(p1).emit('moveReply', { nextCells, nextMoves });
    io.to(p2).emit('moveReply', { nextCells, nextMoves });
    
  })

  socket.on("game_over",async (data)=>{

    const game = await games.findByPk(data.id);
    
    if(rooms[data.room]){
      delete rooms[data.room];
      game.winner=data.winner;
      await game.save();

      //game result update
      const player1 = await users.findOne({where:{email:data.player1}})
      const player2 = await users.findOne({where:{email:data.player2}})
      
      
      player1.gamesPlayed = player1.gamesPlayed+1;
      if(data.winner===data.player1)
        player1.gamesWon++;

      player2.gamesPlayed = player2.gamesPlayed+1;
      if(data.winner===data.player2)
          player2.gamesWon++;

      
      await player1.save()
      await player2.save()

      
      //player stat update per day
      const today = new Date();
      var player1stat = await gamesPerDay.findOne({
                                                    where:{
                                                      email:data.player1,
                                                      date:today
                                                    }})
      if(player1stat == null ){
        player1stat = await gamesPerDay.create({email:data.player1,date:today})
      }
      var player2stat = await gamesPerDay.findOne({
                                                    where:{ 
                                                      email:data.player2, 
                                                      date:today
                                                    }})
      if(player2stat == null ){
        player2stat = await gamesPerDay.create({email:data.player2,date:today})
      }

      
      player1stat.played++;
      player2stat.played++;
      if(data.winner===data.player1){
        player1stat.won++;
        player2stat.lost++;
      }
      else if(data.winner === data.player2){
        player2stat.won++;
        player1stat.lost++;
      }
      else{
        player1stat.draw++;
        player2stat.darw++;
      }

      await player1stat.save();
      await player2stat.save();
    }
  })

  //if one player gets disconnected
  socket.on('disconnect',()=>{
    var room;
    if(players[socket.id])
      room = players[socket.id].room;
    if(room && rooms[room]){
      const [p1,p2] = rooms[room] ;
      io.to(p1).emit('gone');
      io.to(p2).emit('gone');
      
      
      delete players[p1];
      delete players[p2];
    }
    else
      delete players[socket.id];
    
    
  })
})

server.listen(5001,()=>{console.log("hi 5001")})
app.listen(5000,()=>{
  console.log("hi 5000")
});