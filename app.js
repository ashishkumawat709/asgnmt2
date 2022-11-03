const express = require('express')
const app = express()
const path = require("path");
const validator = require('validator');
const bodyParser = require('body-parser')
const ejs = require('ejs');

const port = process.env.PORT || 3000;

const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.json());  // recognize the incoming Request object as a JSON object
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './templates/views'))

const mongoose = require("./db/conn");
const  personData  = require("./models/schema.js");

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req,res)=>{
  res.render('home')
})

app.get('/register', (req, res) => {
  // res.sendFile(path.join(__dirname, 'register.html'))
  res.render('register')
})

app.get('/login',(req,res)=>{
  res.render('login')
})

app.post('/register', async (req, res) => {
  await personData.exists({ email: req.body.email }, (err, rst) => {
    if (err) {
      console.log(err)
    }
    else if (rst != null) {
    return res.status(400).json({ response: 'Email is already exist and change your email' });
    }
  });
  if (!validator.isAlpha(req.body.first_name)) {
    return res.status(400).json({ response: 'Invalid first name' });
  }
  if (!validator.isAlpha(req.body.last_name)) {
    return res.status(400).json({ response: 'Invalid last name' });
  }

  if (!validateMobileno(req.body.phone_no)) {
    return res.status(400).json({ response: 'Invalid mobile no' });
  }

  if (!validator.isEmail(req.body.email)) {
    return res.status(400).json({ response: 'Invalid Email' });
  }

  if (!validator.isAlpha(req.body.city)) {
    return res.status(400).json({ response: 'Enter valid city' });
  }

  if (!validator.isAlpha(req.body.state)) {
    return res.status(400).json({ response: 'Enter valid state' });
  }
  if (!validator.isAlpha(req.body.country)) {
    return res.status(400).json({ response: 'Enter valid country' });
  }

  if (!validateUsername(req.body.login_id)) {
    return res.status(400).json({ response: 'Invalid username' });
  }
  if (!validator.isStrongPassword(req.body.password, { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
    return res.status(400).json({ response: 'Invalid password' });
  }

  const user = {
    name: req.body.first_name,
    email: req.body.email
  }
  let datainfo = new personData(req.body);
  await datainfo.save();
  res.render('room.ejs', {
    user: user
  })
});

app.post('/login', async(req,res)=>{
  try {
              const {email,password} = req.body;
              const result = await personData.findOne({email:email})
              if(result !=  null){
                  if(result.email == email && result.password == password){
                      res.send(`<h1>dashboard....${result}</h1>`)
                  }else{
                      res.send('<h1>invalid user login</h1>')
                  }
              }else{
                  res.send('<h1>user not registerd</h1>')
              }
          } catch (error) {
              console.log(error);
          }
      
})


let users = [];         
const adminNamespace = io.of('/admin');
adminNamespace.on("connect", (socket) => {
  let room;
  socket.on('join', (data) => {
    let result;
    let name = data.client_name;
    let email = data.client_email;
    room = data.room;
    let socketId = socket.id;

    socket.join(room);
    console.log(`${name} is connected ${email}`);
    let userInfo;


    personData.findOne({ email: email }, { password: 0, date: 0, _id: 0 }, (err, rst) => {
      if (err) throw err;
      result = rst;
      userInfo = {
        user_data: result,
        socketId: socketId,
      }
      users.push(userInfo);
      adminNamespace.in(room).emit('userInfo', users);
    })
  });

});

app.get('/view', (req, res) => {
  personData.find({}, (err, result) => {
    if (err) throw err;
    res.render('table', {
      dataList: result
    })
  })
})


// Validates a username
function validateUsername(username) {
  return !validator.isEmpty(username) && validator.isAlphanumeric(username) && validator.isLength(username, { min: 6, max: 32 });
}

//validates a mobile no
function validateMobileno(mobileno) {
  return !validator.isEmpty(mobileno) && validator.isMobilePhone(mobileno, 'any') && validator.isLength(mobileno, { min: 10, max: 14 });
}
server.listen(port, () => {
  console.log(` listening on port ${port}`)
})