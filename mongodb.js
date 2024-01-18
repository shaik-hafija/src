const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/UserAdmin")
.then(()=>
{
    console.log("db connected")
})
.catch(()=>
{
    console.log("faile connection")
})
const AdminSchema=new mongoose.Schema({
    userid:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    }

})
// const UserSchema=new mongoose.Schema({
//     userid1:{
//         type:String,
//         required:true
//     },

//     password1:{
//         type:String,
//         required:true
//     }

// })
const collection =new mongoose.model("Admin",AdminSchema)
// const collection1 =new mongoose.model("User",UserSchema)

module.exports=collection
// module.exports=collection1