const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const POST = mongoose.model("POST");

                    //backend API's

// Route post display
router.get("/allpost",requireLogin, (req, res)=>{
    POST.find()
    .populate("postedBy","_id name Photo socketId bio")
    .populate("comments.postedBy","_id name")
    .sort("-createdAt")
    .then(posts=>res.json(posts))
    .catch(err => console.log(err))
    
})

// Route post create
router.post("/createPost",requireLogin,(req,res)=>{
    const {body, pic} = req.body;
    console.log(pic)
    if(!body || !pic){
        return res.status(422).json({error:"please add all the fields"})
    }
    console.log(req.user)
    const post = new POST({
        
        body,
        photo:pic,
        postedBy:req.user
    })
    post.save().then((result)=>{
       return res.json({post:result})
    }).catch(err=>console.log(err))
})

// Route my/personal post
router.get("/myposts", requireLogin,(req, res) => {
    POST.find({postedBy:req.user._id})
    .populate("postedBy", "_id name bio")
    .populate("comments.postedBy","_id name")
    .sort("-createdAt")
   .then(myposts=>{
    res.json({myposts})
   })
})

// Route like
router.put("/like",requireLogin,(req,res)=>{
    POST.findByIdAndUpdate(req.body.postId,{
        $push: {likes:req.user._id}
    },{
        new:true
    }).populate("postedBy", "_id name Photo")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

// Route unlike
router.put("/unlike",requireLogin,(req,res)=>{
    POST.findByIdAndUpdate(req.body.postId,{
        $pull: {likes:req.user._id}
    },{
        new:true
    }).populate("postedBy", "_id name Photo")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

//Route comment
router.put("/comment",requireLogin,(req,res)=>{
    const comment = {
        comment:req.body.text,
        postedBy: req.user._id
    }
    console.log(comment.comment)
    console.log(req.body.postId)

    POST.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}},
    {
        new:true
    })
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name Photo")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

//Api to delete post
router.delete("/deletePost/:postId",requireLogin,(req,res)=>{
    POST.findOne({_id:req.params.postId})
    .populate("postedBy","_id")
    .exec((err, post)=>{
        if(err || !post){
            return res.status(422).json({error: err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
           post.remove()
           .then(result=>{
            return res.json({message: "Successfully Deleted"})
        })
        .catch((err)=>{
            console.log(err)
        })
        }
    })
   
})

//to show following post


router.get("/myfollwingpost", requireLogin, (req, res) => {
    POST.find({ postedBy: { $in: req.user.following } })
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .then(posts => {
            res.json(posts)
            
        })
        .catch(err => { console.log(err) })
})

module.exports = router
