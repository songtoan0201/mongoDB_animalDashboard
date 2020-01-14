//require installed modules
let express = require("express");
let mongoose = require("mongoose");
let bodyParser = require("body-parser");
let path = require("path");
let session = require("express-session");
let flash = require("express-flash");

//create express app
const app = express();
// console.log(app);
app.use(
  session({
    secret: "keyboardkitteh",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  })
);

//config (app.set || app.get)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.use(express.static(path.join(__dirname, "./static")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

mongoose.connect("mongodb://localhost/mongoDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const animalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    weight: { type: Number, min: 0, max: 1000 },
    food: { type: Array }
  },
  { timestamps: true }
);

const Animal = mongoose.model("Animal", animalSchema);

app.get("/", (req, res) => {
  Animal.find()
    .then(data => res.render("index", { animals: data }))
    .catch(err => res.json(err));
});

app.get("/animal/new", (req, res) => {
  res.render("new");
});

app.post("/animal", (req, res) => {
  Animal.create(req.body)
    .then(data => {
      console.log(data);
      res.redirect("/");
    })
    .catch(err => {
      console.log("We have an error!", err);
      for (var key in err.errors) {
        req.flash("Error!", err.errors[key].message);
      }
      res.redirect("/animal/new");
    });
});

// show a form to edit an existing animal.
app.get("/animal/edit/:id", (req, res) => {
  console.log(req.params.id);
  Animal.findById(req.params.id)
    .then(data => {
      res.render("edit", { animal: data });
    })
    .catch(err => res.json(err));
});

// delete the animal from the database by ID.
app.get("/animal/destroy/:id", (req, res) => {
  Animal.deleteOne({ _id: req.params.id })
    .then(deletedUser => {
      res.redirect("/");
    })
    .catch(err => res.json(err));
});

// action attribute for the edit form
app.post("/animal/:id", (req, res) => {
  Animal.updateOne(
    { _id: req.params.id },
    {
      name: req.body.name,
      location: req.body.location,
      weight: req.body.weight,
      food: req.body.food
    }
  )
    .then(data => {
      res.redirect("/");
    })
    .catch(err => res.json(err));
});

// Displays information about one animal.
app.get("/animal/:id", (req, res) => {
  console.log(`***********${req.params.id}************`);
  //Animal.findOne({id: req.params.id})
  Animal.findById(req.params.id)
    .then(data => {
      res.render("detail", { animal: data });
    })
    .catch(err => res.json(err));

  //   var animal = Animal.findOne({ _id: req.params.id });
  //   res.render("detail", { animal: animal });
});
//   console.log(`+-+-+-+-+-${animal}-+-+-+-+-+-+-`);

//server listen
app.listen(8000, () => {
  console.log("app is running on port 8000");
});
