var mongoose = require('mongoose');
var Campground = require('./models/campground');
var Comment = require('./models/comment');


var seeds= [
    {
        name: "Mountain",
        image: "https://images.unsplash.com/photo-1571993192866-202f70b7ec7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    {
        name: "Fall",
        image: "https://images.unsplash.com/photo-1572219479068-8a05d5310ba1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    {
        name: "Blue Water",
        image: "https://images.unsplash.com/photo-1571586100127-cdaef780fc61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
];

async function seedDB(){
    try{
        await Campground.remove({});
        console.log("Campground Removed");
        await Comment.remove({});
        console.log("Comment Removed");
       
       
        for(const seed of seeds){
            let campground = await Campground.create(seed);
            console.log("Campground created");
            let comment = await Comment.create({
                text: 'This place is great but i wish there is a toilet',
                author: 'Eliz'

            });
            console.log("Comment created");
            campground.comments.push(comment);
            campground.save();
            console.log("comment added to campground");
        }
        

    }
    catch(err){
        console.log(err);   
    }
  
}
module.exports = seedDB;