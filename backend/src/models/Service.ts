import {Schema,model} from "mongoose";
const schema=new Schema({name:{type:String,required:true,unique:true},description:String,icon:String,startingPrice:{type:Number,required:true,min:0},emergency:{type:Boolean,default:false},category:String,active:{type:Boolean,default:true}},{timestamps:true});
export default model("Service",schema);