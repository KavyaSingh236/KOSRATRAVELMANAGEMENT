const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const FormDataModel = require ('./models/FormData');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/practice_mern');

// Define a basic GET route for the server root
app.get('/', (req, res) => {
    res.send("Server is running");
});

app.post('/signup', (req, res) => {
  const {name,email, password} = req.body;
  FormDataModel.findOne({email: email})
  .then(user => {
      if(user){
          res.json("Already registered")
      }
      else{
          FormDataModel.create(req.body)
          .then(log_reg_form => res.json(log_reg_form))
          .catch(err => res.json(err))
      }
  })
});

app.post('/signin', (req, res) => {
  const {name, password} = req.body;
  FormDataModel.findOne({name:name})
  .then(user => {
      if(user){
          // If user found then these 2 cases
          if(user.password === password) {
              res.json("Success");
          }
          else{
              res.json("Wrong password");
          }
      }
      // If user not found then 
      else{
          res.json("No records found! ");
      }
  })
});

app.listen(3000, () => {
    console.log("Server listining on http://127.0.0.1:3000");
});
