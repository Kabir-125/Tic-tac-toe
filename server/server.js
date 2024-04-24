const express = require('express')
const passport = require('passport')
const session = require('express-session')
const bodyParser = require('body-parser');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const cors = require('cors');
const {Server} = require("socket.io");
const http = require("http")
const sequelize = require('./db')
const users = require('./user')
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const transport = nodemailer.createTransport(
nodemailerSendgrid({
     apiKey: "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"
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
        res.status(200).json({message:"Successful login", jwt: jwttoken});
      }
      else{
        res.status(401).json({error:"Incorrect Password"});
      }
  }
  else{
        res.status(401).json({error:"No user found with this email!"});
    }
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
        const newUser = await users.create({
            email: email,
            password: password
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

//socket logic
const players = []
const rooms =[]
io.on("connection",(socket)=>{

  socket.on("start", (data)=>{
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

            io.to(player1).emit('room_assigned', { room, opponent:players[player2].name , playingAs:'O'});
            io.to(player2).emit('room_assigned', { room, opponent:players[player1].name , playingAs:'X'});

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

})

server.listen(5001,()=>{console.log("hi 5001")})
app.listen(5000,()=>{console.log("hi 5000")});