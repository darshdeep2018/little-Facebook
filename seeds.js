var mongoose = require("mongoose");
var Tripplace = require("./models/tripplace");
var Comment   = require("./models/comment");

var data = [
    
]

function seedDB(){
   //Remove all tripplaces
   Tripplace.remove({}, (err)=>{
        if(err){
            console.log(err);
        }
        console.log("removed tripplaces!");
         //add a few tripplaces
        data.forEach((seed)=>{
            Tripplace.create(seed, (err, tripplace)=>{
                if(err){
                    console.log(err)
                } else {
                    console.log("added a tripplace");
                    //create a comment
                    Comment.create(
                        {
                            text: "This place is great, but I wish there was internet",
                            author: "Homer"
                        }, (err, comment)=>{
                            if(err){
                                console.log(err);
                            } else {
                                tripplace.comments.push(comment);
                                tripplace.save();
                                console.log("Created new comment");
                            }
                        });
                }
            });
        });
    }); 
    //add a few comments
}

module.exports = seedDB;
