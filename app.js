let express = require("express");
let cors = require("cors");
let app = express();
let multer = require("multer");
let mongoClient = require("mongodb").MongoClient;
let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// let connectionString = "mongodb://127.0.0.1:27017";
let connectionString = "mongodb+srv://rahulkumar:rk@cluster0.ozruczv.mongodb.net/";
let path = require('path');
let jwt = require("jsonwebtoken");
require("dotenv").config();
let port = process.env.PORT || 9090;
const { ObjectId } = require("mongodb");
const { event } = require("jquery");
app.use(bodyParser.json());
app.use(cors());

const secret_key = "admin";

/**
 * @route /
 * @description "This is default route"
 * @method GET
 * @params N/A
 * @return_Type JSON Object
 *
 */
app.get("/", (req, res) => {
  res.send({
    about: "This is Event management of DAV College.",
  });
});

//admin-login

/**
 * @route /admin-login
 * @description "This is admin login route"
 * @method POST
 * @params N/A
 * @return_Type N/A
 *
 */

app.post("/admin-login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  mongoClient.connect(connectionString, (err, clientObject) => {
    if (!err) {
      let dbo = clientObject.db("DavEms");
      dbo
        .collection("adminlogin")
        .find({})
        .toArray((err, documents) => {

          if (!err) {
            if (
              username === documents[0].Admin &&
              password === documents[0].Password
            ) {
              const user = { username: username };
              const token = jwt.sign(user, secret_key);
              res.status(200).json({ token: token, message: 'Login success' });
            } else {
              res.status(401).json({ message: 'Invalid credentials' });
            }
          } else {
            console.error('Error fetching documents:', err);
            res.status(500).json({ message: 'Internal Server Error' });
          }

          // if (!err) {
          //   if (
          //     username === documents[0].Admin &&
          //     password === documents[0].Password
          //   ) {
          //     res.status(200);
          //     console.log("login success");
          //   } else {
          //     res.status(401);
          //     console.log("data does not match");
          //   }
          // }
        });
    }else {
      console.error('Error connecting to the database:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
});

app.get('/protected-resource', (req, res) => {
  // Middleware to check for a valid token
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  jwt.verify(token, secret_key, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });

    // User is authenticated, continue with the protected resource logic
    res.json({ message: 'Access Granted', user: user });
  });
});

// AddDeptAdmin
app.post("/deptAdmin", (req, res) => {
  let department = req.body.department;
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;
  let data = {
    department: department,
    username: username,
    password: password,
    email: email,
  };
  mongoClient.connect(connectionString, (err, clientObject) => {
    if (!err) {
      let dbo = clientObject.db("DavEms");
      dbo.collection("DeptAdmin").insertOne(data, (err, result) => {
        if (!err) {
          console.log("record inserted");
        }
      });
    }
  });
  res.send("data received successfully");
});

//admin dashboard
app.get("/admindashboard", (req, res) => {
  mongoClient.connect(connectionString, (err, clientObject) => {
    if (!err) {
      let dbo = clientObject.db("DavEms");
      dbo
        .collection("DeptAdmin")
        .find({})
        .toArray((err, documents) => {
          if (!err) {
            res.send(documents);
          }
        });
    }
  });
});

//department category route
app.get("/department", (req, res) => {
  mongoClient.connect(connectionString, (err, clientObject) => {
    if (!err) {
      let dbo = clientObject.db("DavEms");
      dbo
        .collection("department")
        .find({})
        .toArray((err, documents) => {
          if (!err) {
            res.send(documents);
          }
        });
    }
  });
});

//department admin login
// app.post("/department/login", (req, res) => {
//   let department = req.body.department;
//   let username = req.body.username;
//   let password = req.body.password;

