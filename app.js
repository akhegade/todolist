const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname+"/date.js");
const _= require("lodash")
//creating connection to mongodb
//local mongodb connection
// mongoose.connect("mongodb://localhost:27017/todolistDB",{ useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false});

// MongodhAtlas connection
mongoose.connect("mongodb+srv://admin-anil:admin@anil@cluster0-u50l5.mongodb.net/todolistDB",{ useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false});

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function() {
  console.log("databse conncted succefully");
});



const app=express();

// const items=["Buy Food","Cook Food","Eat Food"];
// const workTitles=[];

//used to specify the static folder in the project
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs")

//creating schema for items
const itemsSchema = new mongoose.Schema({
  name:String
})
//creating Model items
const Item =  mongoose.model("Item",itemsSchema)

//creating default items
const item1 = new Item({
  name:"Buy Good Food"
})
const item2 = new Item({
  name:"Cook Food"
})
const item3 = new Item({
  name:"Eat Food"
})

const defaultItems=[item1,item2,item3];

//creting schema for category
const categorySchema = {
  name: String,
  items:[itemsSchema]
}

//creating model for category
const Category = mongoose.model("category",categorySchema)

// Item.insertMany(defaultItems,function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Items added succefully");
//   }
// })



app.get("/",function(req,res){
  let day = "Today";
  // let items=[];
  Item.find({},(err,items)=>{
    if(items.length===0){
      Item.insertMany(defaultItems,{ ordered: false },function(err){
        if(err){
          console.log("Error accured while adding items",err);
        }else{
          console.log("default items added succefully into DB.");
        }
      })
      res.redirect("/")
    }else{
      // console.log(items);
      res.render("list",{listTitle:day,newListItems:items})
    }
  })


})

app.post("/",function(req,res){
  // console.log(req.body);
 //accessing newitem form request
   const itemName=req.body.newItem;
   //accessing category name from request
   const categoryName = req.body.button
   const item = new Item({
     name:itemName
   })

   Category.findOne({name:categoryName},function(err,foundCategory){
     if(!err){
        if(!foundCategory){

           item.save();
           res.redirect("/");
        }
        else{
            foundCategory.items.push(item);
            foundCategory.save();
            res.redirect("/" + categoryName)
          // console.log(foundCategory);
        }
     }
   })

  // if(req.body.button==="Work")
  // {
  //   workTitles.push(item);
  //     res.redirect("/work");
  // }
  // else {
  //
  //   const item = new Item({
  //     name:itemName
  //   })
  // item.save();
  //   res.redirect("/");
  // }
  // res.send(req.body.newItem);
})



app.post("/delete",(req,res)=>{
  console.log(req.body)
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

    if(listName == "Today")
   {
     Item.findByIdAndRemove(checkedItemId,function(err){
       if(err){console.log(err);}
       else{res.redirect("/");}
     })
   }else {
         Category.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,result){
           if(!err){res.redirect("/" + listName)}
         })
   }


})

//old code
// app.get("/work",function(req,res){
//   res.render("list",{listTitle:"Work List",newListItems:workTitles})
// })

app.get("/:categoryName",function(req,res){
  const categoryName = _.capitalize(req.params.categoryName);

 Category.findOne({name:categoryName},function(err,foundtList){
   // if(foundtList.length>0){console.log("exits");}
   // else{console.log("not exits");}
   if(!err){
      if(!foundtList){
        //create new list
        const category = new Category({
          name:categoryName,
          items:defaultItems
        })
        category.save();
        // console.log("Condition true")
        res.redirect("/" +categoryName)
      }
      else{
        //Show an exiting list
        // console.log("Condition false")
        res.render("list",{listTitle:foundtList.name,newListItems:foundtList.items})
        // console.log("exits",foundtList);
      }
   }
 })

  // const category = new Category({
  //   name:categoryName,
  //   items:defaultItems
  // })
  // category.save();

})



app.post("/work",function(req,res){
  let item=req.body.newItem;
  workTitles.push(item);
  res.redirect("/work");
})

app.get("/about",function(req,res){
res.render("about")
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}



app.listen(port,function(){
  console.log("app is server running on :"+port);
})
