const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const Item = require('./data');




const app = express();
const PORT = process.env.PORT || 8080;

// connect to mongoDB
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://demo-username:demo-password@cluster0.qryj7.mongodb.net/node-demo?retryWrites=true&w=majority';
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log("Connection error:", err));

const clientPath = `${__dirname}/client/build`; //`${__dirname}/../client`;
console.log(`Serving static from ${clientPath}`);

app.use(express.static(clientPath));


const server = http.createServer(app);

const io = socketio(server);

io.on('connection', (sock) => {
  console.log('Someone connected');
  sock.emit('message', 'Hi, you are connected');

  sock.on('message', (text) => {
    io.emit('message', text);
  });

  async function creation(text, text1, text2, text3){
    const item = new Item({
      title: text,
      price: text1,
      stock: text3,
      description: text2
    });

    await item.save()
      .then((result) => {
          listing();
          sock.emit("created");
      })
      .catch((err) => {
          console.log("ERROR in create: ", err);
      });
  }

  async function creating(text, text1, text2, text3) {
    await Item.find({title: text})
      .then((result) =>  {
        if (result.length > 0){
          sock.emit("title-exists");
        }
        else{
          creation(text, text1, text2, text3);
        }
      })
      .catch((err) => {
        console.log("Error in finding in create: ", err);
      });
  }

  sock.on('create', (text, text1, text2, text3) => {
    console.log('creating...');
    creating(text, text1, text2, text3);
  });

  // async function deletion(text, text1){
  //   await Item.deleteOne({title: text})
  //   .catch((err) => {
  //     console.log("Error in deleting in update: ", err);
  //   });
  // }

  async function deleting(text, text1) {
    /*Item.find({title: text})
      .then((result) => {
        if (result.length > 0){
          deletion(text, text1);
          listing();
        }
        else{
          sock.emit("title-dne");
        }
      })
      .catch((err) => {
        console.log("Error in finding in delete: ", err);
      });*/
    const res = await Item.updateOne({title: text}, {$set: {deletionComment: text1, deleted: true}})
    .catch((err) => {
      console.log("Error in deleting: ", err);
    });

    if (res.modifiedCount > 0){
      listing();
    }
    else {
      sock.emit("title-dne");
    }
  }

  sock.on('delete', (text, text1) => {
      console.log('deleting...');
      deleting(text, text1);
  });


  async function update(text1, text2, text3, text4, text5){
    await Item.deleteOne({title: text1})
    .catch((err) => {
      console.log("Error in deleting in update: ", err);
    });
    creation(text2, text3, text4, text5);
  }
  

  sock.on('update', (text1, text2, text3, text4, text5) => {
      console.log('updating...');
      Item.find({title: text1})
        .then((result) => {
          if(result.length > 0){
            Item.find({title: text2})
            .then((result2) => {
              if (result2.length > 0){
                sock.emit('title-exists');
              }
              else{
                if (text2 == ""){
                  text2 = result[0].title;
                }
                if (text3 == ""){
                  text3 = result[0].price;
                }
                if (text4 == ""){
                  text4 = result[0].description;
                }
                if (text5 == ""){
                  text5 = result[0].stock;
                }
                update(text1, text2, text3, text4, text5);
              }
            })
            .else((err) => {
              console.log("Error in updating: ", err);
            })
          }
          else {
            sock.emit('title-dne');
          }
        })
        .catch((err) => {
          console.log("Error in updating: ", err)
        });
  });

  sock.on('list', function(){
      listing();
  });

  async function undeleting(text) {
    const res = await Item.updateOne({title: text}, {$set: {deletionComment: "", deleted: false}})
    .catch((err) => {
      console.log("Error in undeleting: ", err);
    });
  
    if (res.modifiedCount > 0){
      listing();
    }
    else {
      sock.emit("title-dne");
    }
  }
  
  sock.on('undelete', (text) => {
      console.log('undeleting...');
      undeleting(text);
  });

  async function listing(){
    await Item.find({deleted: false})
      .then((result) => {
        sock.emit('listed', result);
      })
      .catch((err) => {
          console.log("ERROR in list: ", err);
      });
    
    await Item.find({deleted: true})
      .then((result) => {
        sock.emit('deletedList', result);
      })
      .catch((err) => {
        console.log("ERROR in listing deleted list: ", err);
      });
  }


  listing();

  setInterval(listing, 2000);

});





server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(PORT, () => {
  console.log('RPS started on ', PORT);
});