//   mongoClient.connect(connectionString, (err, clientObject) => {
//     if (!err) {
//       let dbo = clientObject.db("DavEms");
//       dbo
//         .collection("DeptAdmin")
//         .find({ department: department })
//         .toArray((err, documents) => {
//           if (!err) {
//             if (
//               department == documents[0].department &&
//               username == documents[0].username &&
//               password == documents[0].password
//             ) {
//               const user = { username: username };
//               const token = jwt.sign(user, secret_key);
//               res.status(200).json({ token: token, message: 'Login success' });
//             } else {
//               res.status(401).json({ message: 'Invalid credentials' });
//             }
//           }
//         });
//     }
//   });
//   res.send("data received successfully");
// });

app.post('/department/login', (req, res) => {
  const department = req.body.department;
  const username = req.body.username;
  const password = req.body.password;

  mongoClient.connect(connectionString, (err, clientObject) => {
    if (!err) {
      const dbo = clientObject.db('DavEms');
      
      dbo.collection('DeptAdmin').find({ department: department }).toArray((err, documents) => {
        if (!err) {
          if (
            documents.length > 0 &&
            department === documents[0].department &&
            username === documents[0].username &&
            password === documents[0].password
          ) {
            const user = { username: username };
            const token = jwt.sign(user, secret_key);
            res.status(200).json({ token: token, message: 'Login success' });
          } else {
            res.status(401).json({ message: 'Invalid credentials' });
          }
        } else {
          console.error('Error fetching documents:', err);
          res.status(500).json({ message: 'Internal Server Error' });
        }

        // Close the MongoDB connection after processing
        clientObject.close();
      });
    } else {
      console.error('Error connecting to the database:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationPath = path.join('..','public', 'backend', 'images');
    cb(null, destinationPath)
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });



// add department activity
app.post("/department/activity", upload.fields([
    { name: "eventNotice", maxCount: 1 },
    { name: "eventBanner", maxCount: 1 },
    { name: "attendance", maxCount: 1 },
    { name: "eventPic", maxCount: 10 },
    { name: "mediaCoverage", maxCount: 10 },
  ]),
  (req, res) => {
    let data = {
      departent : req.body.departent,
      eventDate: req.body.eventDate,
      eventTime:req.body.eventTime,
      eventNotice: req.files["eventNotice"][0].path,
      eventBanner: req.files["eventBanner"][0].path,
      eventName: req.body.eventName,
      eventVenue: req.body.eventVenue,
      resourcePerson: req.body.resourcePerson,
      briefIntro: req.body.briefIntro,

      eventReport: req.body.eventReport,
      eventRegistration:req.body.eventRegistration 
      // attendance: req.files["attendance"][0].path,
      // eventPic: req.files["eventPic"].map((file) => file.path),
      // mediaCoverage: req.files["mediaCoverage"].map((file) => file.path),
    };
    mongoClient.connect(connectionString, (err, clientObject) => {
      if (!err) {
        let dbo = clientObject.db("DavEms");
        dbo.collection("DeptActivity").insertOne(data, (err, result) => {
          if (!err) {
            console.log("record inserted");
          }
        });
      }
    });
    console.log(req.body, req.file);

    res.send("data received successfully");
  }
);

/**
 * consume api data
 */

app.get("/getEventData", (req, res) => {
  mongoClient.connect(connectionString, (err, clientObject) => {
    if (!err) {
      let dbo = clientObject.db("DavEms");
      dbo
        .collection("DeptActivity")
        .find({})
        .toArray((err, documents) => {
          if (!err) {
            res.send(documents);
          }
        });
    }
  });
});

/**
 * @name: Update admin dashboard
 * @api: /deptAdmin/update
 */

app.get("/deptAdmin/update/:id", (req, res) => {
  let id = req.params.id;
  mongoClient.connect(connectionString, (err, clientObject) => {
    if (!err) {
      let dbo = clientObject.db("DavEms");
      dbo
        .collection("DeptAdmin")
        .find({ _id: ObjectId(id) })
        .toArray((err, documents) => {
          if (!err) {
            res.send(documents);
          }
        });
    }
  });
});
app.put("/deptAdmin/update/:id", (req, res) => {
  let id = req.params.id;
  let username = req.body.username; 
  let password = req.body.password;

  let data = {
    username: username,
    password: password,
  };

  mongoClient.connect(connectionString, (err, clientObject) => {
    if (!err) {
      let dbo = clientObject.db("DavEms");
      dbo
        .collection("DeptAdmin")
        .updateOne({ _id: ObjectId(id) }, { $set: data }, (err, result) => {
          if (!err) {
            if (result.modifiedCount === 1) {
              console.log("Record updated successfully");
              res.status(204).send();
            } else {
              console.log("No matching record found");
              res.status(404).send();
            }
          } else {
            console.error("Error updating record:", err);
            res.status(500).send("Internal Server Error");
          }
        });
    } else {
      console.error("Error connecting to the database:", err);
      res.status(500).send("Internal Server Error");
    }

    // mongoClient.connect(connectionString, (err, clientObject) => {
    //   if (!err) {
    //     let dbo = clientObject.db("DavEms");
    //     dbo
    //       .collection("DeptAdmin")
    //       .updateOne({ _id: ObjectId(id)  }, { $set: data }, (err, result) => {
    //         if (!err) {
    //           console.log("Record updated successfully");
    //           res.status(204).send();
    //         }
    //       });

    //   }

    // });
  });
});

/**
 * @name: delete department admin
 * @api: /deptAdmin/delete
 */

app.get("/deptAdmin/delete/:id", (req, res) => {
  let id = req.params.id;
  mongoClient.connect(connectionString, (err, clientObject) => {
    if (!err) {
      let dbo = clientObject.db("DavEms");
      dbo
        .collection("DeptAdmin")
        .deleteOne({ _id: ObjectId(id) }, (err, result) => {
          if (!err) {
            console.log("record deleted");
            res.status(204).send();
          }
        });
    }
  });
});


/**
 * @route /event/:id
 * @description "This route is use to get single event details based on id"
 * @method GET
 * @params N/A
 * @return_Type JSON Object
 *
 */
app.get('/event/:id',(req,res)=>{
  let id = req.params.id;
  mongoClient.connect(connectionString, (err, clientObject) => {
    if (!err) {
      let dbo = clientObject.db("DavEms");
      dbo
      .collection("DeptActivity")
      .find({ _id: ObjectId(id) })
      .toArray((err, documents) => {
          if (!err) {
            res.send(documents);
          }
        });
    }
  });
})


/**
 * @server : server is running on port(value)
 * @url :http://localhost:port
 */
app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Server is running on port " + port);
  }
});



//update code

// app.post("/department/activity", upload.fields([
//   { name: "eventNotice", maxCount: 1 },
//   { name: "eventBanner", maxCount: 1 },
//   { name: "attendance", maxCount: 1 },
//   { name: "eventPic", maxCount: 10 },
//   { name: "mediaCoverage", maxCount: 10 },
// ]),
// (req, res) => {
//   let data = {
//     departent : req.body.departent,
//     eventDate: req.body.eventDate,
//     eventNotice: req.files["eventNotice"][0].path,
//     eventBanner: req.files["eventBanner"][0].path,
//     eventName: req.body.eventName,
//     resourcePerson: req.body.resourcePerson,
//     briefIntro: req.body.briefIntro,

//     eventReport: req.body.eventReport,
//     attendance: req.files["attendance"][0].path,
//     eventPic: req.files["eventPic"].map((file) => file.path),
//     mediaCoverage: req.files["mediaCoverage"].map((file) => file.path),
//   };
//   mongoClient.connect(connectionString, (err, clientObject) => {
//     if (!err) {
//       let dbo = clientObject.db("DavEms");
//       dbo.collection("DeptActivity").insertOne(data, (err, result) => {
//         if (!err) {
//           console.log("record inserted");
//         }
//       });
//     }
//   });
//   console.log(req.body, req.file);

//   res.send("data received successfully");
// }
// );
