const express = require('express')
const passport = require('passport')
const session = require('express-session')
const bodyParser = require('body-parser');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const cors = require('cors');

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

// Loging a user and return a JWT token
let user_list=[{ email: 'ishtiak125@gmail.com', password: 'rt' }];
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

app.post('/api/login',(req,res)=>{
  const {email, password} = req.body;
  var cur_user;
  var found = false;

  console.log(user_list);
    user_list.forEach(user => {
      if(email === user.email){
        found = true;
        cur_user=user;
      }
    });
  if (found){
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
app.post('/api/register',(req,res)=>{
    const {email, password, repassword} = req.body;

    var found = user_list.find(user => email === user.email);

    if(password !== repassword){
        res.status(401).json({error:"Both password should match"});
    }
    else if (found){
        res.status(401).json({error:"User exits !!!"});
    }
    else{
      //verification 
      const code=parseInt(Math.random()*10000);
      transport.sendMail({
        from: 'kabir73826@gmail.com',
        to: `User Client <${email}>`,
       subject: 'Confirm your e-mail',
       html: `<h1>your confirmation code is ${code}</h1>`
     });
      res.status(200).json({sent:code});
    }
})

app.post('/api/verifiedRegister',(req,res)=>{
  const {email, password} = req.body;
  user_list.push({
    "email":email,
    "password":password
  });
  res.status(200).json({message:"User successfully added."});
})

// game section veryfying through jwt
app.post('/api/game',passport.authenticate('jwt', { session: false }),(req,res)=>{
    res.status(200).json({verified:"yes"});
})

app.listen(5000,()=>{console.log("hi 5000")});