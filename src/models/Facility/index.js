const mongoose = require('mongoose');
const _ = require('lodash');
const ObjectId = mongoose.Schema.Types.ObjectId;
/**
 * Place Schema
 */
const FacilitySchema = new mongoose.Schema({
    name : {
      th : {type : String , required : true} ,
      en : {type : String , required : true}
    },
    type : {
        type : String,
        required: true
    },
    place :{
            {
                type:ObjectId,
                ref: 'Place'
            }
        
    },
    location :{
        latitute : {type : Number , required : true} ,
        longtitute : {type : Number , required : true}
    }
  
});

const Facility = mongoose.model('Facility', FacilitySchema);

module.exports = Facility;
