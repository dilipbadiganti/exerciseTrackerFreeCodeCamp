const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const { Schema } = mongoose 
require('dotenv').config()

mongoose.connect(process.env.MONGO_URL)

//user - schema
const UserSchema = new Schema({
  username: { type: String, required: true }

})
const User = mongoose.model("User", UserSchema)

// exrercise schema
const ExerciseSchema = new Schema({

  user_id: {type: String, required: true},
  description: String,
  duration: Number,
  date: {type: Date, default: Date.now}
  
})
const Exercise = mongoose.model("Exercise", ExerciseSchema)



app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



app.get('/api/users', async (req, res)=>{
  try{
    const users = await User.find({})
    res.json(users)
  }catch(err){

    res.json({err: err.message})
  }
})

app.post('/api/users', async(req, res) => {
  // const username = req.
  console.log(req.body);

  const userObj = new User({
    username: req.body.username  
  })

  try{

    const user = await userObj.save()
    console.log(user)
    res.json(user)
  
  }catch(err){
    
    console.log(err)
    
  }

});



app.post('/api/users/:_id/exercises', async (req, res)=>{

  const id = req.params._id
  const { description, duration, date } = req.body


  try{
    const user = await User.findById(id)
    if(!user){
      res.send("user not found")
    }else{
      const exrObj = new Exercise({
        user_id: id,
        description,
        duration,
        date : date ? new Date(date) : new Date()  
    })
      
      const exercise = await exrObj.save()
      res.json({
        _id: user._id,
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      })
    }
  }catch(error){
    consle.log(error)
    res.send("error saving..")
  }
})


app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const id = req.params._id;

    const user = await User.findById(id);

    if (!user) {
      res.send("User not found");
    } else {
      // Query exercises for the user
      let query = { user_id: id };

      if (from || to) {
        query.date = {};
        if (from) query.date.$gte = new Date(from);
        if (to) query.date.$lte = new Date(to);
      }

      let exercises;
      if (limit) {
        exercises = await Exercise.find(query).limit(parseInt(limit));
      } else {
        exercises = await Exercise.find(query);
      }

      // Prepare response
      const logs = exercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
      }));

      res.json({
        _id: user._id,
        username: user.username,
        count: exercises.length,
        log: logs,
      });
    }
  } catch (error) {
    console.log(error);
    res.send("Error fetching exercise logs");
  }
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
