const mongoose = require('mongoose');
const _ = require('lodash');
const ObjectId = mongoose.Schema.Types.ObjectId;
/**
 * Place Schema
 */
 const PlaceSchema = new mongoose.Schema({
  code: {
   type : String ,
   required : true
 },
 name : {
  th : {type : String , required : true} ,
  en : {type : String , required : true}
}
location :{
  latitute : {type : Number , required : true} ,
  longtitute : {type : Number , required : true}
}

});




 const Place = mongoose.model('Place', PlaceSchema);

 module.exports = Place;
